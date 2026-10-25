/* Researched program terms, matched to explicit community capacity. */
(() => {
  'use strict';
  let api, review = null, bound = false;
  const view = {tab:'connections', filter:'all', query:'', limit:4, connectionLimit:4, expanded:new Set()};
  const tabs = [['connections','For your community'],['all','All leads'],['projects','Projects'],['saved','Saved']];
  const projectSeeds = [
    { id: 'project-garden', title: 'Garden signs and learning walks', description: 'Help visitors understand the growing spaces through clear signs and a short series of volunteer-led learning walks.', benefit: 'A welcoming garden that helps people learn and return.', sourceOpportunityId: 'o04', funding: 'Explore CalAgPlate education support', team: [['p08', 'Learning walks', 'Environmental education and youth mentoring'], ['p03', 'Garden map', 'GIS mapping and data analysis'], ['p05', 'Outreach and photographs', 'Community outreach and photography']], budget: [['Signs and printing', 1200], ['Learning materials', 600], ['Workshop supplies', 400]], checks: ['Confirm the garden team wants this project', 'Ask the suggested team about interest and availability', 'Verify a suitable funding program and eligible costs', 'Agree the scope, accessibility, and final budget'] },
    { id: 'project-compost', title: 'A community composting program', description: 'Pair practical composting sessions with simple records of what the community diverts and learns.', benefit: 'Regular hands-on work with a clear community outcome.', sourceOpportunityId: 'o02', funding: 'Explore Climate Action Corps support', team: [['p04', 'Session coordination', 'Composting and community gardening'], ['p19', 'Impact records', 'Data analysis and climate action'], ['p21', 'Compost station', 'Carpentry and composting']], budget: [['Compost station materials', 1600], ['Tools and protective equipment', 700], ['Workshop materials', 300]], checks: ['Confirm site permission and capacity', 'Ask the team to review their proposed roles', 'Verify host requirements and application timing', 'Agree training, supervision, and impact measures'] },
    { id: 'project-habitat', title: 'A native habitat learning space', description: 'Create a small demonstration planting area and a practical way for new volunteers to learn about local habitats.', benefit: 'A shared project for people interested in plants and restoration.', sourceOpportunityId: 'o03', funding: 'Explore urban agriculture project support', team: [['p17', 'Planting plan', 'Native plants and ecosystem restoration'], ['p31', 'Beds and structures', 'Carpentry and native plants'], ['p22', 'Learning sessions', 'Environmental education and native plants']], budget: [['Plants and soil', 1500], ['Bed materials and tools', 1100], ['Learning signs', 400]], checks: ['Confirm the site and a suitable planting plan', 'Ask the suggested team about participation', 'Check whether a funding round covers this activity', 'Review ongoing care, access, and the final budget'] }
  ];
  const state = () => api.getState();
  const people = () => state().people || [];
  const scenario = () => api.data?.scenario || window.ROOTS_DATA?.scenario || {};
  const profile = person => window.RootsPeople?.profileData(person) || person;
  const e = value => api.esc(value);
  const money = value => '$' + Number(value).toLocaleString('en-US');
  const saved = id => (state().saved || []).includes(id);
  const catalogue = () => (window.ROOTS_PROGRAMS || []).map(program => program.deadlineAt && Date.now() > Date.parse(program.deadlineAt)
    ? {...program,stage:'closed',priority:100 + program.priority,statusLabel:'Published deadline passed · Check the next round',action:'Check the provider for a new round before preparing an application.'} : program);
  const connections = (filter = view.filter) => window.RootsProgramFit?.rank(state(), catalogue(), scenario(), profile, {order:'priority',filter}) || [];
  function list() {
    return catalogue().map(record => {
      const fit = window.RootsProgramFit?.evaluate(state(),record,scenario(),profile);
      const {program: _program, ...readiness} = fit || {};
      return {...record, description:record.summary, benefit:record.headlineBenefit, status:record.statusLabel,
        audiences:record.category==='placements'?['volunteers','organization']:['organization'],
        candidate:true, matches:fit?.matches || [], matchCount:fit?.peopleCount || 0, readiness};
    });
  }
  function projects() {
    return projectSeeds.map(project => ({...project,type:'Project',status:'Draft plan',candidate:true,
      total:project.budget.reduce((sum,item)=>sum+item[1],0),team:project.team.map(([personId,role,reason])=>({personId,role,reason}))}));
  }
  const allRecords = () => list().concat(projects());
  function saveButton(record, full = false) {
    return `<button class="${full?'button':'icon-button'} opp-save ${saved(record.id)?'saved':''}" data-opp-save="${e(record.id)}" aria-label="${saved(record.id)?'Remove saved':'Save'} ${e(record.title)}" aria-pressed="${saved(record.id)}">${api.icon('bookmark')}${full?`<span>${saved(record.id)?'Saved':'Save for later'}</span>`:''}</button>`;
  }
  function reviewRecords(force = false) {
    const records = allRecords();
    review = window.RootsJournal?.review('opportunities',records.map(record=>({id:record.id,content:record})),{force}) || null;
    return records;
  }
  function sourceLinks(record) {
    return (record.sources || []).map(source=>`<a href="${e(source.url)}" target="_blank" rel="noopener noreferrer">${e(source.label)} ${api.icon('external')}</a>`).join('');
  }
  function displayedStatus(record) {
    if (record.deadlineAt && Date.now() > Date.parse(record.deadlineAt)) return 'Published deadline passed · Check the next round';
    return record.statusLabel;
  }
  function benefit(item) {
    const program = item.program;
    if(program.matchKind==='community-event') {
      const tier = (program.tiers || []).filter(tier=>item.peopleCount>=tier.people).at(-1);
      return tier ? `Up to ${money(tier.amount)} reimbursement with ${tier.people} volunteers` : program.headlineBenefit;
    }
    if(program.matchKind==='school-service') {
      const total = item.personIds.map(id=>people().find(person=>person.id===id)).filter(Boolean).reduce((sum,person)=>sum+(Number(profile(person).serviceRequirementHours)||0),0);
      return `${total.toLocaleString()} hours of school service to plan`;
    }
    return program.headlineBenefit;
  }
  function avatarCluster(item) {
    const members = item.personIds.map(id=>people().find(person=>person.id===id)).filter(Boolean);
    const shown = members.slice(0,6);
    return `<div class="people-cluster" aria-label="People behind this programme fit">${shown.map(person=>`<button data-opp-person="${e(person.id)}" title="${e(person.name)}" aria-label="View ${e(person.name)}">${api.avatar(person)}</button>`).join('')}${members.length>shown.length?`<button class="people-cluster-more" data-opp-connection-people="${e(item.id)}" aria-label="See all ${members.length} people">+${members.length-shown.length}</button>`:''}</div>`;
  }
  function factsMarkup(item) {
    return `<dl class="opp-evidence-facts">${item.facts.map(fact=>`<div><dt>${e(fact.label)}</dt><dd>${e(fact.value)}</dd></div>`).join('')}</dl>`;
  }
  function connectionMarkup(item) {
    const record=item.program;
    const countLabel=record.matchKind==='climate-host'?'supervisors in the plan':record.matchKind==='community-event'?'people in the invite pool':record.matchKind==='employer'?'employer connections':record.matchKind==='college'?'students at partner campuses':'people in this cohort';
    return `<article class="opp-connection opp-programme" data-people-opportunity="${e(record.id)}"><div class="opp-idea">
      <h2><button data-opp-open="${e(record.id)}">${e(record.title)}</button></h2>
      <p class="opp-programme-benefit">${e(benefit(item))}</p>
      <p class="opp-programme-status">${e(displayedStatus(record))}</p>
      <p class="opp-connection-summary">${e(item.summary)}</p>
      <p class="opp-proposed-benefit"><strong>Next step</strong> ${e(record.action)}</p>
      <div class="finding-next"><button class="briefing-action" data-opp-discuss="${e(record.id)}">${record.category==='benefits'||record.tellMessage?'Tell the people':record.stage==='open'?'Prepare application':'Plan next steps'} ${api.icon('arrow')}</button><button class="opp-requirements-link" data-opp-open="${e(record.id)}">Requirements & sources</button></div>
      <p class="opp-source-stamp">${e(record.provider)}${record.sourceCheckedAt?` · Source checked ${new Date(`${record.sourceCheckedAt}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`:' · Local partnership proposal'}</p>
    </div><aside class="opp-people-evidence" aria-label="People and programme requirements">
      <h3>${record.matchKind==='watchlist'?'Fit awaits published criteria':`${item.peopleCount} ${e(countLabel)}`}</h3>${avatarCluster(item)}
      ${item.peopleCount?`<button class="opp-see-people" data-opp-connection-people="${e(item.id)}">See the people ${api.icon('arrow')}</button>`:''}
      ${factsMarkup(item)}
      <details class="opp-fit-gaps"><summary>Still to establish · ${item.gaps.length} ${api.icon('chevron-down')}</summary><ul>${item.gaps.map(gap=>`<li>${e(gap)}</li>`).join('')}</ul></details>
    </aside></article>`;
  }
  function communityContent(findings) {
    const shown=findings.slice(0,view.connectionLimit);
    return `<div class="opp-route-filters" role="group" aria-label="Programme type">${[['all','All routes'],['benefits','Volunteer benefits'],['employer','Employer matching'],['grants','Grants'],['placements','Funded placements'],['service','School partnerships']].map(([id,label])=>`<button data-opp-filter="${id}" aria-pressed="${view.filter===id}">${label}</button>`).join('')}</div>
      <p class="opp-priority-note">Benefits that give volunteers a reason to come back first, then open funding, funded placements and partnerships. Matches use what people chose to record, never interests.</p>
      <div class="opp-connections">${shown.length?shown.map(connectionMarkup).join(''):'<p class="people-groups-empty">No programmes in this category yet.</p>'}</div>
      ${shown.length<findings.length?`<div class="opp-more-connections"><button class="text-button" data-opp-connections-more>Show ${findings.length-shown.length} more routes ${api.icon('chevron-down')}</button><span>${shown.length} of ${findings.length}</span></div>`:''}`;
  }
  function filtered() {
    const source=view.tab==='projects'?projects():view.tab==='saved'?allRecords().filter(record=>saved(record.id)):list();
    const query=view.query.trim().toLowerCase();
    return source.filter(record=>!query||[record.title,record.description,record.benefit,record.provider,record.type].join(' ').toLowerCase().includes(query));
  }
  function row(record) {
    const project=record.type==='Project';
    const count=project?`${record.team.length} suggested contributors`:record.matchKind==='watchlist'?'Fit not assessed yet':`${record.matchCount} people in the capacity review`;
    return `<article class="opp-finding" data-opp-entry="${e(record.id)}"><div class="opp-finding-body"><details class="opp-finding-notes"${view.expanded.has(record.id)?' open':''}><summary><span class="opp-finding-title">${e(record.title)}</span><span class="opp-finding-description">${e(record.benefit)}</span><span class="opp-finding-meta">${e(project?'Draft project':displayedStatus(record))}<span aria-hidden="true"> · </span>${e(count)}</span><span class="opp-finding-caret">${api.icon('chevron-down')}</span></summary><div class="opp-finding-expanded"><p>${e(record.readiness?.summary||record.description)}</p><div class="opp-finding-actions"><button class="text-button" data-opp-open="${e(record.id)}">${project?'Explore the plan':'Review requirements'} ${api.icon('arrow')}</button><span>${e(project?money(record.total)+' illustrative budget':record.beneficiary)}</span></div></div></details>${saveButton(record)}</div></article>`;
  }
  function results() {
    const records=filtered(),shown=records.slice(0,view.limit);
    return `${records.length?`<div class="opp-findings">${shown.map(row).join('')}</div>`:`<div class="empty opp-empty"><h3>${view.query?'No matching programmes':'Nothing saved yet'}</h3><p>${view.query?'Try a programme name, provider or benefit.':'Save a programme or project to return to it here.'}</p></div>`}<div class="opp-list-footer"><span role="status">${shown.length} of ${records.length} ${view.tab==='projects'?'projects':'programmes'}</span>${shown.length<records.length?'<button class="text-button" data-opp-more>Show more</button>':''}</div>`;
  }
  function render() {
    const records=reviewRecords(), findings=connections(), savedCount=records.filter(record=>saved(record.id)).length;
    const stamp=review?.checkedAt&&window.RootsJournal?.formatStamp(review.checkedAt);
    const content=view.tab==='connections'?communityContent(findings):`<div class="opp-toolbar"><p>${view.tab==='projects'?'Draft delivery plans behind the applications.':view.tab==='saved'?'Programmes and plans to return to.':'Researched programmes and local partnership routes.'}</p><label class="search-field opp-search">${api.icon('search')}<input id="opp-search" type="search" aria-label="Search opportunities and projects" placeholder="Search programmes…" value="${e(view.query)}"></label></div><div id="opp-results">${results()}</div>`;
    return `<div class="opp-intelligence">${api.head('Opportunities','Benefits that bring volunteers back, and funding your community could put to work.')}
      <div class="opp-review"><p role="status">${stamp?`Community fit checked ${e(stamp)}`:'Community fit from your current records'}</p><button class="text-button" data-opp-review>Recheck fit ${api.icon('refresh')}</button></div>
      <p class="opp-scenario-note"><strong>Demo scenario</strong> Ages, student needs and host capacity are fictional examples. Programme sources were researched on 24 Oct 2026.</p>
      <div class="opp-tabs" role="tablist" aria-label="Opportunity views">${tabs.map(([id,label])=>`<button id="opp-tab-${id}" class="opp-tab ${view.tab===id?'active':''}" role="tab" aria-selected="${view.tab===id}" aria-controls="opp-panel" tabindex="${view.tab===id?'0':'-1'}" data-opp-tab="${id}">${label}${id==='saved'?`<span>${savedCount}</span>`:''}</button>`).join('')}</div>
      <section id="opp-panel" role="tabpanel" aria-labelledby="opp-tab-${view.tab}">${content}</section>
      <details class="opp-provenance"><summary>How these opportunities are selected ${api.icon('chevron-down')}</summary><p>Published funding, placement and host requirements come first. Roots compares them with explicit education, service-hour needs, employer connections and supervision capacity. Interests do not determine this ordering. A match identifies a route to investigate; provider approval and participation are still needed. “Recheck fit” recalculates against your current community. It does not search the web or refresh source terms.</p><p>There is no automatic external search running. Each researched source has a check date, and application status may change.</p></details></div>`;
  }
  function accordion(title,content,count) {
    return `<details class="opp-details"><summary><span>${e(title)}</span>${count!=null?`<small>${count}</small>`:''}${api.icon('chevron-down')}</summary><div>${content}</div></details>`;
  }
  function personRow(match,role) {
    const person=people().find(person=>person.id===match.personId);
    return person?`<button class="opp-person" data-opp-person="${e(person.id)}">${api.avatar(person)}<span><strong>${e(person.name)}${role?`<small>${e(role)}</small>`:''}</strong><span>${e(match.reason)}</span></span>${api.icon('chevron-right')}</button>`:'';
  }
  function openConnectionPeople(id) {
    const item=connections('all').find(item=>item.id===id);if(!item)return;
    api.openDialog('People and capacity',`<h2 id="dialog-title">${e(item.program.title)}</h2><p class="lead">${e(item.summary)}</p><p class="source-note">Demo ages, education and capacity are illustrative. This is a planning pool, not accepted applicants or confirmed attendees.</p><div class="briefing-people">${item.matches.map(match=>personRow(match)).join('')}</div>`);
  }
  function open(id) {
    const record=allRecords().find(item=>item.id===id);if(!record){api.toast('That programme is no longer available.');return;}
    if(record.type==='Project') {
      const funding=list().find(item=>item.id===record.sourceOpportunityId);
      api.openDialog('Project plan',`<div class="opp-sheet"><h2 id="dialog-title">${e(record.title)}</h2><p class="lead">${e(record.description)}</p><section class="opp-match-section"><h3>A team to ask</h3>${record.team.map(member=>personRow(member,member.role)).join('')}</section>${accordion('Illustrative budget',`<div class="opp-budget">${record.budget.map(([label,amount])=>`<div><span>${e(label)}</span><strong>${money(amount)}</strong></div>`).join('')}<div class="opp-budget-total"><span>Total</span><strong>${money(record.total)}</strong></div></div>`)}${accordion('Before applying',`<ul class="opp-checks">${record.checks.map(check=>`<li>${api.icon('info')}<span>${e(check)}</span></li>`).join('')}</ul>`)}${funding?`<button class="button" data-opp-open="${e(funding.id)}">Review ${e(funding.title)} ${api.icon('arrow')}</button>`:''}<div class="dialog-actions">${saveButton(record,true)}</div><p class="source-note">Illustrative scope, team and budget. Nothing has been submitted.</p></div>`);return;
    }
    const fit=connections('all').find(item=>item.id===id);
    api.openDialog('Programme requirements',`<div class="opp-sheet"><h2 id="dialog-title">${e(record.title)}</h2><p class="lead">${e(record.summary)}</p><div class="opp-benefit"><span>${e(record.beneficiary)}</span><strong>${e(fit?benefit(fit):record.headlineBenefit)}</strong><small>${e(displayedStatus(record))}</small></div>
      ${fit?`<section class="opp-match-section"><h3>Why it belongs here</h3><p>${e(fit.summary)}</p>${factsMarkup(fit)}${fit.peopleCount?`<button class="text-button" data-opp-connection-people="${e(id)}">See ${fit.peopleCount} people ${api.icon('arrow')}</button>`:''}<p class="source-note">Community details are fictional demo assumptions. Programme terms below are separately sourced.</p></section>`:''}
      ${accordion('Programme requirements',`<ul class="opp-checks">${record.requirements.map(value=>`<li>${api.icon('info')}<span>${e(value)}</span></li>`).join('')}</ul>`,record.requirements.length)}
      ${fit?accordion('What we still need',`<ul class="opp-checks">${fit.gaps.map(value=>`<li>${api.icon('info')}<span>${e(value)}</span></li>`).join('')}</ul>`,fit.gaps.length):''}
      ${accordion('An application or partnership plan',`<ol class="step-list">${record.steps.map(step=>`<li>${e(step)}</li>`).join('')}</ol>`)}
      <div class="opp-programme-sources"><h3>${record.sourceUrl?'Official sources · checked 24 Oct 2026':'Local partnership to establish'}</h3>${sourceLinks(record)}</div>
      <div class="dialog-actions">${saveButton(record,true)}<button class="button primary" data-opp-discuss="${e(id)}">Draft next steps ${api.icon('arrow')}</button></div></div>`);
  }
  function discuss(id) {
    const item=connections('all').find(item=>item.id===id);if(!item)return;
    const p=item.program;
    api.closeDialog?.();
    // A benefit is something to tell the matched volunteers about, so this opens the Tell the people window.
    if(p.category==='benefits'||p.tellMessage){tell({heading:p.tellMessage?`Ask them to log their hours with ${p.employer}.`:`Tell them about ${p.title}.`,personIds:item.personIds,message:p.tellMessage||p.insight?.sms||`Hi {first_name}, ${benefit(item)}.`,topic:p.title});return;}
    window.RootsChat.setPrompt(`Prepare a practical application or partnership plan for ${p.title}. Published benefit: ${benefit(item)}. Current source status: ${displayedStatus(p)}. Our community fit: ${item.summary} Evidence: ${item.facts.map(f=>`${f.label}: ${f.value}`).join('; ')}. Gaps: ${item.gaps.join('; ')}. Next step: ${p.action}. Use the programme sources saved in this dashboard, researched 24 October 2026. Clearly label the ages, student needs and capacity as fictional demo assumptions. Do not imply a new web search, guaranteed eligibility, funding or attendance. Draft only; do not submit applications or send messages.`);
  }
  function updateResults(){const target=document.getElementById('opp-results');if(target)target.innerHTML=results();}
  function changeTab(id){if(!tabs.some(tab=>tab[0]===id))return;view.tab=id;view.query='';view.limit=4;api.render();document.getElementById(`opp-tab-${id}`)?.focus();}
  function toggleSave(id){const record=allRecords().find(item=>item.id===id);if(!record)return;const wasSaved=saved(id);state().saved=wasSaved?state().saved.filter(item=>item!==id):[...(state().saved||[]),id];api.persist();api.logActivity(`${wasSaved?'Removed saved':'Saved'} ${record.title}`);api.render();document.querySelectorAll('[data-opp-save]').forEach(button=>{if(button.dataset.oppSave!==id)return;button.classList.toggle('saved',saved(id));button.setAttribute('aria-pressed',String(saved(id)));button.setAttribute('aria-label',`${saved(id)?'Remove saved':'Save'} ${record.title}`);const label=button.querySelector('span');if(label)label.textContent=saved(id)?'Saved':'Save for later';});if(!document.getElementById('detail-dialog')?.open)(document.querySelector(`[data-opp-save="${id}"]`)||document.getElementById(`opp-tab-${view.tab}`))?.focus();api.toast(wasSaved?'Removed from saved':'Saved for later');}
  function configure(nextApi) {
    api=nextApi;if(bound)return;bound=true;
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-opp-tab],[data-opp-open],[data-opp-save],[data-opp-person],[data-opp-more],[data-opp-review],[data-opp-filter],[data-opp-connection-people],[data-opp-discuss],[data-opp-connections-more]');if(!button||!api)return;
      if(button.hasAttribute('data-opp-review')){reviewRecords(true);api.render();document.querySelector('[data-opp-review]')?.focus();api.toast('Community fit recalculated. Source research date is unchanged.');}
      else if(button.hasAttribute('data-opp-filter')){view.filter=button.dataset.oppFilter;view.connectionLimit=4;api.render();document.querySelector(`[data-opp-filter="${view.filter}"]`)?.focus();}
      else if(button.hasAttribute('data-opp-connection-people'))openConnectionPeople(button.dataset.oppConnectionPeople);
      else if(button.hasAttribute('data-opp-discuss'))discuss(button.dataset.oppDiscuss);
      else if(button.hasAttribute('data-opp-connections-more')){const previous=view.connectionLimit;view.connectionLimit+=4;api.render();const next=document.querySelectorAll('[data-people-opportunity] h2 button')[previous];next?.focus();}
      else if(button.hasAttribute('data-opp-tab'))changeTab(button.dataset.oppTab);
      else if(button.hasAttribute('data-opp-open'))open(button.dataset.oppOpen);
      else if(button.hasAttribute('data-opp-save'))toggleSave(button.dataset.oppSave);
      else if(button.hasAttribute('data-opp-person'))api.showPerson(button.dataset.oppPerson);
      else if(button.hasAttribute('data-opp-more')){view.limit+=4;updateResults();document.querySelectorAll('#opp-results .opp-finding-notes > summary')[view.limit-4]?.focus();}
    });
    document.addEventListener('toggle',event=>{const details=event.target;if(!details.isConnected||!details.matches?.('.opp-finding-notes'))return;const id=details.closest('[data-opp-entry]')?.dataset.oppEntry;if(details.open)view.expanded.add(id);else view.expanded.delete(id);},true);
    document.addEventListener('input',event=>{if(event.target.id==='opp-search'){view.query=event.target.value;view.limit=4;updateResults();}});
    document.addEventListener('keydown',event=>{const button=event.target.closest('.opp-tab');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const current=tabs.findIndex(tab=>tab[0]===view.tab);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;changeTab(tabs[next][0]);});
  }
  // Tell the people: an in-place window to message the people a benefit applies to.
  // It saves drafts and can send labelled examples to the Roots Demo Inbox; nothing reaches volunteers.
  const demoReady=()=>!!window.RootsBridge?.status?.testPreview?.available;
  const requestHex=()=>crypto.randomUUID?crypto.randomUUID().replace(/-/g,''):Array.from({length:32},()=>Math.floor(Math.random()*16).toString(16)).join('');
  let tellTopic='';
  function tell({heading,personIds,message,topic=''}) {
    tellTopic=topic;
    const people=personIds.map(id=>state().people.find(person=>person.id===id)).filter(Boolean).slice(0,10);
    api.openDialog('Tell the people',`<h2 id="dialog-title">${e(heading)}</h2><p class="lead">Choose who to tell and check the message. Send opens the chat and delivers it to your Roots Demo Inbox on Telegram, never to the volunteers.</p>
      <form id="tell-form"><fieldset class="tell-people"><legend>Who</legend>${people.map(person=>`<label class="tell-person"><input type="checkbox" name="person" value="${e(person.id)}" checked>${api.avatar(person)}<span><strong>${e(person.name)}</strong><small>${person.consent?'SMS permission recorded':'SMS permission not recorded'}</small></span></label>`).join('')}</fieldset>
      <div class="form-field tell-message"><label for="tell-message">Message</label><textarea id="tell-message" name="message" rows="4" maxlength="600" required>${e(message)}</textarea><p class="hint">{first_name} becomes each person’s first name.</p></div>
      <div id="tell-result" role="status"></div>
      <div class="dialog-actions tell-actions"><button type="button" class="button" data-tell="save">Save as drafts</button><button type="submit" class="button primary"${demoReady()?'':' disabled title="Connect the Roots Demo Inbox to send examples"'}>Send to demo inbox ${api.icon('arrow')}</button></div></form>`);
  }
  async function tellRun(form,send) {
    const bridge=window.RootsBridge, result=document.getElementById('tell-result'), buttons=form.querySelectorAll('button');
    const ids=[...form.querySelectorAll('input[name=person]:checked')].map(input=>input.value), message=form.message.value.trim();
    if(!ids.length){result.innerHTML='<p class="tell-error">Choose at least one person.</p>';return;}
    if(!message)return;
    if(!bridge?.status?.testPreview?.csrfToken){result.innerHTML='<p class="tell-error">Open the connected local workspace to save or send these messages.</p>';return;}
    buttons.forEach(button=>button.disabled=true);
    result.innerHTML=`<p class="tell-progress">${send?'Opening the chat…':'Saving drafts…'}</p>`;
    try {
      await bridge.flush();
      const headers={'X-Roots-Test-Token':bridge.status.testPreview.csrfToken};
      const saved=await bridge.request('/api/drafts',{method:'POST',headers,body:JSON.stringify({drafts:ids.map(id=>({personId:id,channel:'sms',body:message.replaceAll('{first_name}',state().people.find(person=>person.id===id).name.split(' ')[0])}))})});
      const draftIds=(saved.drafts||[]).map(draft=>draft.id);
      if(!send){result.innerHTML=`<div class="success-panel"><strong>${api.icon('check')}${draftIds.length} ${draftIds.length===1?'draft':'drafts'} saved</strong>Nothing was sent. You can review them on Notices.</div>`;await bridge.loadActivity().catch(()=>{});return;}
      // Hand the drafts to the dashboard chat, which sends them and shows the receipt.
      await bridge.loadActivity().catch(()=>{});
      api.closeDialog?.();
      window.RootsChat.reviewDrafts(saved.drafts||[],{send:true,topic:tellTopic});
    } catch(error) {
      if(error.status===403)await bridge.init().catch(()=>{});
      result.innerHTML=`<p class="tell-error">${e(error.status===403?'The connection was refreshed. Press the button again.':error.message||'That did not work. Your message is still here.')}</p>`;
      buttons.forEach(button=>button.disabled=false);
    }
  }
  document.addEventListener('submit',event=>{if(event.target.id==='tell-form'){event.preventDefault();tellRun(event.target,true);}});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-tell="save"]');if(button)tellRun(button.form,false);});
  window.RootsOpportunities={configure,render,open,list,projects,tell};
})();
