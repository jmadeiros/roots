(() => {
  let api, checkedLocally=null, localInsights=[], fingerprint='', refreshTimer=null, pollTimer=null;
  let checking=false, prompt='', lastRendered='', lastStatus='', checkError='', refreshNotice='', analyticsTab='trend', openCard=-1, lastAnalytics='', dailyPeriod='today';
  const e=value=>api.esc(value);
  const bridge=()=>window.RootsBridge;
  const visible=()=>api?.getState().view==='briefing';
  const time=value=>window.RootsJournal.formatStamp(value);
  function checkLocalRecords(force = false) {
    const state = api.getState();
    const people = state.people.map(p => ({...p, ...window.RootsPeople.profileData(p)}));
    const nextFingerprint = JSON.stringify({people,events:state.events,projects:window.RootsOpportunities.projects()});
    if (!force && nextFingerprint === fingerprint) return;
    fingerprint = nextFingerprint;
    checkedLocally = new Date().toISOString();
    localInsights = [];
    const programmes=window.RootsOpportunities.list();
    // Benefits that give volunteers a reason to come back lead the briefing; funding follows.
    for(const benefit of programmes.filter(p=>p.category==='benefits'&&p.matchCount>0&&p.insight).slice(0,2)) {
      const ids=benefit.matches.map(m=>m.personId), copy=benefit.insight;
      localInsights.push({id:`local-benefit-${benefit.id}`,kind:'benefit',count:benefit.matchCount,rest:`${copy.noun[benefit.matchCount===1?0:1]} ${copy.could}`,title:`${benefit.matchCount} ${copy.noun[benefit.matchCount===1?0:1]} ${copy.could}`,short:copy.short,chip:copy.chip,meta:copy.meta,gets:copy.gets,todo:copy.todo,source:{label:benefit.provider,url:benefit.sourceUrl,checked:benefit.sourceCheckedAt},sourceIds:{people:ids,opportunities:[benefit.id]},action:{kind:'draft',label:copy.actionLabel||'Tell them about it',personIds:ids},suggestedPrompt:`Draft a short SMS telling ${ids.length} volunteers about ${benefit.title}: ${copy.gets} Keep it friendly and unsent so I can review it.`});
    }
    const grant=programmes.find(p=>p.stage==='open'&&p.matchKind==='education'&&p.matchCount>0);
    if(grant)localInsights.push({id:'local-funded-education',kind:'funding',count:grant.matchCount,rest:`students fit a ${money(grant)} education grant`,title:`${grant.matchCount} students fit a ${money(grant)} education grant`,short:`students fit a ${money(grant)} grant`,chip:'grant fit',meta:`${grant.title} · closes in ${daysUntil(grant.deadlineAt)} days`,gets:`${grant.headlineBenefit} for the garden, built around the students you already have.`,todo:grant.action,source:{label:grant.provider,url:grant.sourceUrl,checked:grant.sourceCheckedAt},sourceIds:{people:grant.matches.map(m=>m.personId),opportunities:[grant.id]},action:{kind:'opportunity',recordId:grant.id,label:'Open the grant'},suggestedPrompt:`Help build a practical proposal for ${grant.title}. Use its current requirements and our recorded students. Explain the gaps before applying.`});
    const first=people.filter(p=>p.visits===1), saturday=state.events.find(event=>event.id==='e01');
    if(first.length)localInsights.push({id:'local-first-visits',kind:'return',count:first.length,rest:'first-timers haven’t been back yet',title:`${first.length} first-timers haven’t been back yet`,short:'first-timers not back yet',chip:'not back yet',meta:saturday?`${saturday.title} has ${saturday.capacity-saturday.attendees} places left`:'One recorded visit each',gets:'A personal invitation to a shift that suits their interests and availability.',todo:'Send a short SMS from someone they met. Roots drafts it; nothing goes out until you approve.',sourceIds:{people:first.map(p=>p.id),events:saturday?[saturday.id]:[]},action:{kind:'draft',label:'Draft the invitations',personIds:first.map(p=>p.id)},suggestedPrompt:'Prepare SMS invitation drafts for people with one recorded visit and recorded SMS permission. Ask what would make another visit worthwhile. Do not imply we know when they last attended. Keep every message unsent.'});
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
    // The briefing uses record matches so it stays steady between visits; Gemini answers in chat.
    return {insights:localInsights,checkedAt:checkedLocally,source:'browser-records',illustrative:true,asOf:'2026-10-24'};
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
  const TAGS={benefit:'Benefit',funding:'Funding',return:'Bring back',partner:'Partner'};
  const TODAY_JOINED=['p20','p25','p16','p12'];
  const DAY=86400000;
  const midnight=value=>{const date=new Date(value);date.setHours(0,0,0,0);return date.getTime();};
  const daysUntil=value=>Math.max(0,Math.round((midnight(value)-midnight(Date.now()))/DAY));
  const short=value=>value>=1000?`$${(value/1000).toLocaleString(undefined,{maximumFractionDigits:1})}k`:`$${value}`;
  const money=p=>p.amountMin&&p.amountMax?`${short(p.amountMin)}–${short(p.amountMax)}`:p.amountMax?`up to ${short(p.amountMax)}`:'funded';
  const person=id=>api.getState().people.find(p=>p.id===id);
  const LOADED=Date.now();
  const ago=at=>{const mins=Math.floor((Date.now()-at)/60000);return mins<1?'just now':mins<60?`${mins} min ago`:mins<1440?`${Math.round(mins/60)} h ago`:new Date(at).toLocaleDateString(undefined,{weekday:'long'});};
  const CHEV='<svg class="today-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  // E follows the shape of Codex's published page. Earlier layouts stay reachable with ?layout=a…d for comparison.
  const LAYOUTS=['a','b','c','d','e'];
  let layout=(()=>{try{const asked=new URLSearchParams(location.search).get('layout');return LAYOUTS.includes(asked)?asked:'e';}catch{return 'e';}})();
  let feedPeriod='today';
  // Drop-downs the viewer has opened stay open when the page refreshes its numbers.
  const opened=new Set(['fold-noticed']);
  function peopleStack(ids) {
    const people=ids.map(person).filter(Boolean), shown=people.slice(0,5);
    return `<span class="today-stack" aria-label="${people.length} people">${shown.map(p=>api.avatar(p)).join('')}${people.length>5?`<span class="avatar today-more">+${people.length-5}</span>`:''}</span>`;
  }
  function sourceLine(source) {
    if(!source?.url)return '';
    const checked=source.checked?` · checked ${new Date(`${source.checked}T12:00:00`).toLocaleDateString(undefined,{day:'numeric',month:'short'})}`:'';
    return `<div><dt>Source</dt><dd><a href="${e(source.url)}" target="_blank" rel="noopener">${e(source.label)}</a>${e(checked)}</dd></div>`;
  }
  const kindTag=item=>`<span class="today-kind is-${e(item.kind||'return')}">${e(TAGS[item.kind]||'Insight')}</span>`;
  function insightBody(item,index) {
    const action=actionFor(item), ids=item.sourceIds?.people||[];
    return `<div class="today-detail-body"><dl><div><dt>What they get</dt><dd>${e(item.gets)}</dd></div><div><dt>What you’d do</dt><dd>${e(item.todo)}</dd></div>${sourceLine(item.source)}</dl>
      <div class="today-notice-actions"><button class="today-btn" data-briefing="action" data-index="${index}">${e(action.label)} ${api.icon('arrow')}</button>${ids.length?`<button class="today-link" data-briefing="people" data-index="${index}">${peopleStack(ids.slice(0,3))}See the ${ids.length} people</button>`:''}<button class="today-link" data-briefing="discuss" data-index="${index}">${api.icon('message')}Ask Roots</button></div></div>`;
  }
  // Layout A: four small tiles; one opens its detail underneath.
  function insightTile(item,index) {
    return `<button class="today-card" data-today-card="${index}" aria-expanded="${openCard===index}" aria-controls="today-detail"><span class="today-card-top"><strong class="today-card-count">${e(item.count??'')}</strong>${kindTag(item)}</span><span class="today-card-text">${e(item.short||item.rest)}</span>${CHEV}</button>`;
  }
  // Layouts B and C: a stack of drop-downs, one open at a time.
  function insightFold(item,index) {
    const key=`n-${item.id}`;
    return `<details class="today-notice" name="today-notices" data-open-key="${e(key)}"${opened.has(key)?' open':''}><summary><strong class="today-notice-count is-${e(item.kind||'return')}">${e(item.count??'')}</strong><span class="today-notice-text"><span>${e(item.short||item.rest)}</span><small>${e(TAGS[item.kind]||'Insight')}${item.meta?` · ${e(item.meta)}`:''}</small></span>${CHEV}</summary><div class="today-notice-more">${insightBody(item,index)}</div></details>`;
  }
  function insightsMarkup() {
    const items=(current().insights||[]).slice(0,4);
    if(openCard>=items.length)openCard=-1;
    if(!items.length)return `<p class="today-empty">Add people and opportunities, then Roots can look for useful connections.</p>`;
    if(!['a','e'].includes(layout))return `<div class="today-notices-list">${items.map(insightFold).join('')}</div>`;
    const open=items[openCard], detail=`<div id="today-detail" class="today-detail"${open?'':' hidden'}>${open?`<div class="today-detail-head">${kindTag(open)}<strong>${e(open.title)}</strong></div>${insightBody(open,openCard)}`:''}</div>`;
    if(layout==='e')return `<div class="today-cards today-cards-big">${items.map(insightCard).join('')}</div>${detail}`;
    return `<div class="today-cards">${items.map(insightTile).join('')}</div>${detail}`;
  }
  // Layout E: bigger boxes, two by two; one opens its detail underneath.
  function insightCard(item,index) {
    const ids=item.sourceIds?.people||[];
    return `<button class="today-card today-card-big" data-today-card="${index}" aria-expanded="${openCard===index}" aria-controls="today-detail"><span class="today-card-top"><span class="today-tag is-${e(item.kind||'return')}">${e(TAGS[item.kind]||'Insight')}</span>${ids.length?peopleStack(ids.slice(0,3)):''}</span><strong class="today-card-count">${e(item.count??'')}</strong><span class="today-card-text">${e(item.rest||item.title)}</span><span class="today-card-foot"><small class="today-card-meta">${e(item.meta||'')}</small>${CHEV}</span></button>`;
  }
  const number=value=>typeof value==='number'?value.toLocaleString(undefined,{maximumFractionDigits:1}):'—';
  const stats=()=>window.RootsAnalytics.compute(api.getState(),window.RootsPeople.profileData);
  function snapshotMarkup(a) {
    return `<button data-dashboard-group="all">${number(a.people.total)} people</button><span aria-hidden="true">·</span><button data-dashboard-group="hours">${number(a.hours.total)} recorded hours</button><span aria-hidden="true">·</span><a href="#opportunities">${window.RootsOpportunities.list().length} opportunity leads</a>`;
  }
  // Demo history (month, first visits, came back) so the trend has a shape; current totals come from the records.
  const HISTORY=[['May',6,8],['Jun',7,10],['Jul',7,12],['Aug',7,15],['Sep',6,19],['Oct',6,23]];
  function trendHeadline() {
    const [,lastFirst,lastBack]=HISTORY.at(-1), [,,firstBack]=HISTORY[0];
    return {lastBack,firstBack,share:Math.round(100*lastBack/(lastBack+lastFirst))};
  }
  function trendMarkup() {
    const narrow=layout==='e', wide=!narrow&&layout!=='a', W=narrow?340:wide?820:600, H=layout==='b'?108:wide?128:150, top=10, base=H-22, right=78, bw=narrow?28:wide?44:32, step=(W-right-bw)/(HISTORY.length-1);
    const max=Math.max(...HISTORY.map(([,first,back])=>first+back)), scale=v=>v/max*(base-top-14);
    const bars=HISTORY.map(([month,first,back],i)=>{
      const x=i*step, hb=scale(back), hf=scale(first);
      return `<rect class="trend-back" x="${x}" y="${base-hb}" width="${bw}" height="${hb}" rx="3"/><rect class="trend-first" x="${x}" y="${base-hb-hf-2}" width="${bw}" height="${hf}" rx="3"/><text class="trend-value" x="${x+bw/2}" y="${base-hb+13}">${back}</text><text class="trend-month" x="${x+bw/2}" y="${H-5}">${month}</text>`;
    }).join('');
    const [,lastFirst,lastBack]=HISTORY.at(-1), lx=(HISTORY.length-1)*step+bw+8;
    const labels=`<text class="trend-label is-back" x="${lx}" y="${base-scale(lastBack)/2+4}">came back</text><text class="trend-label" x="${lx}" y="${base-scale(lastBack)-scale(lastFirst)/2+2}">first visit</text>`;
    const t=trendHeadline();
    return `<div class="trend-head"><strong>${t.lastBack}</strong><span>came back in October<small>up from ${t.firstBack} in May · ${t.share}% of this month’s volunteers</small></span></div><svg class="trend-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Volunteers who came back each month, May to October">${bars}${labels}</svg>`;
  }
  function sparkMarkup() {
    const max=Math.max(...HISTORY.map(([,,back])=>back));
    return `<svg class="today-spark" viewBox="0 0 66 22" aria-hidden="true">${HISTORY.map(([,,back],i)=>{const h=Math.max(2,back/max*20);return `<rect x="${i*11}" y="${22-h}" width="7" height="${h}" rx="1.5"/>`;}).join('')}</svg>`;
  }
  function interestReturnMarkup(a) {
    const people=api.getState().people, rows=a.interests.top.slice(0,5).map(item=>{
      const members=(item.personIds||[]).map(id=>people.find(p=>p.id===id)).filter(Boolean), back=members.filter(p=>p.visits>1).length;
      return {...item,back,rate:members.length?Math.round(100*back/members.length):0};
    }).sort((x,y)=>y.rate-x.rate||y.count-x.count);
    return `<div class="trend-interests">${rows.map(row=>`<button data-dashboard-group="interest" data-interest="${e(row.name)}"><span class="trend-interest-name">${e(row.name)}</span><span class="trend-interest-track" aria-hidden="true"><i style="width:${row.rate}%"></i></span><span class="trend-interest-value">${row.rate}%<small>${row.back} of ${row.count}</small></span></button>`).join('')}</div><p class="trend-note">Share of people with each interest who came back more than once.</p>`;
  }
  function patternsMarkup(a,chart=analyticsTab) {
    return chart==='interests'?interestReturnMarkup(a):trendMarkup();
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
    return window.RootsDaily.observe(snapshot);
  }
  const personLinks=ids=>`<div class="feed-people">${ids.map(person).filter(Boolean).map(p=>`<button data-briefing="source" data-kind="person" data-id="${e(p.id)}">${api.avatar(p)}<span>${e(p.name)}</span></button>`).join('')}</div>`;
  const recordLink=(kind,id,label)=>`<button class="today-link" data-briefing="source" data-kind="${kind}" data-id="${e(id)}">${e(label)} ${api.icon('arrow')}</button>`;
  const firstName=p=>p.name.split(' ')[0];
  // Demo arrivals, so the feed visibly updates while the page is open.
  const ARRIVALS=[
    {after:8000,id:'l-chloe',icon:'calendar',build(){const p=person('p20');return p&&{text:`${p.name} signed up for Saturday in the garden`,more:`<p>${e(firstName(p))} joined this morning, so Saturday will be a second visit.</p><div class="feed-actions">${recordLink('person',p.id,`Open ${firstName(p)}`)}${recordLink('event','e01','Open the event')}</div>`};}},
    {after:45000,id:'l-micah',icon:'clock',build(){const p=person('p35');return p&&{text:`${p.name} logged 3 hours in the garden`,more:`<p>That makes 41 of the 80 hours a month that keep CalFresh. Sign form CF 888 at the end of the month.</p><div class="feed-actions">${recordLink('person',p.id,`Open ${firstName(p)}`)}${recordLink('opportunity','b02','CalFresh work rule')}</div>`};}},
    {after:110000,id:'l-rafael',icon:'heart',build(){const p=person('p27'),event=api.getState().events.find(item=>item.id==='e02');return p&&event&&{text:`${p.name} offered to lead ${event.title}`,more:`<p>${e(firstName(p))} has ${p.visits} visits. ${e(event.title)} is on ${e(event.day)} November with ${event.capacity-event.attendees} places open.</p><div class="feed-actions">${recordLink('person',p.id,`Open ${firstName(p)}`)}${recordLink('event',event.id,'Open the event')}</div>`};}}
  ];
  const arrived=[];
  let liveStarted=false;
  function startLive() {
    if(liveStarted)return;liveStarted=true;
    for(const item of ARRIVALS)setTimeout(()=>{const built=item.build();if(!built)return;arrived.push({id:item.id,icon:item.icon,at:Date.now(),...built});refreshFeed();},item.after);
    setInterval(()=>{if(!document.hidden)refreshFeed();},30000);
  }
  // A seeded morning for the demo, so the briefing has a story; times are relative to page load.
  function todayModel() {
    const programmes=window.RootsOpportunities.list();
    const benefits=programmes.filter(p=>p.category==='benefits'&&p.matchCount>0);
    const benefitPeople=new Set(benefits.flatMap(p=>p.matches.map(m=>m.personId)));
    const grants=programmes.filter(p=>p.category==='grants'&&p.stage==='open').sort((a,b)=>Date.parse(a.deadlineAt||'2100-01-01')-Date.parse(b.deadlineAt||'2100-01-01'));
    const nextGrant=grants.find(p=>p.deadlineAt);
    const first=api.getState().people.filter(p=>p.visits===1);
    const saturday=api.getState().events.find(event=>event.id==='e01');
    const joined=TODAY_JOINED.map(person).filter(Boolean);
    const at=mins=>LOADED-mins*60000, feed=[];
    if(benefits[0])feed.push({id:'f-match',at:at(25),icon:'sprout',text:`Roots matched ${benefits[0].matchCount} people to ${benefits[0].title}`,more:`${personLinks(benefits[0].matches.map(m=>m.personId))}<div class="feed-actions">${recordLink('opportunity',benefits[0].id,`Open ${benefits[0].title}`)}</div>`});
    feed.push({id:'f-joined',at:at(70),icon:'users',text:`${joined.length} people joined from the sign-up form`,more:personLinks(joined.map(p=>p.id))});
    feed.push({id:'f-sms',at:at(130),icon:'message',text:`SMS invitation drafted for ${first.length} first-timers`,more:`<p>Waiting for your review. Nothing is sent until you approve it.</p><div class="feed-actions"><a class="today-link" href="#notices">Review the drafts ${api.icon('arrow')}</a></div>`});
    if(saturday)feed.push({id:'f-sat',at:at(190),icon:'calendar',text:`${saturday.title}: 2 new sign-ups`,more:`<p>${saturday.attendees} of ${saturday.capacity} places taken, ${saturday.capacity-saturday.attendees} left.</p><span class="feed-track" aria-hidden="true"><i style="width:${100*saturday.attendees/saturday.capacity}%"></i></span><div class="feed-actions">${recordLink('event',saturday.id,'Open the event')}</div>`});
    const day=days=>LOADED-days*86400000, compost=api.getState().events.find(event=>event.id==='e02'), week=[];
    week.push({id:'w-new',at:day(1),icon:'users',text:'3 people joined after the Native planting morning post',more:personLinks(['p06','p09','p07'])});
    if(compost)week.push({id:'w-compost',at:day(2),icon:'calendar',text:`${compost.title} reached ${compost.attendees} of ${compost.capacity} places`,more:`<div class="feed-actions">${recordLink('event',compost.id,'Open the event')}</div>`});
    if(nextGrant)week.push({id:'w-grant',at:day(4),icon:'funding',text:`Roots found the ${nextGrant.title}`,more:`<p>${e(money(nextGrant))} for an education project. Closes in ${daysUntil(nextGrant.deadlineAt)} days.</p><div class="feed-actions">${recordLink('opportunity',nextGrant.id,'Open the grant')}</div>`});
    const isabel=person('p08');if(isabel)week.push({id:'w-isabel',at:day(5),icon:'heart',text:`${isabel.name} reached ${isabel.visits} visits`,more:personLinks([isabel.id])});
    const link=(attrs,text)=>`<button class="today-inline" ${attrs}>${text}</button>`;
    const drafts=link('data-today-go="notices"','2 drafts');
    const summary=`Since yesterday, ${link(`data-briefing="daily-people" data-ids="${e(joined.map(p=>p.id).join(','))}"`,`${joined.length} people joined`)} and Roots found ${link('data-today-go="opportunities"',`${benefitPeople.size} volunteers who could gain a benefit`)} by coming back. ${nextGrant?`${link(`data-briefing="source" data-kind="opportunity" data-id="${e(nextGrant.id)}"`,e(nextGrant.title))} closes in ${daysUntil(nextGrant.deadlineAt)} days, and ${drafts} are`:`There are ${drafts}`} waiting for your review.`;
    return {benefits,grants,joined,first,feed,week,summary};
  }
  function feedItems(model=todayModel()) {
    const day=dailySnapshot(), real=(day?.entries||[]).slice(0,3).map((item,i)=>({id:`d-${item.at}-${i}`,at:Date.parse(item.at),icon:'check',text:item.title,more:item.personIds?.length?personLinks(item.personIds):'<p>Recorded in this browser.</p>'}));
    return [...real,...arrived,...model.feed,...(feedPeriod==='week'?model.week:[])].sort((x,y)=>y.at-x.at);
  }
  const feedItemMarkup=item=>`<li><details class="feed-item${Date.now()-item.at<4000?' is-new':''}" data-open-key="${e(item.id)}"${opened.has(item.id)?' open':''}><summary><span class="today-feed-icon" aria-hidden="true">${api.icon(item.icon)}</span><span class="feed-text">${e(item.text)}<time>${e(ago(item.at))}</time></span>${CHEV}</summary><div class="feed-more">${item.more}</div></details></li>`;
  // Layout E shows the latest four; the rest sit behind one drop-down.
  function feedMarkup(model,cap=layout==='e'?4:Infinity) {
    const items=feedItems(model), shown=items.slice(0,cap), rest=items.slice(cap);
    return shown.map(feedItemMarkup).join('')+(rest.length?`<li class="feed-earlier"><details data-open-key="feed-earlier"${opened.has('feed-earlier')?' open':''}><summary>${CHEV}Show ${rest.length} earlier</summary><ol class="today-feed">${rest.map(feedItemMarkup).join('')}</ol></details></li>`:'');
  }
  function latestMarkup(model) {
    const items=feedItems(model), latest=items[0];
    return latest?`<span class="today-live" aria-hidden="true"><i></i></span><span class="today-latest-text">${e(latest.text)}</span><span class="today-latest-time">${e(ago(latest.at))} · ${items.length} today</span>`:'Nothing yet today';
  }
  function refreshFeed() {
    if(!api||!visible())return;
    const model=todayModel();
    const feed=document.getElementById('today-feed');if(feed)feed.innerHTML=feedMarkup(model);
    const latest=document.getElementById('today-feed-latest');if(latest)latest.innerHTML=latestMarkup(model);
    const tab=document.getElementById('today-tab-feed-body');if(tab)tab.innerHTML=feedTabMarkup(model);
  }
  const chartTabs=()=>`<div class="overview-chart-tabs" role="group" aria-label="Coming back chart"><button data-dashboard-tab="trend" aria-pressed="${analyticsTab==='trend'}">By month</button><button data-dashboard-tab="interests" aria-pressed="${analyticsTab==='interests'}">By interest</button></div>`;
  // Layout D: three headings in one row; the open one shows its content underneath.
  let rowOpen='noticed';
  function feedTabMarkup(model) {
    const items=feedItems(model), latest=items[0], fresh=latest&&Date.now()-latest.at<4000;
    return `<span class="today-tab-figure"><strong>${items.length}</strong><span>updates today</span></span><span class="today-tab-visual today-latest${fresh?' is-new':''}"><span class="today-live" aria-hidden="true"><i></i></span><span class="today-latest-text">${latest?e(latest.text):'Nothing yet today'}</span>${latest?`<span class="today-latest-time">${e(ago(latest.at))}</span>`:''}</span>`;
  }
  function rowMarkup(a,model) {
    const items=(current().insights||[]).slice(0,4), t=trendHeadline();
    const tab=(key,title,inner)=>`<button class="today-tab" id="today-tab-${key}" data-today-tab="${key}" aria-expanded="${rowOpen===key}" aria-controls="today-tab-panel"><span class="today-tab-title">${title}${CHEV}</span>${inner}</button>`;
    const panels={
      noticed:()=>`<div id="briefing-insights">${insightsMarkup()}</div><p class="today-tab-note" id="today-checked">Checked ${e(time(checkedLocally))}</p>`,
      coming:()=>`<div class="today-fold-tabs">${chartTabs()}</div><div id="overview-patterns" class="today-patterns" data-chart="${analyticsTab}">${patternsMarkup(a)}</div>`,
      feed:()=>`<ol class="today-feed" id="today-feed">${feedMarkup(model)}</ol>`
    };
    return `<div class="today-row">
      ${tab('noticed','What Roots noticed',`<span class="today-tab-figure"><strong>${items.length}</strong><span>worth a look</span></span><span class="today-tab-visual">${items.map(item=>`<span class="today-mini is-${e(item.kind||'return')}"><b>${e(item.count??'')}</b> ${e(item.chip||'')}</span>`).join('')}</span>`)}
      ${tab('coming','Coming back',`<span class="today-tab-figure"><strong>${t.lastBack}</strong><span>came back in October</span></span><span class="today-tab-visual">${sparkMarkup()}<span>up from ${t.firstBack} in May</span></span>`)}
      ${tab('feed','Today’s feed',`<span id="today-tab-feed-body" class="today-tab-feed">${feedTabMarkup(model)}</span>`)}
    </div><div id="today-tab-panel" class="today-tab-panel" role="region"${rowOpen?` aria-labelledby="today-tab-${rowOpen}"`:' hidden'}>${rowOpen?panels[rowOpen]():''}</div>`;
  }
  const fold=(key,title,preview,body)=>`<details class="today-fold" data-open-key="${key}"${opened.has(key)?' open':''}><summary><span class="today-fold-title">${title}</span><span class="today-fold-preview">${preview}</span>${CHEV}</summary><div class="today-fold-body">${body}</div></details>`;
  function render() {
    checkLocalRecords();lastRendered='';lastAnalytics='';startLive();
    const a=stats(), model=todayModel(), date=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    const benefit=model.benefits[0], items=(current().insights||[]).slice(0,4), t=trendHeadline();
    const chips=[benefit&&[`Message the ${benefit.insight?.noun?.[1]||'people'}`,`Draft a short SMS telling the matched volunteers about ${benefit.title} and what they get. Keep every message unsent for my review.`],
      ['Invite first-timers back','Prepare SMS invitation drafts for first-time volunteers with recorded SMS permission. Build a short friendly invitation, and let me review each message before any sending.'],
      ['Start the CalAgPlate proposal','Help build a practical proposal for the CalAgPlate education grant. Use its current requirements and our recorded students. Explain the gaps before applying.']].filter(Boolean);
    const head=`<header class="today-head"><div class="today-head-top"><h1 id="today-title">Today <span class="today-date">${e(date)}</span></h1></div><p class="today-summary" id="today-summary">${model.summary}</p></header>`;
    const tabs=chartTabs();
    const patterns=`<div id="overview-patterns" class="today-patterns" data-chart="${analyticsTab}">${patternsMarkup(a)}</div>`;
    const noticed=`<section class="today-section" aria-labelledby="today-noticed"><div class="today-section-head"><h2 id="today-noticed">What Roots noticed</h2><span id="today-checked">Checked ${e(time(checkedLocally))}</span></div><div id="briefing-insights">${insightsMarkup()}</div></section>`;
    const coming=`<section class="today-section" aria-labelledby="today-patterns-title"><div class="today-section-head"><h2 id="today-patterns-title">Coming back</h2>${tabs}</div>${patterns}</section>`;
    const feed=`<section class="today-feed-panel" aria-labelledby="today-feed-title"><div class="today-section-head"><h2 id="today-feed-title">Today’s feed</h2><span class="today-live"><i></i>Live</span></div><ol class="today-feed" id="today-feed">${feedMarkup(model)}</ol></section>`;
    const dock=`<div class="today-dock"><form id="briefing-chat-form" class="briefing-composer today-composer"><label for="briefing-prompt" class="sr-only">Ask Roots about your community</label><textarea id="briefing-prompt" rows="1" maxlength="2000" placeholder="Ask Roots, or turn an idea into an SMS…" required>${e(prompt)}</textarea><div class="today-composer-bottom"><div class="today-chips">${chips.map(([label,ask])=>`<button type="button" data-briefing="suggestion" data-prompt="${e(ask)}">${e(label)}</button>`).join('')}</div><button class="today-send" type="submit" aria-label="Ask Roots">${api.icon('arrow')}</button></div></form></div>`;
    if(layout==='e')return `<div class="today-page" data-layout="e">
      <header class="today-head"><div class="today-head-top"><h1 id="today-title">${e(briefingTitle())}</h1><span class="today-date">${e(date)}</span></div><p class="today-summary" id="today-summary">${model.summary}</p></header>
      <section class="today-band" aria-labelledby="today-feed-title"><div class="today-section-head"><h2 id="today-feed-title">Today <span class="today-live"><i></i>Live</span></h2><div class="overview-chart-tabs" role="group" aria-label="Feed period"><button data-today-period="today" aria-pressed="${feedPeriod==='today'}">Today</button><button data-today-period="week" aria-pressed="${feedPeriod==='week'}">Last 7 days</button></div></div><ol class="today-feed today-feed-wide" id="today-feed">${feedMarkup(model)}</ol></section>
      <div class="today-split">
        <section class="today-glance" aria-labelledby="today-glance-title"><div class="today-section-head"><h2 id="today-glance-title">Community at a glance</h2></div><p class="today-metrics" id="overview-metrics">${snapshotMarkup(a)}</p><div class="today-sub-head"><h3>Coming back</h3>${tabs}</div>${patterns}</section>
        ${noticed}
      </div>
      ${dock}
    </div>`;
    let body;
    if(layout==='d')body=`<div id="today-row-region">${rowMarkup(a,model)}</div>`;
    else if(layout==='b')body=`<div class="today-columns">${noticed}${feed}</div>${coming}`;
    else if(layout==='c')body=`<div class="today-folds">
        ${fold('fold-noticed','What Roots noticed',items.map(item=>`<span class="today-chip is-${e(item.kind||'return')}"><b>${e(item.count??'')}</b>${e(item.chip||TAGS[item.kind]||'')}</span>`).join(''),`<div id="briefing-insights">${insightsMarkup()}</div>`)}
        ${fold('fold-coming','Coming back',`${sparkMarkup()}<span><b>${t.lastBack}</b> came back in October · up from ${t.firstBack} in May</span>`,`<div class="today-fold-tabs">${tabs}</div>${patterns}`)}
        ${fold('fold-feed','Today’s feed',`<span id="today-feed-latest" class="today-latest">${latestMarkup(model)}</span>`,`<ol class="today-feed" id="today-feed">${feedMarkup(model)}</ol>`)}
      </div>`;
    else body=`${noticed}${coming}<aside class="today-rail" aria-label="Today’s feed">${feed}<p class="today-rail-note">New activity appears here as it happens.</p></aside>`;
    return `<div class="today-page" data-layout="${layout}">${head}${body}
      ${dock}
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
    const coverage=document.getElementById('briefing-coverage');
    if(coverage&&!coverage.querySelector('details[open]'))coverage.innerHTML=coverageMarkup();
    updateAnalytics();
    refreshFeed();
    const stamp=document.getElementById('today-checked');if(stamp)stamp.textContent=`Checked ${time(checkedLocally)}`;
    const rendered=JSON.stringify(current().insights);
    if(rendered!==lastRendered){
      const target=document.getElementById('briefing-insights');
      if(target)target.innerHTML=insightsMarkup();
      lastRendered=rendered;
    }
  }
  document.addEventListener('click',event=>{
    const go=event.target.closest('[data-today-go]');if(go)location.hash=go.dataset.todayGo;
    const rowTab=event.target.closest('[data-today-tab]');
    if(rowTab){
      rowOpen=rowOpen===rowTab.dataset.todayTab?null:rowTab.dataset.todayTab;
      const region=document.getElementById('today-row-region');
      if(region){region.innerHTML=rowMarkup(stats(),todayModel());document.getElementById(`today-tab-${rowTab.dataset.todayTab}`)?.focus({preventScroll:true});}
      return;
    }
    const period=event.target.closest('[data-today-period]');
    if(period){feedPeriod=period.dataset.todayPeriod;document.querySelectorAll('[data-today-period]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.todayPeriod===feedPeriod)));refreshFeed();return;}
    const card=event.target.closest('[data-today-card]');if(!card)return;
    openCard=openCard===Number(card.dataset.todayCard)?-1:Number(card.dataset.todayCard);
    const target=document.getElementById('briefing-insights');if(target)target.innerHTML=insightsMarkup();
    if(openCard>=0)document.querySelector(`[data-today-card="${openCard}"]`)?.focus({preventScroll:true});
  });
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
  document.addEventListener('toggle',event=>{const key=event.target.dataset?.openKey;if(!key)return;if(event.target.open)opened.add(key);else opened.delete(key);},true);
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
