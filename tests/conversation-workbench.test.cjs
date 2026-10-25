const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const vm=require('node:vm');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const first='a'.repeat(32), second='b'.repeat(32);
const makeDraft=(id, personId, name)=>({id,personId,personName:name,channel:'sms',body:`Hi ${name}, would you like to volunteer again?`,sent:false,status:'draft',contactConsent:true,phone:null,readiness:{canSend:false,blockers:[{code:'PHONE_MISSING',message:'No phone number is recorded.'},{code:'DELIVERY_NOT_CONNECTED',message:'SMS delivery is not connected.'}]}});
function harness({connected=true,drafts=[makeDraft(first,'p01','Maya'),makeDraft(second,'p02','Leo')],preview=true}={}) {
  const listeners=new Map(),storage=new Map(),requests=[],toasts=[];
  const state={view:'chat',people:[{id:'p01',name:'Maya',visits:1,consent:true},{id:'p02',name:'Leo',visits:1,consent:false},{id:'p03',name:'Ari',visits:2,consent:true}]};
  const node=id=>({id,value:'',innerHTML:'',textContent:'',style:{},scrollHeight:60,classList:{toggle(){}},closest:()=>null,focus(){},scrollIntoView(){}});
  const nodes=new Map(['roots-conversation-input','chat-transcript','chat-connection','chat-composer-note'].map(id=>[id,node(id)]));
  const document={activeElement:null,getElementById:id=>nodes.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);}};
  const bridge={status:connected?{geminiConfigured:true,testPreview:{available:preview,csrfToken:'test-csrf',reason:preview?null:'Dedicated Roots bot needed'}}:null,activity:{drafts:[]},async loadActivity(){},async init(){},async chat(){bridge.activity.drafts=drafts;return {reply:'Here are the messages to review.',drafts,conversationId:'chat-test'};},async request(url,options){requests.push({url,...options,body:JSON.parse(options.body)});if(url.endsWith('/edit')){const id=url.split('/')[3],draft=bridge.activity.drafts.find(d=>d.id===id);return {draft:{...draft,body:JSON.parse(options.body).body}};}if(url==='/api/outreach/test')return {testPreview:{id:'receipt',status:'sent',botUsername:'roots_example_bot',recipient:'Your Telegram chat',sentAt:'2026-10-24T12:00:00Z',deliveredToVolunteers:false}};throw Error('Unexpected request');}};
  const window={RootsBridge:bridge,RootsPeople:{profileData:p=>p},addEventListener(){}};
  const context=vm.createContext({window,document,location:{hash:'#chat'},crypto:{randomUUID:()=> '12345678-1234-1234-1234-123456789012'},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/conversation.js'),'utf8'),context);
  window.RootsChat.configure({getState:()=>state,esc:escape,icon:()=>'',render(){nodes.get('chat-transcript').innerHTML=window.RootsChat.render();},toast:message=>toasts.push(message),showPerson(){},openDialog(){}});
  async function event(type,target){await Promise.all((listeners.get(type)||[]).map(fn=>fn({target,preventDefault(){}})));}
  async function click(action,id,extra={}){const button={disabled:false,dataset:{chat:action,id,...extra}};await event('click',{closest:selector=>selector==='[data-chat]'?button:null});}
  function editForm(id,flowId){const status=node('status'),submit=node('submit'),count=node('count');return {id:'edit-form',dataset:{draftId:id,flowId},matches:selector=>selector==='.chat-edit-form',closest:()=>null,querySelectorAll:()=>[],querySelector:selector=>selector==='.chat-edit-error'?status:selector==='[type=submit]'?submit:count};}
  async function enterDraft(id,flowId,value){const form=editForm(id,flowId);await event('input',{id:`edit-${id}`,name:'body',value,closest:selector=>selector==='.chat-edit-form'?form:null});return form;}
  return {window,state,bridge,requests,nodes,toasts,storage,event,click,enterDraft,html:()=>window.RootsChat.render(),saved:()=>JSON.parse(storage.get('roots-conversation-v1')),async start(){window.RootsChat.ask('Prepare SMS drafts.');await tick();}};
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
