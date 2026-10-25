(() => {
  const storageKey = 'roots-conversation-v1';
  let api, conversationId = null, messages = [], composer = '', pending = false, error = '', errorCode = '', refreshing = false, showAllInsights = false, reviewDraftId = null;
  let checkedLocally = null, localInsights = [], fingerprint = '', refreshTimer = null;
  const edits = new Map();
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    conversationId = typeof stored.conversationId === 'string' ? stored.conversationId : null;
    messages = Array.isArray(stored.messages) ? stored.messages.slice(-40) : [];
    composer = typeof stored.composer === 'string' ? stored.composer : '';
  } catch {}
  const e = value => api.esc(value);
  const bridge = () => window.RootsBridge;
  const active = () => api?.getState().view === 'chat';
  const time = value => value ? new Date(value).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : '';
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({conversationId, messages:messages.slice(-40), composer})); }
    catch { api.toast('Conversation storage is unavailable. This chat lasts for this visit.'); }
  }
  function checkLocalRecords(force = false) {
    const state = api.getState();
    const people = state.people.map(p => ({...p, ...window.RootsPeople.profileData(p)}));
    const nextFingerprint = JSON.stringify({people,events:state.events,projects:window.RootsOpportunities.projects()});
    if (!force && nextFingerprint === fingerprint) return;
    fingerprint = nextFingerprint;
    checkedLocally = new Date().toISOString();
    localInsights = [];
    const event = state.events.find(ev => ev.id === 'e01');
    const gardeners = people.filter(p => p.visits === 1 && p.interests.some(i => /garden/i.test(i)) && /saturday/i.test(p.availability));
    if (event && gardeners.length && event.capacity > event.attendees) localInsights.push({
      id:'local-garden', title:`${gardeners.length} first-time volunteers could fit the garden shift.`,
      summary:`Their gardening interests and Saturday availability align. The ${event.month} ${event.day} shift has ${event.capacity-event.attendees} spaces.`,
      evidence:[{label:'People with matching interests',value:gardeners.map(p => p.name).join(', ')},{label:'What to confirm',value:'Individual RSVPs and attendance are not recorded for this event.'}],
      sourceIds:{people:gardeners.map(p=>p.id),events:[event.id]},
      suggestedPrompt:`Review ${gardeners.map(p=>p.name).join(', ')} for ${event.title} (${event.month} ${event.day}). Explain the fit and what we still need to confirm. Do not assume they have not booked.`
    });
    const hours = people.filter(p => p.interests.some(i => /service hours/i.test(i)));
    if (hours.length) localInsights.push({
      id:'local-hours',title:'Service hours could give people a reason to return.',
      summary:`${hours.length} people list service hours, including ${hours.filter(p=>p.visits===1).length} who have visited once. School approval and verification still need checking.`,
      evidence:[{label:'Interest recorded',value:hours.map(p=>p.name).join(', ')},{label:'What to confirm',value:'School, enrollment, required hours, and eligibility are not established.'}],
      sourceIds:{people:hours.map(p=>p.id),opportunities:['o05']},
      suggestedPrompt:'Which people list service hours, and what would we need to verify before offering them a school volunteering pathway? Use the school service-hours opportunity.'
    });
    const team = ['p08','p03','p05'].map(id=>people.find(p=>p.id===id)).filter(Boolean);
    if (team.length === 3) localInsights.push({
      id:'local-project',title:'The garden-signs team needs a shared planning time.',
      summary:'The suggested team brings different interests together. Their profiles list different availability, so a planning time needs confirming.',
      evidence:team.map(p=>({label:p.name,value:p.availability})),
      sourceIds:{people:team.map(p=>p.id),projects:['project-garden']},
      suggestedPrompt:'Review the suggested garden-signs project team and their recorded availability. What would we need to ask before arranging a planning session? They are not confirmed participants.'
    });
  }
  function insightData() {
    const remote = bridge()?.insights;
    return remote || {insights:localInsights,checkedAt:checkedLocally,illustrative:true,source:'browser-records'};
  }
  function sourceButtons(item) {
    const ids = item.sourceIds || {};
    return [
      ...(ids.people || []).map(id => ({kind:'person', id, label:api.getState().people.find(p=>p.id===id)?.name || 'View person'})),
      ...(ids.events || []).map(id => ({kind:'event',id,label:'View event'})),
      ...(ids.opportunities || []).map(id => ({kind:'opportunity',id,label:'View opportunity'})),
      ...(ids.projects || []).map(id => ({kind:'opportunity',id,label:'View project'}))
    ].map(s => `<button data-chat="source" data-kind="${s.kind}" data-id="${e(s.id)}">${e(s.label)} ${api.icon('external')}</button>`).join('');
  }
  function insightsMarkup() {
    const data = insightData(), available=(data.insights||[]).slice(0,3), items=showAllInsights?available:available.slice(0,2);
    return `<div class="insight-heading"><h2>Worth a thought</h2><div><span>${data.checkedAt ? `Checked ${e(time(data.checkedAt))}` : 'From your records'}</span><button class="icon-button" data-chat="refresh" aria-label="Refresh insights" ${refreshing?'disabled':''}>${api.icon('refresh')}</button></div></div>
      <div class="insight-list">${items.length ? items.map((item,i)=>`<article class="insight-row"><div class="insight-copy"><h3><button data-chat="insight" data-index="${i}">${e(item.title)} ${api.icon('arrow')}</button></h3><p>${e(item.summary)}</p><details><summary>Why this surfaced</summary><div class="insight-evidence">${(item.evidence||[]).map(v=>`<p><strong>${e(v.label)}</strong> ${e(typeof v.value==='object'?JSON.stringify(v.value):v.value)}</p>`).join('')}<div class="insight-sources">${sourceButtons(item)}</div><small>Based on illustrative records as of October 24, 2026.</small></div></details></div></article>`).join('') : '<p class="insight-empty">No suggestions supported by these records yet. Add people and events to help Roots find a useful connection.</p>'}</div>
      ${available.length>2?`<button class="insight-more" data-chat="more-insights">${showAllInsights?'Show fewer suggestions':'One more suggestion'} ${api.icon(showAllInsights?'chevron-down':'plus')}</button>`:''}<p class="insight-caption">From your demo records · Rechecked when records change and every 30 minutes while open.${bridge()?.insightError ? `<span class="chat-inline-error"> Could not refresh from the assistant. ${e(bridge().insightError)}</span>` : ''}</p>`;
  }
  function connectionMarkup() {
    const status = bridge()?.status;
    return `<button class="chat-connection" data-chat="connection"><span class="connection-dot ${status?.geminiConfigured&&!status?.syncError?'connected':''}"></span><span class="connection-full">${status?.syncError?'Sync needs attention':status?.geminiConfigured?'Assistant connected':'Connect assistant'}</span><span class="connection-short">${status?.syncError?'Sync issue':status?.geminiConfigured?'Connected':'Connect'}</span>${api.icon('chevron-down')}</button>`;
  }
  function draftMarkup(draft) {
    const current = bridge()?.activity?.drafts?.find(d=>d.id===draft.id) || draft;
    const name = current.personName || current.recipient || 'Volunteer';
    const channel = String(current.channel || 'sms').toUpperCase();
    const editing = edits.has(current.id);
    const blockers = current.readiness?.blockers || [{message:'Delivery is not connected.'}];
    return `<section class="chat-draft" aria-label="${e(channel)} draft for ${e(name)}" data-draft-card="${e(current.id)}"><div class="chat-draft-heading"><span>${api.icon('message')}${e(channel)} draft</span><span>Not sent</span></div><div class="chat-draft-recipient">To <button data-chat="person" data-id="${e(current.personId)}">${e(name)}</button>${current.phone?`<span>${e(current.phone)}</span>`:''}</div>${current.subject?`<p class="chat-draft-subject">${e(current.subject)}</p>`:''}
      ${editing ? `<form class="chat-edit-form" data-draft-id="${e(current.id)}"><label class="sr-only" for="edit-${e(current.id)}">Edit message for ${e(name)}</label><textarea id="edit-${e(current.id)}" name="body" maxlength="2000" required>${e(edits.get(current.id))}</textarea><div><button class="button primary" type="submit">Save draft</button><button class="button" type="button" data-chat="cancel-edit" data-id="${e(current.id)}">Cancel</button></div><p class="chat-edit-error" role="alert"></p></form>` : `<p class="chat-draft-body">${e(current.body)}</p><div class="chat-draft-controls"><button class="text-button" data-chat="edit" data-id="${e(current.id)}">Edit message</button><button class="text-button" data-chat="copy" data-id="${e(current.id)}">Copy</button><button class="text-button" data-chat="refine" data-id="${e(current.id)}">Refine in chat ${api.icon('arrow')}</button></div>`}
      <div class="chat-draft-readiness"><span>${api.icon('info')}</span><p>${blockers.map(b=>e(b.message || b)).join(' ')}${!blockers.length?'Ready for review. Delivery is not enabled.':''}</p></div></section>`;
  }
  function messageMarkup(message) {
    if (message.role === 'user') return `<article class="chat-message user-message"><span class="sr-only">You</span><p>${e(message.text)}</p></article>`;
    const displayText=(message.drafts||[]).length?String(message.text||'').replace(/\n\nDraft saved, not sent\. Email and SMS delivery are not connected\.$/,''):message.text;
    const text = e(displayText).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>');
    return `<article class="chat-message assistant-message"><div class="assistant-name">${api.icon('sprout')}${message.role==='workspace'?'From your drafts':'Roots'}</div><div class="chat-response-text">${text}</div>${(message.drafts || []).map(draftMarkup).join('')}</article>`;
  }
  function messagesMarkup() {
    return messages.map(messageMarkup).join('') + (pending ? '<div class="chat-thinking" role="status"><span></span>Checking your records…</div>' : '') + (error ? `<div class="chat-error" role="alert"><p>${e(error)}</p><button class="text-button" data-chat="recover">${errorCode==='CONVERSATION_UNAVAILABLE'?'Start a new chat':'Try again'}</button></div>` : '');
  }
  function render() {
    checkLocalRecords();
    return `<div class="conversation-workspace"><div class="chat-tools"><div id="chat-connection">${connectionMarkup()}</div><div class="chat-tools-links"><button data-chat="drafts">Drafts</button><button data-chat="workflows">Workflows</button><button data-chat="new" ${pending?'disabled':''}>New chat</button></div></div>
      <div class="conversation-column ${messages.length?'has-conversation':''}"><div class="chat-intro"><div class="chat-sprout">${api.icon('sprout')}</div><h1>What could we make happen?</h1><p>A little insight into your community. A useful next step.</p></div>
      <section id="chat-insights" class="chat-insights" aria-label="Insights from your records">${insightsMarkup()}</section>
      <div id="chat-transcript" class="chat-transcript" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">${messagesMarkup()}</div>
      <div class="chat-composer-dock"><form id="roots-conversation-form" class="chat-composer"><label class="sr-only" for="roots-conversation-input">Ask Roots about your community</label><textarea id="roots-conversation-input" name="message" rows="2" maxlength="2000" placeholder="Ask a question, explore an idea, or draft a message…" required>${e(composer)}</textarea><div class="chat-composer-bottom"><span>${api.icon('users')}Your community in context</span><button type="submit" class="chat-send" aria-label="Send message to Roots" ${pending?'disabled':''}>${api.icon('arrow')}</button></div></form><div id="chat-composer-note" class="chat-composer-note">${bridge()?.status?.geminiConfigured?'You review every draft. SMS and email delivery are not connected.':'Explore your records here. Connect the local assistant to chat and create drafts.'}</div></div></div></div>`;
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
    const send = document.querySelector('.chat-send');
    if (send) send.disabled=pending;
    const fresh=document.querySelector('[data-chat=new]');if(fresh)fresh.disabled=pending;
    if(editingFocus?.id){const field=document.getElementById(editingFocus.id);field?.focus({preventScroll:true});if(field&&editingFocus.start!=null)field.setSelectionRange(editingFocus.start,editingFocus.end);}
    if (scroll&&!editingFocus) document.querySelector('.chat-composer-dock')?.scrollIntoView({block:'end',behavior:'auto'});
  }
  function refreshConnection() {
    if (!active()) return;
    const target=document.getElementById('chat-connection');
    if(target)target.innerHTML=connectionMarkup();
    const note=document.getElementById('chat-composer-note');
    if(note)note.textContent=bridge()?.status?.syncError?'Your latest changes could not be synced. Open the connection details to retry.':bridge()?.status?.geminiConfigured?'You review every draft. SMS and email delivery are not connected.':'Explore your records here. Connect the local assistant to chat and create drafts.';
  }
  function refreshInsightsView() {
    if (!active()) return;
    const openIds = Array.from(document.querySelectorAll('#chat-insights details')).map((d,i)=>d.open?i:-1);
    const target=document.getElementById('chat-insights');
    if(target)target.innerHTML=insightsMarkup();
    document.querySelectorAll('#chat-insights details').forEach((d,i)=>d.open=openIds.includes(i));
  }
  async function refreshInsights(force = false) {
    if (refreshing || !api) return;
    refreshing=true;refreshInsightsView();
    try {
      checkLocalRecords(force);
      if (bridge()?.status?.connected) { await bridge().flush(); await bridge().loadInsights(force); }
    } catch(error) { if(force)api.toast(error.message); }
    finally { refreshing=false;refreshInsightsView(); }
  }
  function setPrompt(text) {
    composer=text;save();
    if(!active()){location.hash='chat';return;}
    const input=document.getElementById('roots-conversation-input');
    if(input){input.value=composer;sizeInput();input.focus();input.scrollIntoView({block:'nearest',behavior:'auto'});}
  }
  function connection() {
    const status=bridge()?.status;
    api.openDialog('Assistant connection',`<h2 id="dialog-title">Your community, in the conversation.</h2><p class="lead">The local assistant connects Gemini, this dashboard, and Telegram to the same demo records.</p><section class="dialog-section"><h3>${status?.geminiConfigured?'Gemini is connected':'Connect the local assistant'}</h3><p>${status?.geminiConfigured?'Questions use your current dashboard records. The conversation can create and edit unsent drafts.':'The published preview is interactive, but its AI connection is not hosted yet. Open the running local workspace to talk with Roots.'}</p>${!status?.geminiConfigured?'<a class="button primary" href="http://127.0.0.1:4180/#chat" target="_blank" rel="noopener">Open local workspace</a>':''}${status?.syncError?`<p class="chat-inline-error">${e(status.syncError)}</p><button class="button" data-chat="retry-connection">Retry connection</button>`:''}</section><section class="dialog-section"><h3>Telegram</h3><p>${status?.telegramErrorCode?'The bot connection needs attention. Another listener may be active.':status?.polling?`@${e(status.botUsername||'josh_padelwatch_260804_bot')} shares this workspace. Start a request with /roots. The local test must stay running.`:'Telegram is available through the local test when its bot connection is running.'}</p>${status?.polling?`<a class="text-button" href="https://t.me/${encodeURIComponent(status.botUsername||'josh_padelwatch_260804_bot')}" target="_blank" rel="noopener">Open Telegram ${api.icon('external')}</a>`:''}</section><section class="dialog-section"><h3>SMS actions</h3><p>Roots can choose a person from your records and prepare a message to review and edit. Phone numbers and an SMS delivery service still need connecting before anything can be sent.</p></section>`);
  }
  async function send(text) {
    text=String(text||'').trim();
    if(!text||pending)return;
    if(!bridge()?.status?.geminiConfigured){setPrompt(text);connection();return;}
    composer='';error='';errorCode='';pending=true;
    messages.push({role:'user',text});save();
    const input=document.getElementById('roots-conversation-input');if(input)input.value='';sizeInput();refreshMessages(true);
    try {
      const result=await bridge().chat(text,conversationId);
      conversationId=result.conversationId||conversationId;
      messages.push({role:'assistant',text:result.reply||'The request is complete.',drafts:result.drafts||[]});
      await bridge().loadActivity().catch(()=>{});
    } catch(err) {
      errorCode=err.code||'';
      error=err.code==='CONVERSATION_UNAVAILABLE'?'This conversation is no longer available on this browser connection. Start a new conversation and repeat your request.':err.message;
    } finally {pending=false;save();refreshMessages(true);if(!document.activeElement?.closest('.chat-edit-form'))document.getElementById('roots-conversation-input')?.focus({preventScroll:true});}
  }
  function findDraft(id) {
    return bridge()?.activity?.drafts?.find(d=>d.id===id) || messages.flatMap(m=>m.drafts||[]).find(d=>d.id===id);
  }
  document.addEventListener('input',event=>{
    if(event.target.id==='roots-conversation-input'){composer=event.target.value;sizeInput();save();}
    const form=event.target.closest('.chat-edit-form');if(form&&event.target.name==='body')edits.set(form.dataset.draftId,event.target.value);
  });
  document.addEventListener('keydown',event=>{
    if(event.target.id==='roots-conversation-input'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();send(event.target.value);}
  });
  document.addEventListener('submit',async event=>{
    if(event.target.id==='roots-conversation-form'){event.preventDefault();send(composer);}
    if(event.target.matches('.chat-edit-form')){
      event.preventDefault();const form=event.target,id=form.dataset.draftId,button=form.querySelector('[type=submit]');form.querySelectorAll('textarea,button').forEach(field=>field.disabled=true);
      try {
        const result=await bridge().request(`/api/drafts/${encodeURIComponent(id)}/edit`,{method:'POST',body:JSON.stringify({body:edits.get(id)})});
        for(const m of messages)m.drafts=(m.drafts||[]).map(d=>d.id===id?result.draft:d);
        if(bridge().activity?.drafts)bridge().activity.drafts=bridge().activity.drafts.map(d=>d.id===id?result.draft:d);
        edits.delete(id);save();await bridge().loadActivity().catch(()=>{});refreshMessages();api.toast('Draft updated. Nothing sent.');
      }catch(err){form.querySelector('.chat-edit-error').textContent=err.message;form.querySelectorAll('textarea,button').forEach(field=>field.disabled=false);}
    }
  });
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-chat]');if(!button||!api)return;
    const action=button.dataset.chat,id=button.dataset.id;
    if(action==='drafts')window.RootsNotices.openTab('drafts');
    else if(action==='workflows')window.RootsNotices.openTab('workflows');
    else if(action==='review-draft'){const draft=findDraft(id);if(draft){if(!messages.some(m=>(m.drafts||[]).some(d=>d.id===id)))messages.push({role:'workspace',text:'',drafts:[draft]});save();reviewDraftId=id;if(active())api.render();else location.hash='chat';}}
    else if(action==='connection')connection();
    else if(action==='retry-connection'){button.disabled=true;await bridge().init();api.closeDialog();refreshConnection();}
    else if(action==='refresh')await refreshInsights(true);
    else if(action==='more-insights'){showAllInsights=!showAllInsights;refreshInsightsView();}
    else if(action==='insight'){const item=insightData().insights[Number(button.dataset.index)];if(item)setPrompt(item.suggestedPrompt);}
    else if(action==='source')({person:api.showPerson,event:api.showEvent,opportunity:api.showOpportunity})[button.dataset.kind]?.(id);
    else if(action==='person')api.showPerson(id);
    else if(action==='new'){if(pending)return;conversationId=null;messages=[];error='';save();api.render();document.getElementById('roots-conversation-input')?.focus();}
    else if(action==='recover'){
      const last=messages.filter(m=>m.role==='user').at(-1)?.text||'';
      if(errorCode==='CONVERSATION_UNAVAILABLE'){conversationId=null;messages=[];error='';save();api.render();setPrompt(last);}
      else{messages.pop();send(last);}
    }else if(action==='edit'){const draft=findDraft(id);if(draft){edits.set(id,draft.body);refreshMessages();document.getElementById(`edit-${id}`)?.focus();}}
    else if(action==='cancel-edit'){edits.delete(id);refreshMessages();}
    else if(action==='refine'){const d=findDraft(id);if(d)setPrompt(`Revise the ${d.channel} draft for ${d.personName||d.recipient} (${d.personId}). Current draft: ${d.body}\nMake it `);}
    else if(action==='copy'){const d=findDraft(id);if(d)try{await navigator.clipboard.writeText(d.body);api.toast('Message copied. Nothing sent.');}catch{api.toast('Copy is unavailable. Select the message text to copy it.');}}
  });
  window.addEventListener('roots:ready',()=>{refreshConnection();refreshInsightsView();});
  window.addEventListener('roots:connection',()=>{
    refreshConnection();
    if(!api)return;
    const previous=fingerprint;checkLocalRecords();
    if(previous!==fingerprint){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>bridge()?.loadInsights().catch(()=>{}),400);refreshInsightsView();}
  });
  window.addEventListener('roots:records-changed',()=>{if(api){checkLocalRecords();if(bridge()?.status?.connected){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refreshInsights(),350);}else refreshInsightsView();}});
  window.addEventListener('roots:insights',refreshInsightsView);
  window.addEventListener('roots:activity',()=>{if(!edits.size)refreshMessages();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&api)refreshInsights();});
  setInterval(()=>{if(!document.hidden&&api)refreshInsights();},30*60*1000);
  window.RootsChat={configure(callbacks){api=callbacks;},render,afterRender,setPrompt};
})();
