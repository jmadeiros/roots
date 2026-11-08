const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const vm=require('node:vm');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const first='a'.repeat(32), second='b'.repeat(32);
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const makeDraft=(id, personId, name)=>({id,personId,personName:name,channel:'sms',body:`Hi ${name}, would you like to volunteer again?`,sent:false,status:'draft',contactConsent:true,phone:null,readiness:{canSend:false,blockers:[{code:'PHONE_MISSING',message:'No phone number is recorded.'},{code:'DELIVERY_NOT_CONNECTED',message:'SMS delivery is not connected.'}]}});
function harness({connected=true,drafts=[makeDraft(first,'p01','Maya'),makeDraft(second,'p02','Leo')],preview=true,storage:stored}={}) {
  const listeners=new Map(),windowListeners=new Map(),storage=stored||new Map(),requests=[],toasts=[],calls={init:0,activity:0,chats:[]};let identifier=0;
  const state={view:'chat',people:[{id:'p01',name:'Maya',visits:1,consent:true},{id:'p02',name:'Leo',visits:1,consent:false},{id:'p03',name:'Ari',visits:2,consent:true}]};
  const node=id=>({id,value:'',innerHTML:'',textContent:'',style:{},scrollHeight:60,classList:{toggle(){}},closest:()=>null,focus(){},scrollIntoView(){}});
  const nodes=new Map(['roots-conversation-input','chat-transcript','chat-connection','chat-composer-note'].map(id=>[id,node(id)]));
  const document={activeElement:null,getElementById:id=>nodes.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);}};
  const bridge={status:connected?{connected:true,geminiConfigured:true,testPreview:{available:preview,csrfToken:'test-csrf',reason:preview?null:'Dedicated Roots bot needed'}}:null,activity:{drafts:[]},async loadActivity(){calls.activity++;},async init(){calls.init++;},async chat(text,conversationId){calls.chats.push({text,conversationId});bridge.activity.drafts=drafts;return {reply:'Here are the messages to review.',drafts,conversationId:'chat-test'};},async request(url,options){requests.push({url,...options,body:JSON.parse(options.body)});if(url.endsWith('/edit')){const id=url.split('/')[3],draft=bridge.activity.drafts.find(d=>d.id===id);return {draft:{...draft,body:JSON.parse(options.body).body}};}if(url==='/api/outreach/test')return {testPreview:{id:'receipt',status:'sent',botUsername:'roots_example_bot',recipient:'Your Telegram chat',sentAt:'2026-10-24T12:00:00Z',deliveredToVolunteers:false}};throw Error('Unexpected request');}};
  const window={RootsBridge:bridge,RootsPeople:{profileData:p=>p},addEventListener(type,fn){if(!windowListeners.has(type))windowListeners.set(type,[]);windowListeners.get(type).push(fn);}};
  const context=vm.createContext({window,document,location:{hash:'#chat'},crypto:{randomUUID:()=>`12345678-1234-1234-1234-${String(++identifier).padStart(12,'0')}`},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/conversation.js'),'utf8'),context);
  window.RootsChat.configure({getState:()=>state,esc:escape,icon:()=>'',render(){nodes.get('chat-transcript').innerHTML=window.RootsChat.render();},toast:message=>toasts.push(message),showPerson(){},openDialog(){}});
  async function event(type,target){await Promise.all((listeners.get(type)||[]).map(fn=>fn({target,preventDefault(){}})));}
  async function click(action,id,extra={}){const button={disabled:false,dataset:{chat:action,id,...extra}};await event('click',{closest:selector=>selector==='[data-chat]'?button:null});}
  function editForm(id,flowId){const status=node('status'),submit=node('submit'),count=node('count');return {id:'edit-form',dataset:{draftId:id,flowId},matches:selector=>selector==='.chat-edit-form',closest:()=>null,querySelectorAll:()=>[],querySelector:selector=>selector==='.chat-edit-error'?status:selector==='[type=submit]'?submit:count};}
  async function enterDraft(id,flowId,value){const form=editForm(id,flowId);await event('input',{id:`edit-${id}`,name:'body',value,closest:selector=>selector==='.chat-edit-form'?form:null});return form;}
  return {window,state,bridge,requests,nodes,toasts,calls,storage,event,click,enterDraft,emit(type){for(const listener of windowListeners.get(type)||[])listener({type});},html:()=>window.RootsChat.render(),saved:()=>JSON.parse(storage.get('roots-conversation-v1')),async start(){window.RootsChat.ask('Prepare SMS drafts.');await tick();}};
}

test('draft replies become one staged plan with selectable people and escaped records',async()=>{
  const h=harness({drafts:[makeDraft(first,'p01','<img src=x onerror=alert(1)>'),makeDraft(second,'p02','Leo')]});
  await h.start();const markup=h.html();
  assert.equal((markup.match(/class="chat-workbench"/g)||[]).length,1);
  assert.match(markup,/Who should receive this/);assert.match(markup,/2 of 2 selected/);
  assert.match(markup,/&lt;img src=x onerror=alert\(1\)&gt;/);assert.doesNotMatch(markup,/<img/);
  await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:false});
  await h.click('flow-step',first,{step:'message'});
  assert.match(h.html(),/One personal message/);assert.doesNotMatch(h.html(),/<option/);
  await h.click('flow-step',first,{step:'review'});
  assert.match(h.html(),/1 recipient/);assert.match(h.html(),/SMS delivery is not connected/);
  assert.match(h.html(),/<button class="button" disabled>Send message/);
});

test('unsaved message changes block review, then persist through the real edit endpoint',async()=>{
  const h=harness();await h.start();h.html();await h.click('flow-step',first,{step:'message'});
  const form=await h.enterDraft(first,first,'Hi Maya, would Tuesday work?');
  await h.click('flow-step',first,{step:'review'});
  assert.match(h.html(),/Make the message yours/);assert.match(h.html(),/Save your changes before review/);
  await h.event('submit',form);
  assert.equal(h.requests[0].url,`/api/drafts/${first}/edit`);
  assert.equal(h.requests[0].body.body,'Hi Maya, would Tuesday work?');
  await h.click('flow-step',first,{step:'review'});
  assert.match(h.html(),/Hi Maya, would Tuesday work\?/);
  assert.equal(h.saved().messages[1].drafts[0].sent,false);
});

test('Telegram tests use selected saved drafts and the CSRF contract, keep SMS unsent, and do not duplicate a receipt',async()=>{
  const h=harness();await h.start();h.html();
  await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:false});
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);await h.click('test-preview',first);
  assert.equal(h.requests.length,1);assert.equal(h.requests[0].url,'/api/outreach/test');
  assert.equal(h.requests[0].headers['X-Roots-Test-Token'],'test-csrf');
  assert.deepEqual(h.requests[0].body.draftIds,[first]);assert.match(h.requests[0].body.requestId,/^[a-f0-9]{32}$/);
  assert.match(h.html(),/Preview sent to your Telegram/);assert.match(h.html(),/volunteers did not receive an SMS/);
  assert.equal(h.saved().messages[1].drafts[0].sent,false);
});

test('uncertain Telegram results stop without automatic retry or a second click send',async()=>{
  const h=harness();await h.start();h.html();
  h.bridge.request=async(url,options)=>{h.requests.push({url,options});throw Error('Connection lost after dispatch.');};
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);await h.click('test-preview',first);
  assert.equal(h.requests.length,1);assert.match(h.html(),/Telegram preview was not confirmed/);
  assert.match(h.html(),/There is no automatic retry/);assert.match(h.html(),/Connection lost after dispatch/);
});

test('browser sample is explicitly a template, edits locally, and cannot send even with a configured test transport',async()=>{
  const h=harness();h.window.RootsChat.preview();h.html();
  const drafts=h.saved().messages[1].drafts,id=drafts[0].id;
  assert.equal(drafts.length,2);assert.match(h.html(),/template from your records, not a live AI response/);
  assert.match(h.html(),/Sample plan · Saved in this browser/);assert.match(h.html(),/Permission needs checking/);
  await h.click('flow-step',id,{step:'message'});
  const form=await h.enterDraft(id,id,'A local sample revision.');await h.event('submit',form);
  await h.click('flow-step',id,{step:'review'});await h.click('test-preview',id);
  assert.equal(h.requests.length,0);assert.match(h.html(),/A local sample revision/);assert.match(h.html(),/browser-only sample/);
  assert.equal(h.saved().messages[1].drafts[0].sent,false);
});

test('unavailable dedicated bot and empty recipient selection both prevent test delivery',async()=>{
  const h=harness({preview:false});await h.start();h.html();await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.equal(h.requests.length,0);assert.match(h.html(),/Dedicated Roots bot needed/);
  await h.event('change',{dataset:{chatRecipient:first,flow:first},checked:false});await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:false});
  await h.click('test-preview',first);assert.equal(h.requests.length,0);
});

test('an in-flight duplicate can read the final activity receipt without posting another preview',async()=>{
  const h=harness();await h.start();h.html();
  h.bridge.request=async(url,options)=>{h.requests.push({url,options});return {testPreview:{id:'existing-request',status:'sending',duplicate:true}};};
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.match(h.html(),/Preview is already in progress/);assert.match(h.html(),/existing request is still running/);
  h.bridge.activity.activity=[{kind:'telegram_test_preview',id:'existing-request',status:'sent',sentAt:'2026-10-24T12:00:00Z',deliveredToVolunteers:false}];
  await h.click('check-receipt',first);
  assert.match(h.html(),/Showing the existing delivery receipt/);assert.match(h.html(),/Preview sent to your Telegram/);assert.equal(h.requests.length,1);
});

test('an otherwise connected plan cannot preview an empty audience or skip its review step',async()=>{
  const h=harness();await h.start();h.html();
  await h.click('test-preview',first);
  assert.equal(h.requests.length,0,'no delivery action before review');
  await h.event('change',{dataset:{chatRecipient:first,flow:first},checked:false});
  await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:false});
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.match(h.html(),/Select at least one person/);assert.equal(h.requests.length,0);
});

test('the ten-draft preview limit never silently truncates or includes an excluded recipient',async()=>{
  const drafts=Array.from({length:11},(_,index)=>makeDraft((index+1).toString(16).padStart(32,'0'),`p${index}`,`Person ${index}`));
  const h=harness({drafts});await h.start();h.html();const id=drafts[0].id;
  await h.click('flow-step',id,{step:'review'});await h.click('test-preview',id);
  assert.equal(h.requests.length,0);assert.match(h.html(),/Select 10 or fewer/);
  await h.click('flow-step',id,{step:'people'});
  await h.event('change',{dataset:{chatRecipient:drafts[4].id,flow:id},checked:false});
  await h.click('flow-step',id,{step:'review'});await h.click('test-preview',id);
  assert.deepEqual(h.requests[0].body.draftIds,drafts.filter((_,index)=>index!==4).map(d=>d.id));
});

test('separate recipient edits survive switching, and every selected unsaved message blocks review',async()=>{
  const h=harness();await h.start();h.html();await h.click('flow-step',first,{step:'message'});
  const formA=await h.enterDraft(first,first,'Maya revised invitation.');
  await h.event('change',{dataset:{flow:first},value:second,matches:selector=>selector==='[data-chat-active-draft]'});
  const formB=await h.enterDraft(second,first,'Leo revised invitation.');await h.event('submit',formB);
  assert.equal(h.requests[0].url,`/api/drafts/${second}/edit`);
  await h.click('flow-step',first,{step:'review'});assert.match(h.html(),/Make the message yours/);
  await h.event('change',{dataset:{flow:first},value:first,matches:selector=>selector==='[data-chat-active-draft]'});
  assert.match(h.html(),/Maya revised invitation/);await h.event('submit',formA);
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.deepEqual(h.requests.filter(r=>r.url.endsWith('/edit')).map(r=>[r.url,r.body.body]),[[`/api/drafts/${second}/edit`,'Leo revised invitation.'],[`/api/drafts/${first}/edit`,'Maya revised invitation.']]);
  assert.deepEqual(h.requests.at(-1).body.draftIds,[first,second]);
  assert.match(h.html(),/Maya revised invitation/);assert.match(h.html(),/Leo revised invitation/);
});

test('a failed draft save keeps the edited text and blocks test delivery until an explicit successful save',async()=>{
  const h=harness();await h.start();h.html();await h.click('flow-step',first,{step:'message'});
  const originalRequest=h.bridge.request;
  h.bridge.request=async(url,options)=>{if(url.endsWith('/edit')){h.requests.push({url,body:JSON.parse(options.body)});throw Error('Draft storage is temporarily unavailable.');}return originalRequest(url,options);};
  const form=await h.enterDraft(first,first,'Keep this unsaved revision.');await h.event('submit',form);
  assert.match(h.html(),/Keep this unsaved revision/);assert.match(h.html(),/Draft storage is temporarily unavailable/);
  assert.equal(h.saved().messages[1].drafts[0].body,'Hi Maya, would you like to volunteer again?');
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.equal(h.requests.filter(r=>r.url==='/api/outreach/test').length,0);
  h.bridge.request=originalRequest;await h.event('submit',form);await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.equal(h.requests.filter(r=>r.url==='/api/outreach/test').length,1);assert.match(h.html(),/Keep this unsaved revision/);
});

test('a blank edit is rejected locally and never overwrites a saved draft',async()=>{
  const h=harness();await h.start();h.html();await h.click('flow-step',first,{step:'message'});
  const form=await h.enterDraft(first,first,'   ');await h.event('submit',form);
  assert.equal(form.querySelector('.chat-edit-error').textContent,'Write a message before saving.');
  assert.equal(h.requests.length,0);assert.equal(h.saved().messages[1].drafts[0].body,'Hi Maya, would you like to volunteer again?');
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);assert.equal(h.requests.length,0);
});

test('excluding a dirty draft previews only saved selected content, and reselecting it requires saving',async()=>{
  const h=harness();await h.start();h.html();await h.click('flow-step',first,{step:'message'});
  await h.enterDraft(second,first,'An unsaved Leo draft.');await h.click('flow-step',first,{step:'people'});
  await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:false});await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.deepEqual(h.requests[0].body.draftIds,[first]);
  await h.click('flow-step',first,{step:'people'});await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:true});
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);assert.equal(h.requests.length,1);
});

test('a pending preview ignores rapid repeated clicks and audience changes until its receipt arrives',async()=>{
  const h=harness();await h.start();h.html();const gate=deferred();
  h.bridge.request=async(url,options)=>{h.requests.push({url,body:JSON.parse(options.body)});return gate.promise;};
  await h.click('flow-step',first,{step:'review'});const sending=h.click('test-preview',first);await tick();
  await h.click('test-preview',first);await h.click('new');
  await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:false});
  assert.equal(h.requests.length,1);assert.equal(h.saved().messages.length,2);assert.deepEqual(h.saved().messages[1].workbench.selected,[first,second]);
  gate.resolve({testPreview:{id:h.requests[0].body.requestId,status:'sent',deliveredToVolunteers:false}});await sending;
  assert.match(h.html(),/Preview sent to your Telegram/);assert.equal(h.requests.length,1);
});

test('a reload during preview dispatch restores its pending state and reconciles a completed receipt without resending',async()=>{
  const h=harness();await h.start();h.html();const gate=deferred();
  h.bridge.request=async(url,options)=>{h.requests.push({url,body:JSON.parse(options.body)});return gate.promise;};
  await h.click('flow-step',first,{step:'review'});const pending=h.click('test-preview',first);await tick();
  const request=h.requests[0].body.requestId,reloaded=harness({storage:h.storage});
  assert.match(reloaded.html(),/Preview is already in progress/);
  await reloaded.click('test-preview',first);assert.equal(reloaded.requests.length,0);
  reloaded.bridge.activity.activity=[{kind:'telegram_test_preview',id:request,status:'sent',deliveredToVolunteers:false}];reloaded.emit('roots:activity');
  assert.match(reloaded.html(),/Preview sent to your Telegram/);assert.equal(reloaded.requests.length,0);
  gate.resolve({testPreview:{id:request,status:'sent',deliveredToVolunteers:false}});await pending;
});

test('a lost response can later reconcile the matching server receipt without retrying the send',async()=>{
  const h=harness();await h.start();h.html();
  h.bridge.request=async(url,options)=>{h.requests.push({url,body:JSON.parse(options.body)});throw Error('Network response lost.');};
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  const requestId=h.requests[0].body.requestId;
  h.bridge.activity.activity=[{kind:'telegram_test_preview',id:'different-request',status:'sent'}];h.emit('roots:activity');assert.match(h.html(),/not confirmed/);
  h.bridge.activity.activity.push({kind:'telegram_test_preview',id:requestId,status:'sent',deliveredToVolunteers:false});h.emit('roots:activity');
  assert.match(h.html(),/Preview sent to your Telegram/);await h.click('test-preview',first);assert.equal(h.requests.length,1);
});

test('a stale CSRF rejection refreshes the connection once and needs a new explicit click',async()=>{
  const h=harness();await h.start();h.html();const original=h.bridge.request;
  h.bridge.request=async(url,options)=>{h.requests.push({url,headers:options.headers,body:JSON.parse(options.body)});const error=Error('Session expired before dispatch.');error.status=403;throw error;};
  h.bridge.init=async()=>{h.calls.init++;h.bridge.status.testPreview.csrfToken='fresh-csrf';};
  await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  assert.equal(h.requests.length,1);assert.equal(h.calls.init,1);assert.match(h.html(),/Review the messages and try again/);
  const requestId=h.requests[0].body.requestId;h.bridge.request=original;await h.click('test-preview',first);
  assert.equal(h.requests.length,2);assert.equal(h.requests[1].headers['X-Roots-Test-Token'],'fresh-csrf');assert.equal(h.requests[1].body.requestId,requestId);
});

test('disconnected status, missing test token and an unresolved sync error each block preview dispatch',async()=>{
  for(const change of [h=>h.bridge.status=null,h=>delete h.bridge.status.testPreview.csrfToken,h=>h.bridge.status.syncError='Save failed']){
    const h=harness();await h.start();h.html();await h.click('flow-step',first,{step:'review'});change(h);h.emit('roots:connection');await h.click('test-preview',first);
    assert.equal(h.requests.length,0);
  }
});

test('partial and failed delivery receipts never claim success or offer an automatic repeat',async()=>{
  for(const status of ['partial','failed']){
    const h=harness();await h.start();h.html();h.bridge.request=async(url,options)=>{h.requests.push({url});return {testPreview:{id:JSON.parse(options.body).requestId,status,deliveredToVolunteers:false}};};
    await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);await h.click('test-preview',first);
    assert.equal(h.requests.length,1);assert.doesNotMatch(h.html(),/Preview sent to your Telegram/);assert.match(h.html(),/Not sent/);
    assert.match(h.html(),status==='partial'?/Some preview messages reached Telegram/:/Telegram preview was not confirmed/);
  }
});

test('a draft already marked sent cannot be previewed as an unsent message',async()=>{
  const h=harness();await h.start();h.html();await h.click('flow-step',first,{step:'review'});
  h.bridge.activity.drafts[0]={...h.bridge.activity.drafts[0],status:'sent',sent:true};h.emit('roots:activity');await h.click('test-preview',first);
  assert.equal(h.requests.length,0);assert.match(h.html(),/Only unsent drafts/);
});

test('two plans in one conversation preserve their own audience and request identity',async()=>{
  const third='c'.repeat(32),fourth='d'.repeat(32),h=harness();await h.start();h.html();
  h.bridge.chat=async()=>({reply:'A second plan.',drafts:[makeDraft(third,'p03','Ari'),makeDraft(fourth,'p04','Nia')]});h.window.RootsChat.ask('Prepare another group.');await tick();h.html();
  await h.event('change',{dataset:{chatRecipient:second,flow:first},checked:false});await h.click('flow-step',first,{step:'review'});await h.click('test-preview',first);
  await h.event('change',{dataset:{chatRecipient:third,flow:third},checked:false});await h.click('flow-step',third,{step:'review'});await h.click('test-preview',third);
  assert.deepEqual(h.requests.map(r=>r.body.draftIds),[[first],[fourth]]);assert.notEqual(h.requests[0].body.requestId,h.requests[1].body.requestId);
});

test('a disconnected browser sample stays local through selection, edits, review and a reload',async()=>{
  const h=harness({connected:false});h.window.RootsChat.preview();h.html();const id=h.saved().messages[1].drafts[0].id;
  await h.click('flow-step',id,{step:'message'});const form=await h.enterDraft(id,id,'Local-only message.');await h.event('submit',form);await h.click('flow-step',id,{step:'review'});
  const restored=harness({connected:true,storage:h.storage});assert.match(restored.html(),/Local-only message/);await restored.click('test-preview',id);
  assert.equal(h.requests.length,0);assert.equal(restored.requests.length,0);assert.equal(h.calls.chats.length,0);assert.equal(restored.calls.chats.length,0);
});
