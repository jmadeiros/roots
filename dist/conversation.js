(() => {
  const storageKey = 'roots-conversation-v1';
  let api, conversationId = null, messages = [], composer = '', pending = false, error = '', errorCode = '', reviewDraftId = null;
  const edits = new Map(), busy = new Set(), flowErrors = new Map();
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    conversationId = typeof stored.conversationId === 'string' ? stored.conversationId : null;
    messages = Array.isArray(stored.messages) ? stored.messages.filter(m=>m&&typeof m==='object').slice(-40) : [];
    composer = typeof stored.composer === 'string' ? stored.composer : '';
    const unfinished=messages.at(-1);
    if(unfinished?.role==='user'&&unfinished.requestPending===true&&typeof unfinished.requestId==='string'){
      error='Your last request needs checking. Check its result before asking Roots to send it again.';
      errorCode='CHAT_REQUEST_PENDING';
    }
  } catch {}
  const e = value => api.esc(value);
  const bridge = () => window.RootsBridge;
  const active = () => api?.getState().view === 'chat';
  const time = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : '';
  const nameOf = draft => draft.personName || draft.recipient || 'Volunteer';
  const initials = name => String(name).trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('');
  const draftList = message => Array.isArray(message.drafts) ? message.drafts.filter(d=>d&&typeof d.id==='string') : [];
  const contentKey=drafts=>JSON.stringify([...drafts].sort((a,b)=>a.id.localeCompare(b.id)).map(d=>[d.id,d.personId,d.personName,d.channel,d.subject||'',d.body]));
  const flowLocked=state=>busy.has(state.id)||state.testPreview?.status==='sending';
  function draftLocked(id,exceptFlow) { return messages.filter(message=>draftList(message).some(d=>d.id===id)).some(message=>{const flow=flowFor(message);return flow.state.id!==exceptFlow&&flow.state.selected.includes(id)&&flowLocked(flow.state);}); }
  function currentDraft(draft) { return bridge()?.activity?.drafts?.find(d=>d.id===draft.id) || draft; }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({conversationId, messages:messages.slice(-40), composer})); }
    catch { api.toast('Conversation storage is unavailable. This chat lasts for this visit.'); }
  }
  function connectionMarkup() {
    const status = bridge()?.status;
    return `<button class="chat-connection" data-chat="connection"><span class="connection-dot ${status?.geminiConfigured&&!status?.syncError?'connected':''}"></span><span class="connection-full">${status?.syncError?'Sync needs attention':status?.geminiConfigured?'Assistant connected':'Connect assistant'}</span><span class="connection-short">${status?.syncError?'Sync issue':status?.geminiConfigured?'Connected':'Connect'}</span>${api.icon('chevron-down')}</button>`;
  }
  function ensureFlowIds() {
    const used=new Set();
    for(const message of messages){
      const drafts=draftList(message);if(!drafts.length)continue;
      const state=message.workbench&&typeof message.workbench==='object'?message.workbench:{};
      let id=typeof state.id==='string'&&state.id?state.id:drafts[0].id;
      while(used.has(id))id=`flow-${requestId()}`;
      state.id=id;message.workbench=state;used.add(id);
    }
  }
  function flowFor(message) {
    ensureFlowIds();
    const drafts = draftList(message).map(currentDraft);
    const state = message.workbench && typeof message.workbench==='object' ? message.workbench : {};
    state.id = state.id || drafts[0]?.id || '';
    state.step = ['people','message','review'].includes(state.step) ? state.step : 'people';
    state.selected = Array.isArray(state.selected) ? state.selected.filter(id=>drafts.some(d=>d.id===id)) : drafts.map(d=>d.id);
    if (!state.selected.includes(state.activeId)) state.activeId=state.selected[0]||null;
    const previewId=state.testPreview?.id||state.requestId;
    if(previewId){const receipt=bridge()?.activity?.activity?.find(item=>item.kind==='telegram_test_preview'&&item.id===previewId);if(receipt)state.testPreview={...state.testPreview,...receipt,duplicate:state.testPreview?.duplicate===true};}
    const selected=drafts.filter(d=>state.selected.includes(d.id));
    if(state.testPreview&&state.testPreview.status!=='sending'&&state.previewContent!==contentKey(selected)){
      const staleId=state.testPreview.id;resetPreview(state);
      message.testPreviews=(Array.isArray(message.testPreviews)?message.testPreviews:[]).filter(receipt=>receipt.id!==staleId);
    }
    message.workbench=state;
    return {state,drafts,selected,demo:drafts.some(d=>d.localPreview===true)};
  }
  function flowMessage(id) { ensureFlowIds();return messages.find(message=>message.workbench?.id===id); }
  function resetPreview(state) { delete state.testPreview; delete state.requestId; delete state.previewContent; }
  function blockersFor(draft) {
    const supplied = draft.readiness?.blockers;
    return Array.isArray(supplied)&&supplied.length ? supplied.map(b=>typeof b==='string'?b:b.message).filter(Boolean) : ['SMS and email delivery are not connected.'];
  }
  function previewBlockedReason(flow) {
    const status=bridge()?.status, preview=status?.testPreview;
    if(flow.demo)return 'Connect the local assistant to test delivery.';
    if(!flow.selected.length)return 'Select at least one person for this demo.';
    if(flow.selected.length>10)return 'Select 10 or fewer drafts for a Telegram demo.';
    if(flow.selected.some(d=>draftLocked(d.id,flow.state.id)))return 'A demo including these messages is still in progress. Check its receipt first.';
    if(flow.selected.some(d=>edits.has(d.id)))return 'Save every selected message before sending the demo.';
    if(flow.selected.some(d=>d.sent!==false||d.status!=='draft'))return 'Only unsent drafts can be used in a demo. Review the selected messages.';
    if(!status?.connected)return 'Connect the local assistant to test delivery.';
    if(status.syncError)return 'Resolve the workspace sync issue before sending the demo.';
    if(preview?.available!==true)return preview?.reason||'Connect the separate Roots Demo Inbox first.';
    if(typeof preview.csrfToken!=='string'||!preview.csrfToken)return 'Reconnect the assistant to refresh your demo session.';
    return '';
  }
  function deliveryNote() {
    const status=bridge()?.status;
    if(status?.syncError)return 'Your latest changes could not be synced. Open the connection details to retry.';
    return status?.geminiConfigured ? status.testPreview?.available===true?'Demo mode · Outgoing examples go to your separate Roots Demo Inbox on Telegram.':'Assistant connected. Connect Roots Demo Inbox to receive message examples in a separate Telegram chat.' : 'Try a sample SMS plan, or connect the local assistant for live answers.';
  }
  function peopleStage(flow) {
    const {state,drafts,selected}=flow;
    return `<div class="chat-flow-section"><div class="chat-flow-section-heading"><h3>Who are these messages for?</h3><span>${selected.length} of ${drafts.length} selected</span></div><p class="chat-flow-hint">${flow.demo?'Choose the people to include in this browser-only sample.':'Choose the intended recipients. Their examples go to your Roots Demo Inbox on Telegram.'}</p><div class="chat-audience-list">${drafts.map(d=>`<div class="chat-audience-row"><label><input type="checkbox" data-chat-recipient="${e(d.id)}" data-flow="${e(state.id)}" ${state.selected.includes(d.id)?'checked':''} ${flowLocked(state)?'disabled':''}><span class="chat-person-initials" aria-hidden="true">${e(initials(nameOf(d)))}</span><span><strong>${e(nameOf(d))}</strong><small>${d.contactConsent===true||d.consent?.recorded===true?`${e(String(d.channel||'sms').toUpperCase())} permission recorded`:'Permission needs checking'}${d.channel==='email'?(d.email?' · Email recorded':' · No email address'):(d.phone?' · Number recorded':' · No phone number')}</small></span></label><button class="text-button" data-chat="person" data-id="${e(d.personId)}" aria-label="Open ${e(nameOf(d))}'s profile">Profile ${api.icon('arrow')}</button></div>`).join('')}</div><div class="chat-flow-footer"><span>${selected.length?'Nothing will be sent at this step.':'Select at least one person to continue.'}</span><button class="button primary" data-chat="flow-step" data-id="${e(state.id)}" data-step="message" ${selected.length&&!flowLocked(state)?'':'disabled'}>Continue to message ${api.icon('arrow')}</button></div></div>`;
  }
  function messageStage(flow) {
    const {state,selected}=flow, draft=selected.find(d=>d.id===state.activeId)||selected[0];
    if(!draft)return peopleStage(flow);
    const body=edits.has(draft.id)?edits.get(draft.id):draft.body;
    const dirty=selected.some(d=>edits.has(d.id)), locked=flowLocked(state)||draftLocked(draft.id);
    return `<div class="chat-flow-section"><div class="chat-flow-section-heading"><h3>Make the message yours</h3><span>${selected.length===1?'One personal message':`${selected.length} individual drafts`}</span></div>${selected.length>1?`<label class="chat-recipient-select">Message for <select data-chat-active-draft data-flow="${e(state.id)}">${selected.map(d=>`<option value="${e(d.id)}" ${d.id===draft.id?'selected':''}>${e(nameOf(d))}${edits.has(d.id)?' · unsaved':''}</option>`).join('')}</select></label>`:`<p class="chat-flow-hint">To <button class="text-button" data-chat="person" data-id="${e(draft.personId)}">${e(nameOf(draft))}</button></p>`}<form class="chat-edit-form chat-flow-editor" data-draft-id="${e(draft.id)}" data-flow-id="${e(state.id)}"><label class="sr-only" for="edit-${e(state.id)}-${e(draft.id)}">Message for ${e(nameOf(draft))}</label>${draft.subject?`<p class="chat-draft-subject">${e(draft.subject)}</p>`:''}<textarea id="edit-${e(state.id)}-${e(draft.id)}" name="body" maxlength="4000" required ${locked?'disabled':''}>${e(body)}</textarea><div class="chat-message-meta"><span data-chat-character-count>${String(body||'').length} characters</span><button class="text-button" type="submit" ${edits.has(draft.id)&&!locked?'':'disabled'}>${busy.has(state.id)?'Saving…':'Save changes'}</button></div><p class="chat-edit-error" role="alert">${e(flowErrors.get(state.id)||'')}</p></form><div class="chat-flow-footer"><button class="text-button" data-chat="refine" data-id="${e(draft.id)}">Refine in chat ${api.icon('arrow')}</button><button class="button primary" data-chat="flow-step" data-id="${e(state.id)}" data-step="review" ${dirty||locked?'disabled':''}>Review ${selected.length===1?'message':`${selected.length} messages`} ${api.icon('arrow')}</button></div>${dirty?'<p class="chat-flow-hint">Save your changes before review.</p>':''}</div>`;
  }
  function testReceiptMarkup(receipt) {
    const sent=receipt.status==='sent', partial=receipt.status==='partial', sending=receipt.status==='sending';
    return `<div class="chat-test-receipt ${sent?'is-sent':''}" role="status"><strong>${sent?'Demo sent to Telegram':partial?'Some demo messages reached Telegram':sending?'Demo delivery is already in progress':'Telegram demo delivery was not confirmed'}</strong><p>${sent?`${receipt.duplicate?'Showing the existing delivery receipt. ':''}${time(receipt.sentAt)?`Sent at ${e(time(receipt.sentAt))}. `:''}No SMS or email was sent to the intended recipients.`:partial?'Check the delivery chat below before trying anything else. The demo will not be resent automatically.':sending?'The existing request is still running. Check its receipt here when it has finished.':'Check the connection and your demo inbox. There is no automatic retry.'}</p>${receipt.botUsername?`<a href="https://t.me/${encodeURIComponent(receipt.botUsername)}" target="_blank" rel="noopener">Open delivery chat · @${e(receipt.botUsername)} ${api.icon('external')}</a>`:''}</div>`;
  }
  function reviewStage(flow) {
    const {state,selected,demo}=flow;
    const blockers=[...new Set(selected.flatMap(blockersFor))];
    const blockedReason=previewBlockedReason(flow);
    const canTest=!blockedReason&&!state.testPreview&&!busy.has(state.id);
    return `<div class="chat-flow-section"><div class="chat-flow-section-heading"><h3>Review your ${demo?'sample':'demo'}</h3><span>${selected.length} intended ${selected.length===1?'recipient':'recipients'}</span></div><div class="chat-review-messages">${selected.map((d,index)=>`<details ${index===0?'open':''}><summary><span>${e(nameOf(d))}</span><span>${e(String(d.channel||'sms').toUpperCase())} · Not sent</span>${api.icon('chevron-down')}</summary>${d.subject?`<p class="chat-draft-subject">${e(d.subject)}</p>`:''}<p class="chat-draft-body">${e(d.body)}</p><button class="text-button" data-chat="copy" data-id="${e(d.id)}">Copy message</button></details>`).join('')}</div><div class="chat-telegram-test"><h4>${demo?'Try delivery with the local assistant':'Your demo inbox on Telegram'}</h4><p>${demo?'This is a browser-only sample. Create a draft with the connected assistant to send an example to your separate Roots Demo Inbox.':`You’ll receive ${selected.length===1?'this message':`all ${selected.length} messages`}, labelled with ${selected.length===1?'its intended recipient':'their intended recipients'}, in your separate Roots Demo Inbox. SMS and email stay unsent.`}</p>${state.testPreview?testReceiptMarkup(state.testPreview)+(state.testPreview.status==='sending'?`<button class="text-button" data-chat="check-receipt" data-id="${e(state.id)}">Check delivery receipt</button>`:''):`<button class="button primary" data-chat="test-preview" data-id="${e(state.id)}" ${canTest?'':'disabled'}>${busy.has(state.id)?'Sending to demo inbox…':'Send to demo inbox'}</button>${!canTest&&!busy.has(state.id)?`<small>${e(blockedReason)}</small>`:''}`}<p class="chat-edit-error" role="alert">${e(flowErrors.get(state.id)||'')}</p></div><details class="chat-send-checks"><summary><span>Before sending to real recipients</span>${api.icon('chevron-down')}</summary><p>These checks apply to real SMS and email delivery. They do not block your Telegram demo.</p><ul>${blockers.map(b=>`<li>${e(b)}</li>`).join('')}</ul></details></div>`;
  }
  function workbenchMarkup(message) {
    const flow=flowFor(message), {state,drafts,selected,demo}=flow;
    const channels=[...new Set(drafts.map(d=>String(d.channel||'sms').toUpperCase()))];
    const label=channels.length===1?`${channels[0]} outreach`:'Outreach plan';
    const steps=[['people','People'],['message','Message'],['review','Review']];
    return `<section class="chat-workbench" data-flow-card="${e(state.id)}" data-draft-card="${e(state.id)}" aria-label="${e(label)} plan"><header class="chat-workbench-heading"><div><h2>${e(label)}</h2><p>${demo?'Sample plan · Saved in this browser':'Demo mode · Delivery to Roots Demo Inbox'}</p></div><span class="chat-flow-count">${selected.length} ${selected.length===1?'person':'people'}</span></header><nav class="chat-flow-steps" aria-label="Outreach plan steps">${steps.map(([key,label],index)=>`<button data-chat="flow-step" data-id="${e(state.id)}" data-step="${key}" ${state.step===key?'aria-current="step"':''} ${flowLocked(state)||(key!=='people'&&(!selected.length||(key==='review'&&selected.some(d=>edits.has(d.id)))))?'disabled':''}><span>${index+1}</span>${label}</button>`).join('')}</nav>${state.step==='people'?peopleStage(flow):state.step==='message'?messageStage(flow):reviewStage(flow)}</section>`;
  }
  function deliveryReceipts(message) {
    return (Array.isArray(message.testPreviews)?message.testPreviews:[]).filter(receipt=>receipt&&typeof receipt.id==='string').map(receipt=>{
      const latest=bridge()?.activity?.activity?.find(item=>item.kind==='telegram_test_preview'&&item.id===receipt.id);
      return latest?{...receipt,...latest}:receipt;
    }).filter(receipt=>{
      const ids=receipt.draftIds||message.actions?.find(action=>action.previewId===receipt.id)?.draftIds||[];
      const drafts=draftList(message).filter(d=>ids.includes(d.id)).map(currentDraft);
      return !drafts.length||receipt.contentKey===contentKey(drafts);
    });
  }
  function messageMarkup(message) {
    if (message.role === 'user') return `<article class="chat-message user-message"><span class="sr-only">You</span><p>${e(message.text)}</p></article>`;
    const displayText=draftList(message).length||deliveryReceipts(message).length?String(message.text||'').replace(/(?:\n\n)?Draft saved, not sent\. Email and SMS delivery are not connected\./g,'').replace(/(?:\n\n)?Demo messages were sent to your Telegram\. No SMS or email was sent to volunteers\./g,'').trim():message.text;
    const text = e(displayText).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>');
    return `<article class="chat-message assistant-message"><div class="assistant-name">${api.icon('sprout')}${message.role==='workspace'?'From your drafts':message.localPreview?'Roots · Sample flow':'Roots'}</div><div class="chat-response-text">${text}</div>${draftList(message).length?workbenchMarkup(message):''}${deliveryReceipts(message).filter(receipt=>receipt.id!==message.workbench?.testPreview?.id).map(testReceiptMarkup).join('')}</article>`;
  }
  function messagesMarkup() {
    return messages.map(messageMarkup).join('') + (pending ? '<div class="chat-thinking" role="status"><span></span>Checking your records…</div>' : '') + (error ? `<div class="chat-error" role="alert"><p>${e(error)}</p><button class="text-button" data-chat="recover">${errorCode==='CONVERSATION_UNAVAILABLE'?'Start a new chat':messages.at(-1)?.requestId?'Check request result':'Try again'}</button></div>` : '');
  }
  function render() {
    return `<div class="conversation-workspace"><div class="chat-tools"><div id="chat-connection">${connectionMarkup()}</div><div class="chat-tools-links"><a href="#briefing">Back to overview</a><button data-chat="new" ${pending||busy.size?'disabled':''}>New chat</button></div></div>
      <div class="conversation-column ${messages.length?'has-conversation':''}"><div class="chat-intro"><h1>What should we make happen?</h1><p>Explore an insight. Bring the right people together. Prepare the next step here.</p><div class="chat-starters"><button data-chat="example">Invite first-time volunteers back ${api.icon('arrow')}</button><button data-chat="preview">Try the SMS flow <span>Sample</span></button></div></div>
      <div id="chat-transcript" class="chat-transcript" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">${messagesMarkup()}</div>
      <div class="chat-composer-dock"><form id="roots-conversation-form" class="chat-composer"><label class="sr-only" for="roots-conversation-input">Ask Roots about your community</label><textarea id="roots-conversation-input" name="message" rows="2" maxlength="2000" placeholder="Ask a question, explore an idea, or plan an SMS…" required>${e(composer)}</textarea><div class="chat-composer-bottom"><span>${api.icon('users')}Your community in context</span><button type="submit" class="chat-send" aria-label="Send message to Roots" ${pending?'disabled':''}>${api.icon('arrow')}</button></div></form><div id="chat-composer-note" class="chat-composer-note">${deliveryNote()}</div></div></div></div>`;
  }
  function afterRender() { sizeInput();if(reviewDraftId){document.querySelector(`[data-draft-card="${reviewDraftId}"]`)?.scrollIntoView({block:'center',behavior:'auto'});reviewDraftId=null;} }
  function sizeInput() {
    const input = document.getElementById('roots-conversation-input');
    if (input) { input.style.height='auto'; input.style.height=`${Math.min(180,Math.max(60,input.scrollHeight))}px`; }
  }
  function refreshMessages(scroll = false) {
    if (!active()) return;
    const focused=document.activeElement;
    const editingFocus=focused?.closest('.chat-edit-form')?{id:focused.id,start:focused.selectionStart,end:focused.selectionEnd}:null;
    const transcript = document.getElementById('chat-transcript');
    if (transcript) transcript.innerHTML=messagesMarkup();
    document.querySelector('.conversation-column')?.classList.toggle('has-conversation', messages.length > 0);
    const send = document.querySelector('.chat-send');if(send)send.disabled=pending;
    const fresh=document.querySelector('[data-chat=new]');if(fresh)fresh.disabled=pending||busy.size>0;
    if(editingFocus?.id){const field=document.getElementById(editingFocus.id);field?.focus({preventScroll:true});if(field&&editingFocus.start!=null)field.setSelectionRange(editingFocus.start,editingFocus.end);}
    if (scroll&&!editingFocus) document.querySelector('.chat-composer-dock')?.scrollIntoView({block:'end',behavior:'auto'});
  }
  function refreshConnection() {
    if (!active()) return;
    const target=document.getElementById('chat-connection');if(target)target.innerHTML=connectionMarkup();
    const note=document.getElementById('chat-composer-note');if(note)note.textContent=deliveryNote();
    if(!edits.size)refreshMessages();
  }
  function setPrompt(text) {
    composer=text;save();
    if(!active()){location.hash='chat';return;}
    const input=document.getElementById('roots-conversation-input');
    if(input){input.value=composer;sizeInput();input.focus();input.scrollIntoView({block:'nearest',behavior:'auto'});}
  }
  function connection() {
    const status=bridge()?.status, preview=status?.testPreview;
    const dedicated=status?.telegramMode==='dedicated';
    api.openDialog('Assistant connection',`<h2 id="dialog-title">Your community, in the conversation.</h2><p class="lead">Two Telegram chats: one to run the community, one to see outgoing message examples.</p><section class="dialog-section"><h3>${status?.geminiConfigured?'Assistant connected':'Connect the local assistant'}</h3><p>${status?.geminiConfigured?'Questions use your current dashboard records. The conversation can create and edit drafts, then show a review flow.':'The published sample can demonstrate an SMS plan. Live answers and Telegram delivery need the running local workspace.'}</p>${!status?.geminiConfigured?'<a class="button primary" href="http://127.0.0.1:4180/#chat" target="_blank" rel="noopener">Open local workspace</a>':''}${status?.syncError?`<p class="chat-inline-error">${e(status.syncError)}</p><button class="button" data-chat="retry-connection">Retry connection</button>`:''}</section><section class="dialog-section"><h3>Roots Assistant</h3><p>${status?.telegramErrorCode?'The assistant bot connection needs attention. Open the local connection setup to check it.':dedicated&&status?.botUsername?`Chat with @${e(status.botUsername)} as a coordinator: ask about your people, prepare messages or ask it to send examples to the demo inbox. No /roots prefix is needed.`:'Connect a dedicated Roots Assistant bot to manage your community from your phone.'}</p>${dedicated&&status?.botUsername?`<a class="text-button" href="https://t.me/${encodeURIComponent(status.botUsername)}" target="_blank" rel="noopener">Open Roots Assistant ${api.icon('external')}</a>`:''}</section><section class="dialog-section"><h3>Roots Demo Inbox</h3><p>${preview?.available?'Outgoing SMS and email examples arrive in this separate private chat, labelled with their intended recipients.':'Connect a separate demo inbox bot and tap Start in its Telegram chat. '+e(preview?.reason||'It receives examples only; coordinator conversations stay with Roots Assistant.')} You can send from the dashboard or ask Roots Assistant. Real SMS and email delivery remain unavailable.</p>${preview?.botUsername?`<a class="text-button" href="https://t.me/${encodeURIComponent(preview.botUsername)}" target="_blank" rel="noopener">Open Roots Demo Inbox ${api.icon('external')}</a>`:''}</section>`);
  }
  function previewPlan() {
    if(pending)return;
    const people=(api.getState().people||[]).filter(p=>Number(p.visits)===1).slice(0,10);
    if(!people.length){api.toast('There are no one-visit profiles to use in this sample.');return;}
    const seed=Date.now().toString(36);
    const drafts=people.map((person,index)=>{
      const p={...person,...(window.RootsPeople?.profileData(person)||{})};
      const permission=Object.prototype.hasOwnProperty.call(p,'smsConsentRecorded')?p.smsConsentRecorded===true:p.consent===true;
      const blockers=[];
      if(!permission)blockers.push({message:'Recorded SMS permission is required before sending.'});
      if(!p.phone)blockers.push({message:'No phone number is recorded for this person.'});
      blockers.push({message:'This sample stays in your browser. SMS delivery is not connected.'});
      return {id:`sample-${seed}-${index}`,personId:p.id,personName:p.name,phone:p.phone||null,channel:'sms',body:`Hi ${String(p.name||'there').split(' ')[0]}, thanks for spending time with us at Greenfield Farm. Would you like to join another volunteer session? Reply with a day that works for you and we can find a good fit.`,status:'draft',sent:false,localPreview:true,contactConsent:permission,readiness:{canSend:false,blockers}};
    });
    messages.push({role:'user',text:'Show me an SMS plan to invite first-time volunteers back.'},{role:'assistant',localPreview:true,text:`Here is a sample plan using ${people.length} profiles with one recorded visit. Choose the people, edit each message and review the result. This is a template from your records, not a live AI response.`,drafts});
    composer='';error='';save();if(active()){api.render();document.querySelector('.chat-workbench:last-of-type')?.scrollIntoView({block:'start'});}else location.hash='chat';
  }
  async function send(text,recovery=null) {
    text=String(text||'').trim();if(!text||pending)return;
    if(!bridge()?.status?.geminiConfigured){setPrompt(text);connection();return;}
    const request=recovery||{role:'user',text,requestId:requestId(),requestConversationId:conversationId};
    request.requestPending=true;
    composer='';error='';errorCode='';pending=true;if(!recovery)messages.push(request);save();
    const input=document.getElementById('roots-conversation-input');if(input)input.value='';sizeInput();refreshMessages(true);
    try {
      const result=await bridge().chat(text,request.requestConversationId,request.requestId);conversationId=result.conversationId||conversationId;request.requestPending=false;
      const response={role:'assistant',text:result.reply||'The request is complete.',drafts:result.drafts||[],testPreviews:result.testPreviews||[],actions:result.actions||[]};
      const drafts=draftList(response);
      response.testPreviews=(Array.isArray(response.testPreviews)?response.testPreviews:[]).map(receipt=>{
        const ids=receipt.draftIds||response.actions.find(action=>action.previewId===receipt.id)?.draftIds||[];
        return {...receipt,contentKey:contentKey(drafts.filter(d=>ids.includes(d.id)))};
      });
      const receipt=response.testPreviews.find(item=>{
        const ids=item.draftIds||response.actions.find(action=>action.previewId===item.id)?.draftIds||[];
        return drafts.length>0&&ids.length===drafts.length&&drafts.every(d=>ids.includes(d.id));
      });
      if(receipt)response.workbench={step:'review',selected:drafts.map(d=>d.id),testPreview:receipt,requestId:receipt.id,previewContent:contentKey(drafts)};
      messages.push(response);
      await bridge().loadActivity().catch(()=>{});
    } catch(err) {
      errorCode=err.code||'';
      if(err.status===403){
        await bridge().init().catch(()=>{});
        error='The demo session expired before delivery. Check the request result after reconnecting.';
      }else error=err.code==='CONVERSATION_UNAVAILABLE'?'This conversation is no longer available on this browser connection. Start a new conversation and repeat your request.':err.message;
    }
    finally {pending=false;save();refreshMessages(true);if(!document.activeElement?.closest('.chat-edit-form'))document.getElementById('roots-conversation-input')?.focus({preventScroll:true});}
  }
  function reviewDrafts(drafts) {
    const saved=Array.isArray(drafts)?drafts.filter(d=>d&&typeof d.id==='string'&&!d.localPreview):[];
    if(!saved.length)return;
    const ids=saved.map(d=>d.id);
    let message=[...messages].reverse().find(item=>{
      const previous=draftList(item);return previous.length===ids.length&&previous.every(d=>ids.includes(d.id));
    });
    if(message){
      const flow=flowFor(message);
      if(flowLocked(flow.state)){save();reviewDraftId=flow.state.id;if(active())api.render();else location.hash='chat';return;}
      const changed=flow.selected.length!==ids.length||!flow.selected.every(d=>ids.includes(d.id))||saved.some(d=>{
        const old=draftList(message).find(item=>item.id===d.id);
        return !old||['body','subject','channel','personId'].some(field=>old[field]!==d[field]);
      });
      message.drafts=saved;flow.state.step='review';flow.state.selected=ids;
      if(changed)resetPreview(flow.state);
    }else{
      message={role:'workspace',text:'',drafts:saved,workbench:{step:'review',selected:ids}};messages.push(message);
    }
    const flow=flowFor(message);save();reviewDraftId=flow.state.id;
    if(active())api.render();else location.hash='chat';
  }
  function findDraft(id) { return bridge()?.activity?.drafts?.find(d=>d.id===id) || messages.flatMap(draftList).find(d=>d.id===id); }
  function replaceDraft(id,draft) {
    for(const m of messages){
      const previous=draftList(m).find(d=>d.id===id);
      const changed=previous&&contentKey([previous])!==contentKey([draft]);
      m.drafts=draftList(m).map(d=>d.id===id?draft:d);
      if(changed){
        const affectedReceipt=m.workbench?.selected?.includes(id)?m.workbench.testPreview?.id:null;
        if(m.workbench?.selected?.includes(id))resetPreview(m.workbench);
        m.testPreviews=(Array.isArray(m.testPreviews)?m.testPreviews:[]).filter(receipt=>receipt.id!==affectedReceipt&&!(receipt.draftIds||m.actions?.find(action=>action.previewId===receipt.id)?.draftIds||[]).includes(id));
      }
    }
    if(bridge()?.activity?.drafts)bridge().activity.drafts=bridge().activity.drafts.map(d=>d.id===id?draft:d);
  }
  function requestId() {
    if(typeof crypto!=='undefined'&&crypto.randomUUID)return crypto.randomUUID().replace(/-/g,'');
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g,()=>Math.floor(Math.random()*16).toString(16));
  }
  async function sendTest(message) {
    const flow=flowFor(message), {state,selected,demo}=flow, preview=bridge()?.status?.testPreview;
    if(state.step!=='review'||previewBlockedReason(flow)||busy.has(state.id)||state.testPreview)return;
    state.requestId=state.requestId||requestId();state.previewContent=contentKey(selected);
    // Persist the in-flight identity before dispatch, so a reload cannot offer another send.
    state.testPreview={id:state.requestId,status:'sending',channel:'telegram',deliveredToVolunteers:false};
    busy.add(state.id);flowErrors.delete(state.id);save();refreshMessages();
    try {
      const result=await bridge().request('/api/outreach/test',{method:'POST',headers:{'X-Roots-Test-Token':preview.csrfToken},body:JSON.stringify({draftIds:selected.map(d=>d.id),requestId:state.requestId})});
      state.testPreview=result.testPreview||{id:state.requestId,status:'failed'};
      await bridge().loadActivity().catch(()=>{});
    }catch(err){
      if(err.status===403){
        // The server rejects authorization before dispatch. Refresh once; another click is required.
        delete state.testPreview;
        await bridge().init().catch(()=>{});
        flowErrors.set(state.id,`${err.message||'The demo session expired.'} Review the messages and try again after reconnecting.`);
      }else{
        state.testPreview={id:state.requestId,status:'failed'};
        flowErrors.set(state.id,err.message||'The Telegram demo delivery could not be confirmed.');
      }
    }
    finally{busy.delete(state.id);save();refreshMessages();}
  }
  document.addEventListener('input',event=>{
    if(event.target.id==='roots-conversation-input'){composer=event.target.value;sizeInput();save();}
    const form=event.target.closest('.chat-edit-form');
    if(form&&event.target.name==='body'){
      const draft=findDraft(form.dataset.draftId);if(!draft||draftLocked(draft.id))return;
      if(event.target.value===draft.body)edits.delete(draft.id);else edits.set(draft.id,event.target.value);
      const count=form.querySelector('[data-chat-character-count]');if(count)count.textContent=`${event.target.value.length} characters`;
      const saveButton=form.querySelector('[type=submit]');if(saveButton)saveButton.disabled=!edits.has(draft.id);
      const card=form.closest('.chat-workbench');if(card)card.querySelectorAll('[data-step=review]').forEach(button=>button.disabled=flowFor(flowMessage(form.dataset.flowId)).selected.some(d=>edits.has(d.id)));
    }
  });
  document.addEventListener('change',event=>{
    const target=event.target;
    if(target.dataset?.chatRecipient){
      const message=flowMessage(target.dataset.flow);if(!message)return;const flow=flowFor(message);if(flowLocked(flow.state))return;
      flow.state.selected=target.checked?[...new Set([...flow.state.selected,target.dataset.chatRecipient])]:flow.state.selected.filter(id=>id!==target.dataset.chatRecipient);
      resetPreview(flow.state);save();refreshMessages();
    }
    if(target.matches?.('[data-chat-active-draft]')){
      const message=flowMessage(target.dataset.flow);if(message&&!flowLocked(flowFor(message).state)){message.workbench.activeId=target.value;save();refreshMessages();}
    }
  });
  document.addEventListener('keydown',event=>{if(event.target.id==='roots-conversation-input'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();send(event.target.value);}});
  document.addEventListener('submit',async event=>{
    if(event.target.id==='roots-conversation-form'){event.preventDefault();send(composer);}
    if(event.target.matches('.chat-edit-form')){
      event.preventDefault();const form=event.target,id=form.dataset.draftId,message=flowMessage(form.dataset.flowId),draft=findDraft(id);
      if(!draft||!message||!edits.has(id)||draftLocked(id)||flowLocked(flowFor(message).state))return;
      const body=String(edits.get(id)||'').trim();if(!body){form.querySelector('.chat-edit-error').textContent='Write a message before saving.';return;}
      const flow=message.workbench;busy.add(flow.id);flowErrors.delete(flow.id);form.querySelectorAll('textarea,button').forEach(field=>field.disabled=true);
      try{
        const result=draft.localPreview?{draft:{...draft,body}}:await bridge().request(`/api/drafts/${encodeURIComponent(id)}/edit`,{method:'POST',body:JSON.stringify({body})});
        replaceDraft(id,result.draft);edits.delete(id);resetPreview(flow);save();if(!draft.localPreview)await bridge().loadActivity().catch(()=>{});api.toast('Message updated. Nothing sent.');
      }catch(err){flowErrors.set(flow.id,err.message);}
      finally{busy.delete(flow.id);refreshMessages();}
    }
  });
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-chat]');if(!button||!api||button.disabled)return;
    const action=button.dataset.chat,id=button.dataset.id;
    if(action==='drafts')window.RootsNotices.openTab('drafts');
    else if(action==='workflows')window.RootsNotices.openTab('workflows');
    else if(action==='preview')previewPlan();
    else if(action==='example'){const prompt='Prepare an SMS invitation for people with one recorded visit, asking when they would like to volunteer again. Only include people with recorded SMS permission. Create individual drafts for review.';if(bridge()?.status?.geminiConfigured)send(prompt);else previewPlan();}
    else if(action==='flow-step'){
      const message=flowMessage(id);if(!message)return;const flow=flowFor(message),step=button.dataset.step;if(flowLocked(flow.state))return;
      if(!['people','message','review'].includes(step)||(step!=='people'&&!flow.selected.length)||(step==='review'&&flow.selected.some(d=>edits.has(d.id))))return;
      flow.state.step=step;flowErrors.delete(id);save();refreshMessages();document.querySelector(`[data-flow-card="${id}"] [aria-current=step]`)?.focus({preventScroll:true});
    }
    else if(action==='check-receipt'){button.disabled=true;try{await bridge().loadActivity();refreshMessages();}catch(err){flowErrors.set(id,err.message);refreshMessages();}}
    else if(action==='test-preview'){const message=flowMessage(id);if(message)await sendTest(message);}
    else if(action==='review-draft'){const draft=findDraft(id);if(draft){let message=messages.find(m=>draftList(m).some(d=>d.id===id));if(!message){message={role:'workspace',text:'',drafts:[draft]};messages.push(message);}const flow=flowFor(message);if(!flow.state.selected.includes(id))flow.state.selected.push(id);flow.state.activeId=id;flow.state.step='review';save();reviewDraftId=flow.state.id;if(active())api.render();else location.hash='chat';}}
    else if(action==='connection')connection();
    else if(action==='retry-connection'){button.disabled=true;await bridge().init();api.closeDialog();refreshConnection();}
    else if(action==='source')({person:api.showPerson,event:api.showEvent,opportunity:api.showOpportunity})[button.dataset.kind]?.(id);
    else if(action==='person')api.showPerson(id);
    else if(action==='new'){if(pending||busy.size)return;conversationId=null;messages=[];error='';edits.clear();flowErrors.clear();save();api.render();document.getElementById('roots-conversation-input')?.focus();}
    else if(action==='recover'){
      const last=messages.filter(m=>m.role==='user').at(-1)?.text||'';
      if(errorCode==='CONVERSATION_UNAVAILABLE'){conversationId=null;messages=[];error='';save();api.render();setPrompt(last);}
      else{const request=messages.at(-1);if(request?.role==='user'&&request.requestPending&&request.requestId)send(request.text,request);else{messages.pop();send(last);}}
    }
    else if(action==='refine'){const d=findDraft(id);if(d)setPrompt(`Revise the ${d.channel} draft for ${nameOf(d)} (${d.personId}). Current draft: ${d.body}\nMake it `);}
    else if(action==='copy'){const d=findDraft(id);if(d)try{await navigator.clipboard.writeText(d.body);api.toast('Message copied. Nothing sent.');}catch{api.toast('Copy is unavailable. Select the message text to copy it.');}}
  });
  window.addEventListener('roots:ready',refreshConnection);
  window.addEventListener('roots:connection',refreshConnection);
  window.addEventListener('roots:activity',()=>{if(!edits.size)refreshMessages();});
  window.RootsChat={configure(callbacks){api=callbacks;},render,afterRender,setPrompt,reviewDrafts,preview:previewPlan,ask(text){if(pending){setPrompt(text);return;}if(!active())location.hash='chat';send(text);}};
})();
