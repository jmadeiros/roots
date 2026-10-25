(() => {
  let api, checkedLocally=null, localInsights=[], fingerprint='', refreshTimer=null, pollTimer=null;
  let checking=false, showMore=false, prompt='', lastRendered='', lastStatus='', checkError='', refreshNotice='', analyticsTab='participation', lastAnalytics='';
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
    const label=busy?'Looking for useful connections…':failed?(data.hasPreviousBriefing?'Your last briefing is still here.':'Record matches are still available.'):ai?`AI reviewed ${time(data.checkedAt)}`:`Record matches · Checked ${time(data.checkedAt)}`;
    const note=failed?'The latest review could not finish.':data.stale&&!busy?'A fresh review is needed.':'';
    return `<div class="briefing-fresh ${busy?'is-reviewing':''}" role="status"><span class="briefing-presence" aria-hidden="true">${busy?'<i></i><i></i><i></i>':api.icon('check')}</span><span>${e(label)}</span>${note?`<span>${e(note)}</span>`:''}<span aria-hidden="true">·</span><button class="briefing-refresh" data-briefing="refresh" ${busy?'disabled':''} aria-label="${failed?'Retry insight review':'Refresh briefing'}">${failed?'Try again':'Check again'}</button></div>${refreshNotice&&!busy?`<p class="briefing-update-note">${e(refreshNotice)}</p>`:''}`;
  }
  function coverageMarkup() {
    const state=api.getState(), data=current(), counts=data.coverage||{};
    return `<details class="briefing-about"><summary>How Roots finds these ideas</summary><div><p>${data.source==='gemini-synthesis'?'Gemini reviews a bounded set of connections found in your saved records, independently of chat.':'These suggestions are matches from your saved demo records. The local AI connection can review and prioritize them independently of chat.'}</p><p>The workspace has ${counts.people??state.people.length} people, ${counts.opportunities??window.RootsOpportunities.list().length} opportunities and ${counts.projects??window.RootsOpportunities.projects().length} project plans. Roots checks again when records change, and every 30 minutes while open.</p><p>All records are illustrative${data.asOf?' as of '+e(data.asOf):''}. Recommendations are possibilities to explore; funding, attendance and eligibility still need checking. Messages remain drafts.</p></div></details>`;
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
    const action=actionFor(item), people=(item.sourceIds?.people||[]).map(id=>api.getState().people.find(p=>p.id===id)).filter(Boolean);
    const peopleMarkup=people.length?`<div class="overview-source-people">${people.slice(0,3).map(p=>`<button data-briefing="source" data-kind="person" data-id="${e(p.id)}" aria-label="View ${e(p.name)}">${api.avatar(p)}</button>`).join('')}<span>${people.length} ${people.length===1?'person':'people'} referenced</span></div>`:'';
    return `<article class="briefing-insight ${index===0?'featured':''}" data-insight-id="${e(item.id)}"><h3>${e(item.title)}</h3><p class="briefing-insight-summary">${e(item.summary)}</p><div class="briefing-insight-actions">${peopleMarkup}<button class="button ${index===0?'primary':'quiet'}" data-briefing="action" data-index="${index}">${e(action.label)} ${api.icon('arrow')}</button></div><details class="briefing-evidence"><summary>Why this surfaced</summary><div>${item.suggestion?`<p><strong>Suggested next step:</strong> ${e(item.suggestion)}</p>`:''}${(item.evidence||[]).map(v=>`<p><strong>${e(v.label)}:</strong> ${e(typeof v.value==='object'?JSON.stringify(v.value):v.value)}</p>`).join('')}<div class="insight-sources">${sourceButtons(item)}</div><button class="briefing-discuss" data-briefing="discuss" data-index="${index}">${api.icon('message')}Discuss this with Roots</button></div></details></article>`;
  }
  function insightsMarkup() {
    const items=(current().insights||[]).slice(0,3);
    return items.length?items.slice(0,showMore?3:2).map(insightMarkup).join('')+(items.length>2?`<button class="briefing-more" data-briefing="more">${showMore?'Show fewer ideas':'One more idea'} ${api.icon(showMore?'chevron-down':'plus')}</button>`:''):`<div class="briefing-empty"><h2>A little more context will help.</h2><p>Add people and opportunities, then Roots can look for useful connections.</p><a class="briefing-action" href="#people">Explore your people ${api.icon('arrow')}</a></div>`;
  }
  const number=value=>typeof value==='number'?value.toLocaleString(undefined,{maximumFractionDigits:1}):'—';
  const stats=()=>window.RootsAnalytics.compute(api.getState(),window.RootsPeople.profileData);
  function snapshotMarkup(a) {
    return `<button class="overview-metric" data-dashboard-group="all"><span>People ${api.icon('users')}</span><strong>${number(a.people.total)}</strong><small>${number(a.visits.first)} with one recorded visit ${api.icon('arrow')}</small></button><button class="overview-metric" data-dashboard-group="hours"><span>Recorded hours ${api.icon('clock')}</span><strong>${number(a.hours.total)}</strong><small>Across ${number(a.hours.known)} profiles ${api.icon('arrow')}</small></button><a class="overview-metric" href="#opportunities"><span>Opportunity leads ${api.icon('leaf')}</span><strong>${window.RootsOpportunities.list().length}</strong><small>Explore possible matches ${api.icon('arrow')}</small></a>`;
  }
  function patternsMarkup(a) {
    if(analyticsTab==='interests')return `<div class="overview-interests">${a.interests.top.length?a.interests.top.map(item=>`<button data-dashboard-group="interest" data-interest="${e(item.name)}"><span>${e(item.name)}<strong>${item.count}</strong></span><span class="overview-interest-track" aria-hidden="true"><i style="width:${a.people.total?100*item.count/a.people.total:0}%"></i></span></button>`).join(''):'<p class="overview-empty">Add interests to see what brings people together.</p>'}</div><p class="overview-chart-note">People can have more than one interest. Select a bar to see who.</p>`;
    const groups=[['first','One visit',a.visits.first],['repeat','Repeat visits',a.visits.repeat],['zero','No visits yet',a.visits.zero],['unknown','Not recorded',a.visits.unknown]].filter(g=>g[2]>0);
    return `<div class="overview-participation-value"><strong>${a.visits.repeatShare===null?'—':Math.round(a.visits.repeatShare*100)+'%'}</strong><span>have visited more than once<small>Of profiles with at least one recorded visit</small></span></div>${a.people.total?`<div class="overview-participation-bar" aria-label="Visit counts by person">${groups.map(([key,label,count])=>`<button data-dashboard-group="${key}" class="participation-${key}" style="width:${count/a.people.total*100}%" aria-label="${e(label)}: ${count} people"></button>`).join('')}</div><div class="overview-chart-legend">${groups.map(([key,label,count])=>`<button data-dashboard-group="${key}"><i class="participation-${key}" aria-hidden="true"></i>${label}<strong>${count}</strong></button>`).join('')}</div>`:'<p class="overview-empty">Add people to see participation patterns.</p>'}<p class="overview-chart-note">Based on total visits in each profile. Select a group to see the people.</p>`;
  }
  function eventsMarkup() {
    const events=api.getState().events;
    return events.slice(0,3).map(event=>{const valid=Number.isInteger(event.capacity)&&Number.isInteger(event.attendees)&&event.capacity>=0&&event.attendees>=0&&event.attendees<=event.capacity;return `<button class="overview-event" data-briefing="source" data-kind="event" data-id="${e(event.id)}"><span class="date-tile"><small>${e(event.month)}</small><strong>${e(event.day)}</strong></span><span class="overview-event-copy"><strong>${e(event.title)}</strong><small>${e(event.time)}</small>${valid?`<span class="overview-event-track" aria-hidden="true"><i style="width:${event.capacity?100*event.attendees/event.capacity:0}%"></i></span><span class="overview-event-capacity">${event.attendees} / ${event.capacity} places recorded<span>${event.capacity-event.attendees} open</span></span>`:'<span class="overview-event-capacity">Capacity not recorded</span>'}</span></button>`;}).join('')||'<p class="overview-empty">No events recorded yet.</p>';
  }
  function render() {
    checkLocalRecords();lastRendered='';lastStatus=statusMarkup();lastAnalytics='';
    const a=stats();
    return `<div class="overview-shell"><header class="overview-heading"><div><h1>Good things are taking root.</h1><p>Your community, the patterns, and what to do next.</p></div><span class="overview-scope">${api.icon('calendar')}Current records</span></header><section class="overview-metrics" id="overview-metrics" aria-label="Community snapshot">${snapshotMarkup(a)}</section><div class="overview-columns"><section class="overview-insight-column"><div class="overview-section-heading"><h2>Worth your attention ${api.icon('sparkles')}</h2><div id="briefing-status">${lastStatus}</div></div><div id="briefing-insights" class="briefing-insights" aria-label="Current suggestions">${insightsMarkup()}</div><div id="briefing-coverage">${coverageMarkup()}</div><form id="briefing-chat-form" class="briefing-composer"><label for="briefing-prompt" class="sr-only">Ask Roots about these insights</label><span class="overview-ask-mark" aria-hidden="true">${api.icon('sprout')}</span><textarea id="briefing-prompt" rows="1" maxlength="2000" placeholder="Ask Roots about your community…" required>${e(prompt)}</textarea><button type="submit" aria-label="Ask Roots">${api.icon('arrow')}</button></form></section><aside class="overview-analytics-column" aria-label="Community analytics"><section class="overview-patterns"><div class="overview-section-heading"><h2>Community patterns</h2></div><div class="overview-chart-tabs" role="group" aria-label="Community chart"><button data-dashboard-tab="participation" aria-pressed="${analyticsTab==='participation'}">Participation</button><button data-dashboard-tab="interests" aria-pressed="${analyticsTab==='interests'}">Interests</button></div><div id="overview-patterns">${patternsMarkup(a)}</div></section><section class="overview-coming"><div class="overview-section-heading"><h2>Coming up</h2><a href="#events">View all ${api.icon('arrow')}</a></div><div id="overview-events">${eventsMarkup()}</div></section></aside></div><p class="overview-data-note">${api.icon('info')}Snapshot of illustrative records · Totals update as your records change.</p></div>`;
  }
  function updateAnalytics() {
    const target=document.getElementById('overview-patterns');if(!target)return;
    const a=stats(), fingerprint=JSON.stringify([a,analyticsTab,api.getState().events,window.RootsOpportunities.list().length]);if(fingerprint===lastAnalytics)return;
    target.innerHTML=patternsMarkup(a);document.getElementById('overview-metrics').innerHTML=snapshotMarkup(a);document.getElementById('overview-events').innerHTML=eventsMarkup();
    document.querySelectorAll('[data-dashboard-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.dashboardTab===analyticsTab)));lastAnalytics=fingerprint;
  }
  function openGroup(group,interest) {
    const a=stats(), ids=group==='all'?a.people.ids:group==='hours'?a.hours.ids.known:group==='interest'?a.interests.top.find(item=>item.name===interest)?.personIds||[]:a.visits.ids[group]||[];
    const title=({all:'People in your community',hours:'Recorded volunteer hours',first:'People with one recorded visit',repeat:'People with repeat visits',zero:'People with no recorded visits',unknown:'Visit counts not recorded'})[group]||interest;
    let people=ids.map(id=>api.getState().people.find(p=>p.id===id)).filter(Boolean);if(group==='hours')people=people.sort((a,b)=>(b.hours||0)-(a.hours||0));
    api.openDialog('Community records',`<h2 id="dialog-title">${e(title)}</h2><p class="lead">${people.length} ${people.length===1?'person':'people'} in the current records. Select a profile to explore the details.</p><div class="briefing-people">${people.map(p=>`<button data-briefing="source" data-kind="person" data-id="${e(p.id)}">${api.avatar(p)}<span><strong>${e(p.name)}</strong><small>${group==='hours'?number(p.hours)+(p.hours===1?' recorded hour':' recorded hours'):Number.isInteger(p.visits)&&p.visits>=0?number(p.visits)+(p.visits===1?' recorded visit':' recorded visits'):'Visit count not recorded'}</small></span>${api.icon('arrow')}</button>`).join('')}</div>`);
  }
  function update() {
    if(!api||!visible())return;
    const status=document.getElementById('briefing-status');if(status){const markup=statusMarkup();if(lastStatus!==markup){const focused=document.activeElement?.closest('[data-briefing=refresh]');status.innerHTML=markup;lastStatus=markup;if(focused)status.querySelector('[data-briefing=refresh]')?.focus({preventScroll:true});}}
    const coverage=document.getElementById('briefing-coverage');
    if(coverage&&!coverage.querySelector('details[open]'))coverage.innerHTML=coverageMarkup();
    const data=current(), rendered=JSON.stringify([data.insights,showMore]);
    updateAnalytics();
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
    if(!api)return;
    const chart=event.target.closest('[data-dashboard-tab]');if(chart){analyticsTab=chart.dataset.dashboardTab;updateAnalytics();return;}
    const group=event.target.closest('[data-dashboard-group]');if(group){openGroup(group.dataset.dashboardGroup,group.dataset.interest);return;}
    const button=event.target.closest('[data-briefing]');if(!button)return;
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
