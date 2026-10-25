// Client regressions run the actual browser modules against a tiny DOM and fake HTTP.
// Timers are controlled by the test; no browser, network, or provider calls are made.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const tick = () => new Promise(resolve => setImmediate(resolve));
const response = (status, body) => ({status, ok: status >= 200 && status < 300, json: async () => body});
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return {promise, resolve};
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(callback);
    },
    dispatchEvent(event) { for (const callback of listeners.get(event.type) || []) callback(event); }
  };
}

function harness() {
  const state = {view:'briefing', people:[], events:[], saved:[], activity:[]};
  const timers = new Map(), intervals = new Map(), storage = new Map(), requests = [];
  const insightPlans = [], chatPlans = [];
  let timerId = 0, version = 1;
  const document = {...eventTarget(), hidden:false, activeElement:null, querySelectorAll:() => []};
  function node(id) {
    return {id, innerHTML:'', textContent:'', value:'', style:{}, scrollHeight:60,
      classList:{toggle() {}}, querySelector:() => null, closest:() => null,
      focus() { document.activeElement = this; }, scrollIntoView() {}};
  }
  const nodes = new Map(['briefing-status', 'briefing-coverage', 'briefing-insights', 'roots-conversation-input', 'chat-transcript', 'chat-connection', 'chat-composer-note'].map(id => [id, node(id)]));
  const selectors = new Map(['.conversation-column', '.chat-send', '[data-chat=new]', '.chat-composer-dock'].map(selector => [selector, node(selector)]));
  document.getElementById = id => nodes.get(id) || null;
  document.querySelector = selector => selectors.get(selector) || null;
  const window = {
    ...eventTarget(),
    RootsPeople:{profileData:person => person},
    RootsOpportunities:{list:() => [], projects:() => []},
    RootsNotices:{notices:() => [], workflows:() => []}
  };
  const location = {hash:''};
  async function fetch(url, options = {}) {
    const request = {url, method:options.method || 'GET', body:options.body ? JSON.parse(options.body) : null};
    requests.push(request);
    if (url === '/api/status') return response(200, {connected:true, geminiConfigured:true});
    if (url === '/api/state') return response(200, {version:request.method === 'PUT' ? ++version : version, state:{}});
    if (url === '/api/activity') return response(200, {activity:[], drafts:[]});
    if (url === '/api/insights' || url === '/api/insights/refresh') {
      return insightPlans.length ? insightPlans.shift()(request) : response(200, {insights:[], source:'snapshot-rules', generation:{status:'ready'}});
    }
    if (url === '/api/chat') {
      return chatPlans.length ? chatPlans.shift()(request) : response(200, {reply:'Follow-up received.', conversationId:'conversation-test', drafts:[]});
    }
    throw new Error(`Unexpected fake request: ${request.method} ${url}`);
  }
  const context = vm.createContext({window, document, location, fetch,
    localStorage:{getItem:key => storage.get(key) || null, setItem:(key, value) => storage.set(key, value)},
    CustomEvent:class { constructor(type) { this.type = type; } },
    setTimeout(callback, delay) { timers.set(++timerId, {callback, delay}); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    setInterval(callback, delay) { intervals.set(++timerId, {callback, delay}); return timerId; }
  });
  for (const filename of ['journal.js', 'bridge-client.js', 'briefing.js', 'conversation.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist', filename), 'utf8'), context, {filename});
  }
  const api = {getState:() => state, esc:escape, icon:() => '', render() {}, toast() {}};
  window.RootsBridge.configure(api);
  window.RootsBriefing.configure(api);
  window.RootsChat.configure(api);
  return {window, document, state, location, nodes, storage, requests, insightPlans, chatPlans, timers,
    chats:() => requests.filter(r => r.url === '/api/chat'),
    runTimeouts() {
      const pending = [...timers.values()];
      timers.clear();
      for (const {callback} of pending) callback();
    },
    event(type, target) { document.dispatchEvent({type, target, preventDefault() {}}); }
  };
}

test('failed insight polling keeps cached cards, stops reviewing animation and timer, and offers retry', async () => {
  const h = harness();
  const cached = {insights:[{id:'garden', title:'A garden invitation', summary:'A recorded opportunity to reconnect.', evidence:[], sourceIds:{}}], source:'gemini-synthesis', hasPreviousBriefing:true, generation:{status:'reviewing'}};
  h.insightPlans.push(() => response(200, cached), () => response(503, {error:'Review connection lost.'}));
  await h.window.RootsBridge.init();

  assert.equal(h.timers.size, 1);
  assert.equal([...h.timers.values()][0].delay, 2000);
  assert.match(h.nodes.get('briefing-status').innerHTML, /is-reviewing/);
  h.runTimeouts();
  await tick();

  assert.equal(h.window.RootsBridge.insights.generation.status, 'reviewing', 'a network failure retains the previous server envelope');
  assert.equal(h.window.RootsBridge.insightError, 'Review connection lost.');
  assert.equal(h.timers.size, 0, 'the cached reviewing status must not schedule another poll after failure');
  const markup = h.nodes.get('briefing-status').innerHTML;
  assert.match(markup, /Try again/);
  assert.match(markup, /Your last briefing is still here/);
  assert.doesNotMatch(markup, /is-reviewing|briefing-scan|disabled/);
  assert.match(h.nodes.get('briefing-insights').innerHTML, /A garden invitation/);

  h.insightPlans.push(() => response(200, {...cached, generation:{status:'ready'}}));
  const retry = {dataset:{briefing:'refresh'}, closest:selector => selector === '[data-briefing]' ? retry : null};
  h.event('click', retry);
  await tick();
  assert.equal(h.window.RootsBridge.insightError, null);
  assert.equal(h.requests.filter(r => r.url === '/api/insights/refresh').length, 1);
  assert.equal(h.timers.size, 0);
  assert.doesNotMatch(h.nodes.get('briefing-status').innerHTML, /Try again|is-reviewing/);
});

test('a briefing prompt submitted during a pending chat survives the handoff and the arriving reply', async () => {
  const h = harness();
  await h.window.RootsBridge.init();
  const pending = deferred();
  h.chatPlans.push(() => pending.promise);
  h.state.view = 'chat';
  h.window.RootsChat.ask('Which event suits Maya?');
  await tick();
  assert.equal(h.chats().length, 1);

  h.state.view = 'briefing';
  const nextPrompt = 'Help me review the garden invitation.';
  h.event('input', {id:'briefing-prompt', value:nextPrompt, closest:() => null});
  h.event('submit', {id:'briefing-chat-form', matches:() => false});
  let saved = JSON.parse(h.storage.get('roots-conversation-v1'));
  assert.equal(h.location.hash, 'chat');
  assert.equal(saved.composer, nextPrompt);
  assert.equal(saved.messages.length, 1);
  assert.equal(h.chats().length, 1, 'the second prompt waits in the composer instead of being lost or sent concurrently');

  h.state.view = 'chat';
  pending.resolve(response(200, {reply:'The garden event fits the recorded interest.', conversationId:'conversation-test', drafts:[]}));
  await tick();
  saved = JSON.parse(h.storage.get('roots-conversation-v1'));
  assert.equal(saved.composer, nextPrompt, 'finishing the earlier request must not clear the handoff prompt');
  assert.equal(saved.messages.length, 2);
  assert.match(h.window.RootsChat.render(), /Help me review the garden invitation\./);

  h.event('submit', {id:'roots-conversation-form', matches:() => false});
  await tick();
  assert.equal(h.chats().length, 2);
  assert.equal(h.chats()[1].body.message, nextPrompt);
  assert.equal(h.chats()[1].body.conversationId, 'conversation-test');
});
