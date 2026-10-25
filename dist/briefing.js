(() => {
  let api, checkedLocally=null, localInsights=[], fingerprint='', refreshTimer=null, pollTimer=null;
  let checking=false, prompt='', lastRendered='', lastStatus='', checkError='', refreshNotice='', analyticsTab='interests', lastAnalytics='', dailyPeriod='today';
  const e=value=>api.esc(value);
  const bridge=()=>window.RootsBridge;
  const visible=()=>api?.getState().view==='briefing';
  const time=value=>window.RootsJournal.formatStamp(value);
  function checkLocalRecords(force = false) {
    const state = api.getState();
    const people = state.people.map(p => ({...p, ...window.RootsPeople.profileData(p)}));
    const programmes=window.RootsOpportunities.list();
    const nextFingerprint = JSON.stringify({people,events:state.events,programmes,projects:window.RootsOpportunities.projects()});
    if (!force && nextFingerprint === fingerprint) return;
    fingerprint = nextFingerprint;
    checkedLocally = new Date().toISOString();
    localInsights = [];
    const grant=programmes.find(p=>p.stage==='open'&&p.matchKind==='education'&&p.matchCount>0);
    if(grant)localInsights.push({id:'local-funded-education',type:'programme',title:`${grant.matchCount} students could give an education grant a clear purpose.`,summary:`${grant.title} offers ${grant.headlineBenefit.toLowerCase()}. ${grant.readiness.summary}`,evidence:[...(grant.readiness.facts||[]),{label:'Still to establish',value:(grant.readiness.gaps||[]).join(' ')}],sourceIds:{people:grant.matches.map(m=>m.personId),opportunities:[grant.id]},action:{kind:'opportunity',recordId:grant.id,label:'Explore the grant'},suggestedPrompt:`Help build a practical proposal for ${grant.title}. Use its current requirements and our recorded students. Explain the gaps before applying.`});
    const school=programmes.find(p=>p.matchKind==='school-service'&&p.matchCount>0);
    if(school)localInsights.push({id:'local-school-needs',type:'programme',title:`${school.matchCount} school students have service hours to complete.`,summary:school.readiness.summary+' Agree a school-approved schedule, supervision and sign-off.',evidence:[...(school.readiness.facts||[]),{label:'What to confirm',value:(school.readiness.gaps||[]).join(' ')}],sourceIds:{people:school.matches.map(m=>m.personId),opportunities:[school.id]},action:{kind:'opportunity',recordId:school.id,label:'Plan the partnership'},suggestedPrompt:'Build a school service partnership around the students with recorded requirements. Show a practical schedule, supervision needs and what the schools must approve.'});
    const first=people.filter(p=>p.visits===1);
    if(first.length)localInsights.push({id:'local-first-visits',type:'participation',title:`${first.length} people have only one recorded visit.`,summary:'A personal invitation could give them a reason to return. Ask what would make the next visit worthwhile; their last visit and future bookings still need confirming.',evidence:[{label:'Recorded visits',value:'Each referenced profile has one total visit.'},{label:'What this does not establish',value:'We do not know when they last attended, whether they have booked again, or why they have not returned.'}],sourceIds:{people:first.map(p=>p.id)},action:{kind:'draft',label:'Build an invitation',personIds:first.map(p=>p.id)},suggestedPrompt:'Prepare SMS invitation drafts for people with one recorded visit and recorded SMS permission. Ask what would make another visit worthwhile. Do not imply we know when they last attended. Keep every message unsent.'});
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
    const label=busy?'Reviewing your community…':failed?(data.hasPreviousBriefing?'Your last briefing is still here.':'Record matches are still available.'):ai?`AI reviewed ${time(data.checkedAt)}`:`Record matches · Checked ${time(data.checkedAt)}`;
    const note=failed?'The latest review could not finish.':data.stale&&!busy?'A fresh review is needed.':'';
    return `<div class="briefing-fresh ${busy?'is-reviewing':''}" role="status"><span class="briefing-presence" aria-hidden="true">${busy?'<i></i><i></i><i></i>':api.icon('check')}</span><span>${e(label)}</span>${note?`<span>${e(note)}</span>`:''}${failed?'<button class="briefing-refresh" data-briefing="refresh" aria-label="Retry insight review">Try again</button>':''}</div>${refreshNotice&&!busy?`<p class="briefing-update-note">${e(refreshNotice)}</p>`:''}`;
  }
  function coverageMarkup() {
    const state=api.getState(), data=current(), counts=data.coverage||{};
    return `<details class="briefing-about"><summary>How Roots finds these ideas</summary><div><p>${data.source==='gemini-synthesis'?'Gemini reviews a bounded set of connections found in your saved records, independently of chat.':'These suggestions are matches from your saved demo records. The local AI connection can review and prioritize them independently of chat.'}</p><p>The workspace has ${counts.people??state.people.length} people, ${counts.opportunities??window.RootsOpportunities.list().length} opportunities and ${counts.projects??window.RootsOpportunities.projects().length} project plans. Roots checks again when records change, and every 30 minutes while open.</p><p>Noted and updated dates reflect observations in this browser. All records are illustrative${data.asOf?' as of '+e(data.asOf):''}. Recommendations are possibilities to explore; funding, attendance and eligibility still need checking. Messages remain drafts.</p></div></details>`;
  }
  function actionFor(item) {
    const ids=item.sourceIds||{}, action=item.action;
    if(action?.kind==='draft' && (action.personIds||ids.people||[]).length)return {kind:'draft',label:action.label||'Review a message',ids:action.personIds||ids.people};
    if(action?.kind==='opportunity'&&action.recordId)return {kind:'opportunity',id:action.recordId,label:action.label||'Explore opportunity'};
    if((item.type==='event_capacity'||item.id==='local-garden')&&ids.people?.length)return {kind:'draft',ids:ids.people,label:'Review invitation'};
    if(ids.opportunities?.includes('o05')&&!ids.projects?.length)return {kind:'opportunity',id:'o05',label:'Explore the pathway'};
    if(ids.projects?.length)return {kind:'opportunity',id:ids.projects[0],label:'Review project'};
    if(ids.opportunities?.length)return {kind:'opportunity',id:ids.opportunities[0],label:'Explore opportunity'};
    if(ids.people?.length)return {kind:'people',ids:ids.people,label:ids.people.length===1?'View person':'Review people'};
    return {kind:'discuss',label:'Explore with Roots'};
  }
  function connectionSources(item,index) {
    const ids=item.sourceIds||{}, links=[];
    const people=(ids.people||[]).map(id=>api.getState().people.find(p=>p.id===id)).filter(Boolean);
    if(people.length)links.push(`<button data-briefing="people" data-index="${index}">${api.icon('users')}${people.length===1?e(people[0].name):people.length+' people'}</button>`);
    for(const id of ids.events||[]) {
      const event=api.getState().events.find(event=>event.id===id);
      if(event)links.push(`<button data-briefing="source" data-kind="event" data-id="${e(id)}">${api.icon('calendar')}${e(event.title)}</button>`);
    }
    const featuredIds=ids.projects?.length?ids.projects.slice(0,1):ids.opportunities?.includes('o05')?['o05']:(ids.opportunities||[]).slice(0,1);
    for(const id of featuredIds) {
      const record=[...window.RootsOpportunities.list(),...window.RootsOpportunities.projects()].find(record=>record.id===id);
      if(record)links.push(`<button data-briefing="source" data-kind="opportunity" data-id="${e(id)}">${api.icon('leaf')}${e(record.title)}</button>`);
    }
    return links.length?`<div class="finding-sources" aria-label="Connected records">${links.join('<span aria-hidden="true">&middot;</span>')}</div>`:'';
  }
  function insightMarkup(item,index) {
    const action=actionFor(item), observed=reviewEntries().entries[item.id];
    return `<article class="briefing-insight" data-insight-id="${e(item.id)}"><h3>${e(item.title)}</h3><p class="finding-observed">${observed.updatedAt===observed.notedAt?'Noted':'Updated'} ${e(window.RootsJournal.formatDate(observed.updatedAt))}</p><p class="briefing-insight-summary">${e(item.summary)}</p>${connectionSources(item,index)}<div class="finding-next"><button class="briefing-action" data-briefing="action" data-index="${index}">${e(action.label)} ${api.icon('arrow')}</button><details class="briefing-evidence"><summary>Why this surfaced</summary><div>${item.suggestion?`<p><strong>Suggested next step:</strong> ${e(item.suggestion)}</p>`:''}${(item.evidence||[]).map(v=>`<p><strong>${e(v.label)}:</strong> ${e(typeof v.value==='object'?JSON.stringify(v.value):v.value)}</p>`).join('')}<div class="insight-sources">${sourceButtons(item)}</div><button class="briefing-discuss" data-briefing="discuss" data-index="${index}">${api.icon('message')}Discuss this with Roots</button><p class="overview-note-date">${observed.updatedAt===observed.notedAt?'Noted':'Updated'} ${e(window.RootsJournal.formatStamp(observed.updatedAt))} in this browser.</p></div></details></div></article>`;
  }
  function reviewEntries() {
    return window.RootsJournal.review('overview', (current().insights||[]).map(item=>({id:item.id,content:{title:item.title,summary:item.summary,evidence:item.evidence,sourceIds:item.sourceIds}})));
  }
  function insightsMarkup() {
    const items=(current().insights||[]).slice(0,2);
    return items.length?items.map(insightMarkup).join(''):`<div class="briefing-empty"><h2>A little more context will help.</h2><p>Add people and opportunities, then Roots can look for useful connections.</p><a class="briefing-action" href="#people">Explore your people ${api.icon('arrow')}</a></div>`;
  }
  function notebookMarkup() {
    const item=(current().insights||[])[2];
    if(!item)return '';
    const action=actionFor(item), observed=reviewEntries().entries[item.id];
    return `<details class="briefing-evidence overview-connection" data-insight-id="${e(item.id)}"><summary><span>${e(item.title)}</span>${api.icon('chevron-down')}</summary><div><p>${e(item.summary)}</p>${(item.evidence||[]).map(v=>`<p><strong>${e(v.label)}:</strong> ${e(typeof v.value==='object'?JSON.stringify(v.value):v.value)}</p>`).join('')}<div class="insight-sources">${sourceButtons(item)}</div><button class="briefing-action" data-briefing="action" data-index="2">${e(action.label)} ${api.icon('arrow')}</button><button class="briefing-discuss" data-briefing="discuss" data-index="2">Discuss this with Roots ${api.icon('message')}</button><p class="overview-note-date">${observed.updatedAt===observed.notedAt?'Noted':'Updated'} ${e(window.RootsJournal.formatDate(observed.updatedAt))}</p></div></details>`;
  }
  const number=value=>typeof value==='number'?value.toLocaleString(undefined,{maximumFractionDigits:1}):'—';
  const stats=()=>window.RootsAnalytics.compute(api.getState(),window.RootsPeople.profileData);
  function snapshotMarkup(a) {
    return `<button data-dashboard-group="all">${number(a.people.total)} people</button><span aria-hidden="true">·</span><button data-dashboard-group="hours">${number(a.hours.total)} recorded hours</button><span aria-hidden="true">·</span><a href="#opportunities">${window.RootsOpportunities.list().length} opportunity leads</a>`;
  }
  function patternsMarkup(a,chart=analyticsTab) {
    if(chart==='events')return `<div class="overview-events">${eventsMarkup()}</div>`;
    if(chart==='interests')return `<div class="overview-interests">${a.interests.top.length?a.interests.top.map(item=>`<button data-dashboard-group="interest" data-interest="${e(item.name)}"><span>${e(item.name)}<strong>${item.count}</strong></span><span class="overview-interest-track" aria-hidden="true"><i style="width:${a.people.total?100*item.count/a.people.total:0}%"></i></span></button>`).join(''):'<p class="overview-empty">Add interests to see what brings people together.</p>'}</div><p class="overview-chart-note">People can have more than one interest. Select a bar to see who.</p>`;
    const groups=[['first','One visit',a.visits.first],['repeat','Repeat visits',a.visits.repeat],['zero','No visits yet',a.visits.zero],['unknown','Not recorded',a.visits.unknown]].filter(g=>g[2]>0);
    return `<div class="overview-participation-value"><strong>${a.visits.repeatShare===null?'—':Math.round(a.visits.repeatShare*100)+'%'}</strong><span>have visited more than once<small>Of profiles with at least one recorded visit</small></span></div>${a.people.total?`<div class="overview-participation-bar" aria-label="Visit counts by person">${groups.map(([key,label,count])=>`<button data-dashboard-group="${key}" class="participation-${key}" style="width:${count/a.people.total*100}%" aria-label="${e(label)}: ${count} people"></button>`).join('')}</div><div class="overview-chart-legend">${groups.map(([key,label,count])=>`<button data-dashboard-group="${key}"><i class="participation-${key}" aria-hidden="true"></i>${label}<strong>${count}</strong></button>`).join('')}</div>`:'<p class="overview-empty">Add people to see participation patterns.</p>'}<p class="overview-chart-note">Based on total visits in each profile. Select a group to see the people.</p>`;
  }
  function eventsMarkup() {
    const events=api.getState().events;
    return events.slice(0,3).map(event=>{const valid=Number.isInteger(event.capacity)&&Number.isInteger(event.attendees)&&event.capacity>=0&&event.attendees>=0&&event.attendees<=event.capacity;return `<button class="overview-event" data-briefing="source" data-kind="event" data-id="${e(event.id)}"><span class="date-tile"><small>${e(event.month)}</small><strong>${e(event.day)}</strong></span><span class="overview-event-copy"><strong>${e(event.title)}</strong><small>${e(event.time)}</small>${valid?`<span class="overview-event-track" aria-hidden="true"><i style="width:${event.capacity?100*event.attendees/event.capacity:0}%"></i></span><span class="overview-event-capacity">${event.attendees} / ${event.capacity} places recorded<span>${event.capacity-event.attendees} open</span></span>`:'<span class="overview-event-capacity">Capacity not recorded</span>'}</span></button>`;}).join('')||'<p class="overview-empty">No events recorded yet.</p>';
  }
  function dailySnapshot() {
    if(!api||!window.RootsDaily)return null;
    const state=api.getState(), remote=bridge()?.activity;
    const snapshot={people:state.people.map(p=>({...p,...window.RootsPeople.profileData(p)})),events:state.events,opportunities:window.RootsOpportunities.list()};
    if(remote && bridge()?.status?.connected){snapshot.drafts=remote.drafts||[];snapshot.activity=remote.activity||[];}
    const today=window.RootsDaily.observe(snapshot);
    return dailyPeriod==='week'&&window.RootsDaily.recent?window.RootsDaily.recent(7):today;
  }
  function dailyMarkup(day=dailySnapshot()) {
    if(!day)return '<p class="daily-empty">Changes you make here will appear in today’s briefing.</p>';
    const entries=day.entries.slice(0,3);
    if(!entries.length)return `<div class="daily-empty"><span>${api.icon('check')}</span><h3>No changes recorded yet.</h3><p>No changes recorded ${dailyPeriod==='week'?'in the last 7 days':'today'} yet. New people, profile updates and prepared messages will appear here.</p><a href="#people">Go to your people ${api.icon('arrow')}</a></div><p class="daily-scope">Tracking changes in this browser from ${e(new Date(day.since).toLocaleDateString(undefined,{day:'numeric',month:'short'}))}.</p>`;
    return `<ol class="daily-timeline">${entries.map(item=>`<li><time datetime="${e(item.at)}">${e(new Date(item.at).toLocaleString([],dailyPeriod==='week'?{month:'short',day:'numeric'}:{hour:'numeric',minute:'2-digit'}))}</time><p>${e(item.title)}</p>${item.personIds?.length?`<button data-briefing="daily-people" data-ids="${e(item.personIds.join(','))}">See the people ${api.icon('arrow')}</button>`:''}</li>`).join('')}</ol>${day.entries.length>3?`<button class="text-button" data-briefing="daily-all">See all ${day.entries.length} changes ${api.icon('arrow')}</button>`:''}<p class="daily-scope">Changes observed in this browser. Existing records are the starting point.</p>`;
  }
  function dailySummary(day) {
    const totals=dailyPeriod==='week'?day?.totalPeriod:day?.totalToday;
    const parts=[];
    if(totals?.addedPeople)parts.push(`${totals.addedPeople} ${totals.addedPeople===1?'person added':'people added'}`);
    if(totals?.updatedPeople)parts.push(`${totals.updatedPeople} ${totals.updatedPeople===1?'profile updated':'profiles updated'}`);
    if(totals?.newDrafts)parts.push(`${totals.newDrafts} ${totals.newDrafts===1?'draft prepared':'drafts prepared'}`);
    return parts.length?parts.join(' · '):'A little perspective on your people, and what could happen next.';
  }
  function render() {
    checkLocalRecords();lastRendered='';lastStatus=statusMarkup();lastAnalytics='';
    const a=stats(),day=dailySnapshot();
    return `<div class="overview-shell daily-overview">
      <header class="overview-heading"><div><h1 id="briefing-title">${briefingTitle()}</h1><p id="daily-summary">${e(dailySummary(day))}</p></div><time class="daily-date" datetime="${new Date().toISOString()}">${e(new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}))}</time></header>
      <section class="daily-updates" aria-label="Recent activity"><div class="daily-section-title"><h2 id="daily-period-heading">${dailyPeriod==='week'?'Last 7 days':'Today'}</h2><div class="daily-period" role="group" aria-label="Activity period"><button data-briefing="period" data-period="today" aria-pressed="${dailyPeriod==='today'}">Today</button><button data-briefing="period" data-period="week" aria-pressed="${dailyPeriod==='week'}">Last 7 days</button></div></div><div id="daily-activity">${dailyMarkup(day)}</div></section>
      <div class="daily-briefing-grid"><aside class="daily-patterns" aria-label="Community patterns"><div class="daily-section-title"><h2>Community at a glance</h2></div><div id="overview-metrics" class="overview-record-counts" aria-label="Current records">${snapshotMarkup(a)}</div><div class="daily-chart-grid">
      <div class="daily-chart"><h3>Participation</h3><div id="daily-participation">${patternsMarkup(a,'participation')}</div></div>
      <div class="daily-chart"><div class="overview-chart-tabs" role="group" aria-label="Community chart"><button data-dashboard-tab="interests" aria-pressed="${analyticsTab==='interests'}">Interests</button><button data-dashboard-tab="events" aria-pressed="${analyticsTab==='events'}">Events</button></div><div id="overview-patterns" class="overview-pattern-content" data-chart="${analyticsTab}">${patternsMarkup(a)}</div></div>
      </div></aside><section class="overview-attention" aria-label="Worth your attention"><div class="daily-section-title"><h2 id="daily-findings-heading">${findingsTitle()}</h2></div><p class="daily-findings-intro">Findings from your people and programmes, updated as your records change.</p><div id="briefing-insights" class="briefing-insights" aria-label="Current suggestions">${insightsMarkup()}</div><div id="briefing-notebook" class="overview-notebook">${notebookMarkup()}</div></section></div>
      <section class="daily-conversation" aria-label="Take the next step"><div class="daily-section-title"><h2>Turn an insight into action</h2><a href="#chat">Open conversation ${api.icon('arrow')}</a></div><form id="briefing-chat-form" class="briefing-composer"><label for="briefing-prompt" class="sr-only">Ask Roots about your community</label><textarea id="briefing-prompt" rows="2" maxlength="2000" placeholder="Draft an invitation, plan student service, or explore a finding…" required>${e(prompt)}</textarea><div class="briefing-composer-bottom"><span>${api.icon('sprout')}${window.RootsBridge?.status?.testPreview?.available?'Prepare a message or send a demo to your Telegram.':'Plan it here. Review before anything goes out.'}</span><button type="submit" aria-label="Ask Roots">${api.icon('arrow')}</button></div></form><div class="daily-prompt-suggestions"><button data-briefing="suggestion" data-prompt="Prepare SMS invitation drafts for first-time volunteers with recorded SMS permission. Build a short friendly invitation, and let me review each message before any sending.">Build an SMS invitation ${api.icon('arrow')}</button><button data-briefing="suggestion" data-prompt="Plan a school service partnership for the students with recorded service-hour requirements. Show the people, the hours to plan, and what the school must approve.">Plan student service ${api.icon('arrow')}</button></div></section>
      <div class="overview-footnotes"><div id="briefing-coverage">${coverageMarkup()}</div><div id="briefing-status">${lastStatus}</div></div>
    </div>`;
  }
  function briefingTitle() { const hour=new Date().getHours();return `Good ${hour<12?'morning':hour<17?'afternoon':'evening'}, Jamie.`; }
  function findingsTitle() { const count=Math.min(2,(current().insights||[]).length);return count===2?'Two things worth a look':count===1?'One thing worth a look':'Things worth a look'; }

  function patternNote(a) {
    if(analyticsTab==='interests') {
      const lead=a.interests.top[0];
      return lead?`<p>${e(lead.name)} appears in ${lead.count} profiles. Start with those interests when exploring the next activity, then ask people what they want to do.</p><button class="briefing-action" data-dashboard-group="interest" data-interest="${e(lead.name)}">See these people ${api.icon('arrow')}</button>`:'<p>Recorded interests will help connect people with relevant activities.</p>';
    }
    if(analyticsTab==='events')return `<p>${number(a.events.openPlaces)} places are open across events with valid capacity records. That suggests room for invitations; individual bookings and attendance still need confirming.</p><a class="briefing-action" href="#events">Explore the calendar ${api.icon('arrow')}</a>`;
    return `<p>${number(a.visits.first)} people have one recorded visit. A relevant personal invitation could help them choose a second visit.</p><p>These totals do not tell us when someone last visited, whether they have booked again, or why they returned.</p><button class="briefing-action" data-dashboard-group="first">See these people ${api.icon('arrow')}</button>`;
  }
  function updateAnalytics() {
    const target=document.getElementById('overview-patterns');if(!target)return;
    const a=stats(), fingerprint=JSON.stringify([a,analyticsTab,api.getState().events,window.RootsOpportunities.list().length]);if(fingerprint===lastAnalytics)return;
    target.innerHTML=patternsMarkup(a);target.dataset.chart=analyticsTab;
    const participation=document.getElementById('daily-participation');if(participation)participation.innerHTML=patternsMarkup(a,'participation');
    const metrics=document.getElementById('overview-metrics');if(metrics)metrics.innerHTML=snapshotMarkup(a);
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
    const data=current(), rendered=JSON.stringify(data.insights);
    const heading=document.getElementById('briefing-title');if(heading)heading.textContent=briefingTitle();const findingsHeading=document.getElementById('daily-findings-heading');if(findingsHeading)findingsHeading.textContent=findingsTitle();
    updateAnalytics();
    const day=dailySnapshot(), dailyTarget=document.getElementById('daily-activity');if(dailyTarget)dailyTarget.innerHTML=dailyMarkup(day);const dailyIntro=document.getElementById('daily-summary');if(dailyIntro)dailyIntro.textContent=dailySummary(day);
    if(rendered!==lastRendered){
      const open=Array.from(document.querySelectorAll('.briefing-evidence[open]')).map(d=>d.closest('[data-insight-id]').dataset.insightId);
      const target=document.getElementById('briefing-insights');if(target)target.innerHTML=insightsMarkup();
      const notebook=document.getElementById('briefing-notebook');if(notebook)notebook.innerHTML=notebookMarkup();
      document.querySelectorAll('[data-insight-id]').forEach(el=>{if(open.includes(el.dataset.insightId))(el.matches('details')?el:el.querySelector('details')).open=true;});
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
  function openInsightPeople(item) {
    const people=(item.sourceIds?.people||[]).map(id=>api.getState().people.find(p=>p.id===id)).filter(Boolean);
    api.openDialog('People behind this finding',`<h2 id="dialog-title">${e(item.title)}</h2><p class="lead">The profiles that connect with this finding.</p><div class="briefing-people">${people.map(p=>`<button data-briefing="source" data-kind="person" data-id="${e(p.id)}">${api.avatar(p)}<span><strong>${e(p.name)}</strong><small>${e((p.interests||[]).join(' · '))}</small></span>${api.icon('arrow')}</button>`).join('')}</div>`);
  }
  function openAction(item) {
    const action=actionFor(item);
    if(action.kind==='opportunity')api.showOpportunity(action.id);
    else if(action.kind==='draft')window.RootsChat.ask(`Prepare SMS invitation drafts for these people: ${action.ids.map(id=>api.getState().people.find(p=>p.id===id)?.name).filter(Boolean).join(', ')}. Only include people with recorded SMS permission. Context: ${item.summary} Keep every draft unsent and show a plan I can review.`);
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
    else if(kind==='period'){dailyPeriod=button.dataset.period;update();const heading=document.getElementById('daily-period-heading');if(heading)heading.textContent=dailyPeriod==='week'?'Last 7 days':'Today';document.querySelectorAll('[data-briefing=period]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.period===dailyPeriod)));}
    else if(kind==='suggestion')window.RootsChat.ask(button.dataset.prompt);
    else if(kind==='daily-people')openInsightPeople({title:'People in this update',sourceIds:{people:button.dataset.ids.split(',')}});
    else if(kind==='daily-all'){const day=dailySnapshot();api.openDialog('Recent changes',`<h2 id="dialog-title">${dailyPeriod==='week'?'Changes in the last 7 days':'Today’s changes'}</h2><ol class="daily-timeline">${day.entries.map(item=>`<li><time>${e(new Date(item.at).toLocaleString([],dailyPeriod==='week'?{month:'short',day:'numeric'}:{hour:'numeric',minute:'2-digit'}))}</time><p>${e(item.title)}</p></li>`).join('')}</ol>`);}
    else if(kind==='people'){const item=current().insights[Number(button.dataset.index)];if(item)openInsightPeople(item);}
    else if(kind==='source')({person:api.showPerson,event:api.showEvent,opportunity:api.showOpportunity})[button.dataset.kind]?.(button.dataset.id);
    else if(kind==='action'||kind==='discuss'){
      const item=current().insights[Number(button.dataset.index)];if(!item)return;
      if(kind==='action')openAction(item);else window.RootsChat.setPrompt(item.suggestedPrompt||`Help me explore this suggestion: ${item.title}`);
    }
  });
  document.addEventListener('input',event=>{if(event.target.id==='briefing-prompt')prompt=event.target.value;});
  document.addEventListener('submit',event=>{if(event.target.id==='briefing-chat-form'){event.preventDefault();const text=prompt.trim();if(text){prompt='';window.RootsChat.ask(text);}}});
  document.addEventListener('keydown',event=>{if(event.target.id==='briefing-prompt'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();event.target.form.requestSubmit();}});
  window.addEventListener('roots:ready',()=>{dailySnapshot();update();schedulePoll();});
  window.addEventListener('roots:activity',()=>{dailySnapshot();update();});
  window.addEventListener('roots:insights',()=>{update();schedulePoll();});
  window.addEventListener('roots:records-changed',()=>{if(api){checkLocalRecords();clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refresh(),600);update();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(pollTimer);else if(api)refresh();});
  setInterval(()=>{if(!document.hidden&&api)refresh();},30*60*1000);
  window.RootsBriefing={configure(callbacks){api=callbacks;dailySnapshot();},render};
})();
