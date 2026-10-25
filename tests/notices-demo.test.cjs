const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

function harness({available=true,recipients=['p1','p2']}={}){
  const handlers={},requests=[],reviews=[],toasts=[],storage=new Map();
  const people=[{id:'p1',name:'Maya Chen',consent:true},{id:'p2',name:'Noah Kim',consent:false}];
  storage.set('roots-notices-v1',JSON.stringify({drafts:[{id:'manual',channel:'SMS',recipients,message:'Hi {first_name}, would you like another shift?'}]}));
  const bridge={status:{connected:true,testPreview:{available,csrfToken:'test-token'}},activity:{drafts:[]},flush:async()=>{},loadActivity:async()=>{},init:async()=>{},sync(){},async request(url,options){requests.push({url,...options,body:JSON.parse(options.body)});const drafts=requests.at(-1).body.drafts.map((d,i)=>({...d,id:`saved${i}`,sent:false}));bridge.activity.drafts=drafts;return {drafts};}};
  const window={RootsBridge:bridge,RootsChat:{reviewDrafts(drafts){reviews.push(drafts);}},addEventListener(){}};
  const context={window,localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},document:{addEventListener:(type,fn)=>handlers[type]=fn,querySelector(){return null;}},location:{hash:'#notices'}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../dist/notices.js'),'utf8'),context);
  window.RootsNotices.configure({getState:()=>({people,view:'notices'}),esc:String,icon:()=>'',head:()=>'',render(){},toast:msg=>toasts.push(msg)});
  return {bridge,requests,reviews,toasts,people,storage,window,async click(){handlers.click({target:{closest:()=>({dataset:{notice:'review-demo',id:'manual'}})}});await tick();await tick();}};
}

test('manual messages become personalized saved drafts for Telegram review, including missing SMS consent',async()=>{
  const h=harness();await h.click();
  assert.equal(h.requests.length,1);assert.equal(h.requests[0].url,'/api/drafts');
  assert.equal(h.requests[0].headers['X-Roots-Test-Token'],'test-token');
  assert.deepEqual(h.requests[0].body.drafts,[{personId:'p1',channel:'sms',body:'Hi Maya, would you like another shift?'},{personId:'p2',channel:'sms',body:'Hi Noah, would you like another shift?'}]);
  assert.equal(h.reviews.length,1);assert.ok(h.reviews[0].every(d=>d.sent===false));
  assert.ok(h.requests.every(r=>r.url!=='/api/outreach/test'),'preparation does not send');
});

test('reopening a manual plan reuses saved draft identity and avoids duplicate creation',async()=>{
  const h=harness();await h.click();await h.click();
  assert.equal(h.requests.length,1);assert.equal(h.reviews.length,2);
  h.window.RootsNotices.openTab('drafts');
  assert.match(h.window.RootsNotices.render(),/1 draft · No volunteer messages sent/);
  assert.doesNotMatch(h.window.RootsNotices.render(),/Assistant draft/);
});

test('unavailable demo delivery, missing people and oversized groups cannot prepare an external plan',async()=>{
  const unavailable=harness({available:false});await unavailable.click();assert.equal(unavailable.requests.length,0);
  const removed=harness();removed.people.pop();await removed.click();assert.equal(removed.requests.length,0);assert.match(removed.toasts[0],/no longer/);
  const oversized=harness({recipients:Array(11).fill('p1')});await oversized.click();assert.equal(oversized.requests.length,0);assert.match(oversized.toasts[0],/1 and 10/);
});

test('sync failures preserve the local draft and never create or deliver a message',async()=>{
  const h=harness();h.bridge.flush=async()=>{throw Error('Sync unavailable');};await h.click();
  assert.equal(h.requests.length,0);assert.equal(h.reviews.length,0);assert.equal(h.toasts[0],'Sync unavailable');
  assert.equal(JSON.parse(h.storage.get('roots-notices-v1')).drafts[0].message,'Hi {first_name}, would you like another shift?');
});

test('an expired session refreshes once and requires an explicit retry before creating a plan',async()=>{
  const h=harness();let refreshed=0;h.bridge.init=async()=>{refreshed++;};
  h.bridge.request=async()=>{const error=Error('Expired');error.status=403;throw error;};await h.click();
  assert.equal(refreshed,1);assert.equal(h.reviews.length,0);assert.match(h.toasts[0],/Choose Review demo again/);
});
