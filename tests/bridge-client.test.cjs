// Browser bridge contract tests. All HTTP calls use an in-memory fake server.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dist/bridge-client.js'), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const response = (status, body) => ({status, ok: status >= 200 && status < 300, json: async () => body});
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return {promise, resolve};
};

function harness() {
  const state = {
    view: 'overview',
    people: [{id: 'p01', name: 'Maya Chen', visits: 1, consent: true}],
    events: [], saved: [], activity: []
  };
  const server = {version: 1, state: {}, activity: {activity: [], drafts: []}};
  const requests = [], events = [], timers = new Map(), listeners = new Map();
  const putPlans = [];
  let timerId = 0, activePuts = 0, maxActivePuts = 0;
  const window = {
    RootsPeople: {profileData: person => person},
    RootsOpportunities: {list: () => [], projects: () => []},
    RootsNotices: {notices: () => [], workflows: () => []},
    addEventListener(name, callback) { listeners.set(name, callback); },
    dispatchEvent(event) { events.push(event.type); listeners.get(event.type)?.(event); }
  };
  async function fetch(url, options = {}) {
    const request = {url, method: options.method || 'GET', body: options.body ? JSON.parse(options.body) : null};
    requests.push(request);
    if (url === '/api/status') return response(200, {connected: true, geminiConfigured: true});
    if (url === '/api/activity') return response(200, server.activity);
    if (url === '/api/state' && request.method === 'GET') return response(200, {version: server.version, state: server.state});
    if (url === '/api/state' && request.method === 'PUT') {
      activePuts++;
      maxActivePuts = Math.max(maxActivePuts, activePuts);
      try {
        const planned = await putPlans.shift()?.(request);
        if (planned) return planned;
        if (request.body.baseVersion !== server.version) {
          return response(409, {error: 'The shared state changed. Fetch it before saving again.'});
        }
        server.state = request.body.state;
        return response(200, {version: ++server.version, state: server.state});
      } finally { activePuts--; }
    }
    if (url === '/api/chat') return response(200, {reply: 'Snapshot received.', snapshotVersion: server.version});
    throw new Error(`Unexpected request: ${request.method} ${url}`);
  }
  vm.runInNewContext(source, {
    window, fetch,
    CustomEvent: class { constructor(type) { this.type = type; } },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); }
  }, {filename: 'bridge-client.js'});
  const bridge = window.RootsBridge;
  bridge.configure({getState: () => state, render() {}});
  return {
    bridge, state, server, requests, events, putPlans,
    get maxActivePuts() { return maxActivePuts; },
    get timerCount() { return timers.size; },
    puts: () => requests.filter(request => request.method === 'PUT'),
    chats: () => requests.filter(request => request.url === '/api/chat'),
    runTimers() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach(callback => callback());
    }
  };
}

test('a stale version is fetched and retried using the actual server conflict response', async () => {
  const h = harness();
  await h.bridge.init();
  h.server.version++; // Another client saved after this page synchronized.
  h.state.people[0].name = 'Updated Maya';
  const start = h.requests.length;

  await h.bridge.flush();

  assert.deepEqual(h.requests.slice(start).map(r => [r.method, r.url, r.body?.baseVersion]), [
    ['PUT', '/api/state', 2], ['GET', '/api/state', undefined], ['PUT', '/api/state', 3]
  ]);
  assert.equal(h.server.state.people[0].name, 'Updated Maya');
  assert.equal(h.bridge.status.syncError, null);
  await h.bridge.flush();
  assert.equal(h.puts().at(-1).body.baseVersion, 4);
});

test('overlapping saves and chat synchronization never issue concurrent state writes', async () => {
  const h = harness();
  await h.bridge.init();
  const gates = [deferred(), deferred(), deferred()];
  h.putPlans.push(...gates.map(gate => async () => { await gate.promise; }));
  const start = h.requests.length;

  const first = h.bridge.flush();
  await tick();
  h.state.people[0].name = 'Edited while a save is pending';
  const second = h.bridge.flush();
  const chat = h.bridge.chat('Tell me about Maya.');
  await tick();
  assert.equal(h.puts().length, 2, 'only the initial save and first queued save have started');
  assert.equal(h.chats().length, 0, 'chat must wait for its own successful snapshot');

  gates[0].resolve();
  await first;
  await tick();
  assert.equal(h.puts().length, 3);
  assert.equal(h.puts().at(-1).body.state.people[0].name, 'Edited while a save is pending');
  assert.equal(h.chats().length, 0);
  gates[1].resolve();
  await second;
  await tick();
  assert.equal(h.puts().length, 4);
  assert.equal(h.chats().length, 0);
  gates[2].resolve();
  const result = await chat;

  assert.equal(h.maxActivePuts, 1);
  assert.equal(result.snapshotVersion, 5);
  assert.deepEqual(h.requests.slice(start).map(r => [r.method, r.url]), [
    ['PUT', '/api/state'], ['PUT', '/api/state'], ['PUT', '/api/state'], ['POST', '/api/chat']
  ]);
  assert.deepEqual(h.puts().slice(1).map(r => r.body.baseVersion), [2, 3, 4]);
});

test('chat flushes and cancels a pending debounced save without sending an extra write', async () => {
  const h = harness();
  await h.bridge.init();
  h.state.people[0].name = 'Newest local change';
  h.bridge.sync();
  h.bridge.sync();
  assert.equal(h.timerCount, 1);

  await h.bridge.chat('Read the latest profile.');
  h.runTimers();
  await tick();

  assert.equal(h.timerCount, 0);
  assert.equal(h.puts().length, 2);
  assert.equal(h.server.state.people[0].name, 'Newest local change');
  assert.equal(h.chats().length, 1);
});

test('failed sync prevents chat, exposes the error, and does not poison later saves', async () => {
  const h = harness();
  await h.bridge.init();
  h.putPlans.push(() => response(503, {error: 'Snapshot storage is temporarily unavailable.'}));

  await assert.rejects(h.bridge.chat('Draft a message.'), error => error.status === 503);
  assert.equal(h.chats().length, 0);
  assert.equal(h.bridge.status.syncError, 'Snapshot storage is temporarily unavailable.');
  assert.equal(h.events.at(-1), 'roots:connection');

  h.state.people[0].name = 'Maya after recovery';
  await h.bridge.chat('Try again with the latest record.');
  assert.equal(h.chats().length, 1);
  assert.equal(h.bridge.status.syncError, null);
  assert.equal(h.server.state.people[0].name, 'Maya after recovery');
  assert.equal(h.maxActivePuts, 1);
});

test('a second conflict stops the retry loop and a later chat can recover', async () => {
  const h = harness();
  await h.bridge.init();
  h.server.version++;
  // Another writer wins again after the recovery GET and before the retry PUT.
  h.putPlans.push(() => undefined, () => { h.server.version++; });
  const start = h.requests.length;

  await assert.rejects(h.bridge.chat('Read the dashboard.'), error => error.status === 409);
  assert.deepEqual(h.requests.slice(start).map(r => [r.method, r.url]), [
    ['PUT', '/api/state'], ['GET', '/api/state'], ['PUT', '/api/state']
  ]);
  assert.equal(h.chats().length, 0);
  assert.match(h.bridge.status.syncError, /shared state changed/);

  await h.bridge.chat('Read it now.');
  assert.equal(h.chats().length, 1);
  assert.equal(h.bridge.status.syncError, null);
});

test('a failed background save remains visible and the next debounced save recovers', async () => {
  const h = harness();
  await h.bridge.init();
  h.putPlans.push(() => { throw new Error('Network connection lost.'); });
  h.bridge.sync();
  h.runTimers();
  await tick();
  assert.equal(h.bridge.status.syncError, 'Network connection lost.');

  h.state.saved = ['o01'];
  h.bridge.sync();
  h.runTimers();
  await tick();
  assert.equal(h.bridge.status.syncError, null);
  assert.deepEqual(h.server.state.saved, ['o01']);
});
