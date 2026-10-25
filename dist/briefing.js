(() => {
  let api, checkedLocally=null, localInsights=[], fingerprint='', refreshTimer=null, pollTimer=null;
  let checking=false, showMore=false, prompt='', lastRendered='', lastStatus='', checkError='', refreshNotice='';
  const e=value=>api.esc(value);
  const bridge=()=>window.RootsBridge;
  const visible=()=>api?.getState().view==='briefing';
  const time=value=>value?new Date(value).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'';
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
  function sourceButtons(item) {
    const ids = item.sourceIds || {};
    return [
      ...(ids.people || []).map(id => ({kind:'person', id, label:api.getState().people.find(p=>p.id===id)?.name || 'View person'})),
      ...(ids.events || []).map(id => ({kind:'event',id,label:'View event'})),
      ...(ids.opportunities || []).map(id => ({kind:'opportunity',id,label:'View opportunity'})),
      ...(ids.projects || []).map(id => ({kind:'opportunity',id,label:'View project'}))
    ].map(s => `<button data-briefing="source" data-kind="${s.kind}" data-id="${e(s.id)}">${e(s.label)} ${api.icon('external')}</button>`).join('');
  }
  function current() {
    return bridge()?.insights || {insights:localInsights,checkedAt:checkedLocally,source:'browser-records',illustrative:true,asOf:'2026-10-24'};
  }
  function working() { return checking || (!checkError && !bridge()?.insightError && ['pending','reviewing'].includes(current().generation?.status)); }
  function statusMarkup() {
    const data=current(), busy=working(), ai=data.source==='gemini-synthesis';
    const failed=data.generation?.status==='failed'||checkError||bridge()?.insightError;
    const heading=busy?(data.generation?.status==='reviewing'?'Finding useful connections…':'Checking your community…'):failed?(data.hasPreviousBriefing?'Your last briefing is still here.':'Your record matches are still here.'):ai?'Your latest briefing is ready.':'A few connections in your records.';
    const details=busy?'Looking across people, opportunities and project plans.':failed?'The latest review could not finish. You can try again.':data.stale?'New information has arrived. These suggestions use the previous review.':ai?`Reviewed ${time(data.checkedAt)} · Suggestions from Gemini, with record references.`:`Checked ${time(data.checkedAt)} · Record matches${bridge()?.status?.geminiConfigured?'':' · Connect Roots for AI review'}.`;
    return `<div class="briefing-status ${busy?'is-reviewing':''}" role="status"><span class="insight-motion" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none"><path d="M12 28c0-10 20-10 20-20M12 8c0 10 20 10 20 20M8 22h28"/><circle cx="12" cy="8" r="3"/><circle cx="32" cy="8" r="3"/><circle cx="12" cy="28" r="3"/><circle cx="32" cy="28" r="3"/><circle cx="22" cy="18" r="3"/></svg></span><div><strong>${e(heading)}</strong><p>${e(details)}</p></div><button class="briefing-refresh" data-briefing="refresh" ${busy?'disabled':''} aria-label="${failed?'Retry insight review':'Refresh briefing'}">${api.icon('refresh')}<span>${failed?'Try again':'Check again'}</span></button></div>${busy?'<div class="briefing-scan" aria-hidden="true"><span></span></div>':''}${data.stale&&busy?'<p class="briefing-update-note">Previous suggestions stay visible until the new review is ready.</p>':''}${refreshNotice&&!busy?`<p class="briefing-update-note">${e(refreshNotice)}</p>`:''}`;
  }
  function coverageMarkup() {
    const state=api.getState(), data=current();
    const counts=data.coverage?.total||data.coverage||{};
    const people=Number.isFinite(counts.people)?counts.people:state.people.length;
    const opportunities=Number.isFinite(counts.opportunities)?counts.opportunities:window.RootsOpportunities.list().length;
    const projects=Number.isFinite(counts.projects)?counts.projects:window.RootsOpportunities.projects().length;
    return `<span>${people} people</span><span>${opportunities} opportunities</span><span>${projects} project plans</span><details><summary>How this works ${api.icon('info')}</summary><div><p>Roots reviews the latest saved people, events, opportunities and project plans. New information prompts a fresh review; chat history is separate.</p><p>${data.source==='gemini-synthesis'?'Gemini prioritizes possible connections from a bounded set of record facts. References and evidence are checked against those records. Recommendations still need your judgement.':'These matches come directly from the demo records. The local AI connection can review and prioritize them independently of chat.'}</p><p>Illustrative records as of ${e(data.asOf||'2026-10-24')}. Opportunities are leads to verify, not confirmed benefits.</p></div></details>`;
  }
  function actionFor(item) {
    const ids=item.sourceIds||{}, action=item.action;
    if(action?.kind==='draft' && (action.personIds||ids.people||[]).length)return {kind:'draft',label:action.label||'Review a message',ids:action.personIds||ids.people};
    if(action?.kind==='opportunity'&&action.recordId)return {kind:'opportunity',id:action.recordId,label:action.label||'Explore opportunity'};
    if((item.type==='event_capacity'||item.id==='local-garden')&&ids.people?.length)return {kind:'draft',ids:ids.people,label:'Review invitation'};
    if(ids.projects?.length)return {kind:'opportunity',id:ids.projects[0],label:'Review project'};
    if(ids.opportunities?.length)return {kind:'opportunity',id:ids.opportunities[0],label:'Explore opportunity'};
    if(ids.people?.length)return {kind:'people',ids:ids.people,label:ids.people.length===1?'View person':'Review people'};
    return {kind:'discuss',label:'Explore with Roots'};
  }
  function insightMarkup(item,index) {
    const action=actionFor(item), category=action.kind==='draft'?'A reason to reconnect':action.kind==='opportunity'?'A possibility to explore':'A connection to consider';
    return `<article class="briefing-insight" data-insight-id="${e(item.id)}"><div class="briefing-insight-title"><h2>${e(item.title)}</h2>${api.icon(index===0?'sprout':'leaf')}</div><p class="briefing-insight-summary">${e(item.summary)}</p>${item.suggestion?`<p class="briefing-interpretation"><strong>Possible next step:</strong> ${e(item.suggestion)}</p>`:''}<div class="briefing-insight-actions"><button class="briefing-action" data-briefing="action" data-index="${index}">${e(action.label)} ${api.icon('arrow')}</button><span>${category}</span></div><details class="briefing-evidence"><summary>Evidence & things to check</summary><div>${(item.evidence||[]).map(v=>`<p><strong>${e(v.label)}:</strong> ${e(typeof v.value==='object'?JSON.stringify(v.value):v.value)}</p>`).join('')}<div class="insight-sources">${sourceButtons(item)}</div><button class="briefing-discuss" data-briefing="discuss" data-index="${index}">${api.icon('message')}Discuss this with Roots</button></div></details></article>`;
  }
  function insightsMarkup() {
    const items=(current().insights||[]).slice(0,3);
    return items.length?items.slice(0,showMore?3:2).map(insightMarkup).join('')+(items.length>2?`<button class="briefing-more" data-briefing="more">${showMore?'Show fewer suggestions':'One more connection'} ${api.icon(showMore?'chevron-down':'plus')}</button>`:''):`<div class="briefing-empty"><h2>A little more context will help.</h2><p>Add people and opportunities, then Roots can look for useful connections.</p><a class="briefing-action" href="#people">Explore your people ${api.icon('arrow')}</a></div>`;
  }
  function render() {
    checkLocalRecords();lastRendered='';lastStatus=statusMarkup();
    return `<div class="briefing-shell"><header class="briefing-heading"><h1>Your community, right now.</h1><p>Good possibilities. A clear next step.</p></header><section aria-label="Current insight review"><div id="briefing-status">${lastStatus}</div><div id="briefing-coverage" class="briefing-coverage">${coverageMarkup()}</div></section><section id="briefing-insights" class="briefing-insights" aria-label="Current suggestions">${insightsMarkup()}</section><div class="briefing-footer"><a href="#events">${api.icon('calendar')}See what’s coming up ${api.icon('arrow')}</a><span>Updates as your records change</span></div><form id="briefing-chat-form" class="briefing-composer"><label for="briefing-prompt" class="sr-only">Ask Roots about this briefing</label><textarea id="briefing-prompt" rows="1" maxlength="2000" placeholder="Ask about this briefing, or suggest an idea…" required>${e(prompt)}</textarea><button type="submit" aria-label="Ask Roots">${api.icon('arrow')}</button></form><p class="briefing-composer-note">Chat when you need it. Your briefing keeps its own place.</p></div>`;
  }
  function update() {
    if(!api||!visible())return;
    const status=document.getElementById('briefing-status');if(status){const markup=statusMarkup();if(lastStatus!==markup){const focused=document.activeElement?.closest('[data-briefing=refresh]');status.innerHTML=markup;lastStatus=markup;if(focused)status.querySelector('[data-briefing=refresh]')?.focus({preventScroll:true});}}
    const coverage=document.getElementById('briefing-coverage');
    if(coverage&&!coverage.querySelector('details[open]'))coverage.innerHTML=coverageMarkup();
    const data=current(), rendered=JSON.stringify([data.insights,showMore]);
    if(rendered!==lastRendered){
      const open=Array.from(document.querySelectorAll('.briefing-evidence[open]')).map(d=>d.closest('[data-insight-id]').dataset.insightId);
      const target=document.getElementById('briefing-insights');if(target)target.innerHTML=insightsMarkup();
      document.querySelectorAll('[data-insight-id]').forEach(el=>{if(open.includes(el.dataset.insightId))el.querySelector('details').open=true;});
      lastRendered=rendered;
    }
  }
  function schedulePoll() {
    clearTimeout(pollTimer);
    if(!document.hidden&&!checkError&&!bridge()?.insightError&&['pending','reviewing'].includes(current().generation?.status))pollTimer=setTimeout(()=>bridge().loadInsights().catch(()=>{}),2000);
  }
  async function refresh(force=false) {
    if(checking||!api)return;
    checking=true;checkError='';refreshNotice='';update();
    try {
      const before=JSON.stringify(current().insights);
      checkLocalRecords(force);
      if(bridge()?.status?.connected){await bridge().flush();await bridge().loadInsights(force);}
      else if(force)refreshNotice='Record matches checked. Connect the local assistant for an AI review.';
      if(force&&bridge()?.status?.connected&&!['pending','reviewing','failed'].includes(current().generation?.status)&&before===JSON.stringify(current().insights))refreshNotice='No changes to the suggestions since the last check.';
    }catch(error){checkError=error.message;}
    finally{checking=false;update();schedulePoll();}
  }
  function openAction(item) {
    const action=actionFor(item);
    if(action.kind==='opportunity')api.showOpportunity(action.id);
    else if(action.kind==='draft')window.RootsNotices.compose(null,null,action.ids,{eventId:item.sourceIds?.events?.[0]});
    else if(action.kind==='people'){
      if(action.ids.length===1)api.showPerson(action.ids[0]);
      else api.openDialog('People behind this connection',`<h2 id="dialog-title">${e(item.title)}</h2><p class="lead">Review the people referenced in this suggestion.</p><div class="briefing-people">${action.ids.map(id=>api.getState().people.find(p=>p.id===id)).filter(Boolean).map(p=>`<button data-briefing="source" data-kind="person" data-id="${e(p.id)}">${api.avatar(p)}<span><strong>${e(p.name)}</strong><small>${e(window.RootsPeople.profileData(p).availability)}</small></span>${api.icon('arrow')}</button>`).join('')}</div>`);
    }else window.RootsChat.setPrompt(item.suggestedPrompt||`Help me explore this suggestion: ${item.title}`);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-briefing]');if(!button||!api)return;
    const kind=button.dataset.briefing;
    if(kind==='refresh')refresh(true);
    else if(kind==='more'){showMore=!showMore;update();}
    else if(kind==='source')({person:api.showPerson,event:api.showEvent,opportunity:api.showOpportunity})[button.dataset.kind]?.(button.dataset.id);
    else if(kind==='action'||kind==='discuss'){
      const item=current().insights[Number(button.dataset.index)];if(!item)return;
      if(kind==='action')openAction(item);else window.RootsChat.setPrompt(item.suggestedPrompt||`Help me explore this suggestion: ${item.title}`);
    }
  });
  document.addEventListener('input',event=>{if(event.target.id==='briefing-prompt')prompt=event.target.value;});
  document.addEventListener('submit',event=>{if(event.target.id==='briefing-chat-form'){event.preventDefault();const text=prompt.trim();if(text){prompt='';window.RootsChat.ask(text);}}});
  document.addEventListener('keydown',event=>{if(event.target.id==='briefing-prompt'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();event.target.form.requestSubmit();}});
  window.addEventListener('roots:ready',()=>{update();schedulePoll();});
  window.addEventListener('roots:insights',()=>{update();schedulePoll();});
  window.addEventListener('roots:records-changed',()=>{if(api){checkLocalRecords();clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refresh(),600);update();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(pollTimer);else if(api)refresh();});
  setInterval(()=>{if(!document.hidden&&api)refresh();},30*60*1000);
  window.RootsBriefing={configure(callbacks){api=callbacks;},render};
})();
