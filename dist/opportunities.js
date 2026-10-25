/* Opportunity candidates and project drafts for the Roots demonstration. */
(() => {
  'use strict';
  let api;
  let bound = false;
  let review = null;
  const view = { tab: 'connections', audience:'all', query: '', limit: 4, connectionLimit:3, order:'reach', supportOnly:false, expanded: new Set() };
  const tabs = [['connections', 'For your community'], ['all', 'All leads'], ['projects', 'Projects'], ['saved', 'Saved']];
  const additions = [
    { id: 'o07', title: 'Local tool-sharing partners', type: 'In-kind benefit', benefit: 'Borrow the tools to keep growing at home.', description: 'Explore local libraries and community tool-sharing programs that could help volunteers put their new skills to use.', interests: ['Carpentry', 'Community gardening'], status: 'Find a local partner', requirements: ['Identify a provider and confirm its current lending rules', 'Check location, membership, deposits, and availability', 'Confirm whether access is public or needs a Guild partnership'], steps: ['Shortlist nearby tool libraries', 'Ask what support they can offer', 'Share the confirmed terms with interested volunteers'] },
    { id: 'o08', title: 'Seeds and growing supplies', type: 'In-kind benefit', benefit: 'Find seed exchanges and materials for new growers.', description: 'Look for community seed libraries, exchanges, and donated growing supplies. A provider and current offer still need to be identified.', interests: ['Native plants', 'Community gardening'], status: 'Find a local partner', requirements: ['Identify the provider and confirm available supplies', 'Check collection rules and any residency requirements', 'Agree how any donated supplies would be shared'], steps: ['Ask local seed libraries about current availability', 'Record collection details and any conditions', 'Invite interested volunteers to the confirmed opportunity'] },
    { id: 'o09', title: 'Practical skills and training', type: 'Learning opportunity', benefit: 'Connect volunteers with workshops they want to take.', description: 'Explore training in composting, habitat care, and growing food. This is a discovery lead; no free place, qualification, or discount is confirmed.', interests: ['Composting', 'Environmental education', 'Ecosystem restoration'], status: 'Find a training partner', requirements: ['Find a relevant course and check dates, cost, and access', 'Confirm whether a discount or funded place is available', 'Ask each person whether the course supports their goals'], steps: ['Shortlist suitable training providers', 'Ask about community places or group rates', 'Share the confirmed offer with interested people'] },
    { id: 'o10', title: 'Employer-supported volunteering', type: 'Employer benefit', benefit: 'Explore paid volunteer time and employer donations.', description: 'Some employers offer volunteering support. Ask volunteers whether they would like to explore their own employer’s program; no policy or donation is assumed.', interests: ['Data analysis', 'Web development', 'Community outreach'], status: 'Employer terms to check', requirements: ['Ask the volunteer which program, if any, applies to them', 'Check the employer’s nonprofit and activity requirements', 'Confirm who records hours and requests any donation'], steps: ['Invite people to share a program they already use', 'Review that employer’s current guidance', 'Prepare an hours record or project brief if appropriate'] },
    { id: 'o11', title: 'Support to make showing up easier', type: 'Participation support', benefit: 'Look for travel, equipment, or other practical support.', description: 'Ask what would help people participate, then explore local partners that could provide it. Preferences should come from the person, rather than assumptions about their circumstances.', interests: ['Service hours', 'Youth mentoring', 'Food recovery'], status: 'Ask what people need', requirements: ['Invite people to share needs privately and optionally', 'Identify a provider and verify what support is available', 'Confirm how support is requested and delivered'], steps: ['Add an optional support question to onboarding', 'Research support for the needs people actually name', 'Offer a private introduction once a service is confirmed'] }
  ];
  const originalMeta = {
    o01: { audiences: ['volunteers', 'organization'], supportKind:'funding', interests: ['Service hours', 'Environmental science', 'Community gardening'], status: 'Campus partnership needed', short: 'Explore a funded route into regular student service.' },
    o02: { audiences: ['volunteers', 'organization'], interests: ['Climate action', 'Composting', 'Ecosystem restoration'], status: 'Host terms to check', short: 'Explore dedicated capacity for climate projects.' },
    o03: { audiences: ['organization'], interests: ['Community gardening', 'Environmental education', 'Carpentry'], status: 'Current round to check', short: 'Investigate funding for growing spaces and learning.' },
    o04: { audiences: ['organization'], interests: ['Environmental education', 'Youth mentoring', 'Community outreach'], status: 'Program details to verify', short: 'Explore support for an agriculture learning series.' },
    o05: { audiences: ['volunteers'], interests: ['Service hours', 'Youth mentoring'], status: 'School approval needed', short: 'Create a recurring route to school service hours.' },
    o06: { audiences: ['organization'], interests: ['Data analysis', 'Web development', 'Community outreach', 'GIS mapping'], status: 'Employer partner needed', short: 'Bring specialist skills to a community project.' }
  };
  const projectSeeds = [
    { id: 'project-garden', title: 'Garden signs and learning walks', description: 'Help visitors understand the growing spaces through clear signs and a short series of volunteer-led learning walks.', benefit: 'A welcoming garden that helps people learn and return.', sourceOpportunityId: 'o04', funding: 'Explore CalAgPlate education support', team: [['p08', 'Learning walks', 'Environmental education and youth mentoring'], ['p03', 'Garden map', 'GIS mapping and data analysis'], ['p05', 'Outreach and photographs', 'Community outreach and photography']], budget: [['Signs and printing', 1200], ['Learning materials', 600], ['Workshop supplies', 400]], checks: ['Confirm the garden team wants this project', 'Ask the suggested team about interest and availability', 'Verify a suitable funding program and eligible costs', 'Agree the scope, accessibility, and final budget'] },
    { id: 'project-compost', title: 'A community composting program', description: 'Pair practical composting sessions with simple records of what the community diverts and learns.', benefit: 'Regular hands-on work with a clear community outcome.', sourceOpportunityId: 'o02', funding: 'Explore Climate Action Corps support', team: [['p04', 'Session coordination', 'Composting and community gardening'], ['p19', 'Impact records', 'Data analysis and climate action'], ['p21', 'Compost station', 'Carpentry and composting']], budget: [['Compost station materials', 1600], ['Tools and protective equipment', 700], ['Workshop materials', 300]], checks: ['Confirm site permission and capacity', 'Ask the team to review their proposed roles', 'Verify host requirements and application timing', 'Agree training, supervision, and impact measures'] },
    { id: 'project-habitat', title: 'A native habitat learning space', description: 'Create a small demonstration planting area and a practical way for new volunteers to learn about local habitats.', benefit: 'A shared project for people interested in plants and restoration.', sourceOpportunityId: 'o03', funding: 'Explore urban agriculture project support', team: [['p17', 'Planting plan', 'Native plants and ecosystem restoration'], ['p31', 'Beds and structures', 'Carpentry and native plants'], ['p22', 'Learning sessions', 'Environmental education and native plants']], budget: [['Plants and soil', 1500], ['Bed materials and tools', 1100], ['Learning signs', 400]], checks: ['Confirm the site and a suitable planting plan', 'Ask the suggested team about participation', 'Check whether a funding round covers this activity', 'Review ongoing care, access, and the final budget'] }
  ];
  const state = () => api.getState();
  const people = () => state().people || [];
  const e = value => api.esc(value);
  const money = value => '$' + Number(value).toLocaleString('en-US');
  const saved = id => (state().saved || []).includes(id);
  const matches = interests => people().map(person => {
    const shared = (person.interests || []).filter(interest => interests.includes(interest));
    return shared.length ? { personId: person.id, reason: 'Interested in ' + shared.join(' and ').toLowerCase() + '.', score: shared.length } : null;
  }).filter(Boolean).sort((a, b) => b.score - a.score);

  function list() {
    const originals = ((api && api.data) || window.ROOTS_DATA || {}).opportunities || [];
    return originals.concat(additions).map(record => {
      const meta = originalMeta[record.id] || {};
      const interests = meta.interests || record.interests || [];
      const matched = matches(interests).map(({ personId, reason }) => ({ personId, reason }));
      return { ...record, ...meta, sourceUrl: record.sourceUrl || null, audiences: meta.audiences || ['volunteers'], benefit: meta.short || record.benefit, interests, matches: matched, matchCount: matched.length, candidate: true };
    });
  }
  function projects() {
    return projectSeeds.map(project => ({ ...project, type: 'Project', status: 'Draft plan', candidate: true, total: project.budget.reduce((sum, item) => sum + item[1], 0), team: project.team.map(([personId, role, reason]) => ({ personId, role, reason })) }));
  }
  const allRecords = () => list().concat(projects());
  function filtered() {
    const source = view.tab === 'projects' ? projects() : view.tab === 'saved' ? allRecords().filter(record => saved(record.id)) : list().filter(record => view.audience==='all'||record.audiences.includes(view.audience));
    const query = view.query.trim().toLowerCase();
    return source.filter(record => !query || [record.title, record.description, record.benefit, record.type, record.funding, ...(record.interests || [])].join(' ').toLowerCase().includes(query));
  }
  function saveButton(record, inSheet = false) {
    return `<button class="${inSheet ? 'button' : 'icon-button'} opp-save ${saved(record.id) ? 'saved' : ''}" data-opp-save="${e(record.id)}" aria-label="${saved(record.id) ? 'Remove saved' : 'Save'} ${e(record.title)}" aria-pressed="${saved(record.id)}">${api.icon('bookmark')}${inSheet ? `<span>${saved(record.id) ? 'Saved' : record.type === 'Project' ? 'Save plan' : 'Save opportunity'}</span>` : ''}</button>`;
  }
  function reviewRecords(force = false) {
    const records = allRecords();
    review = window.RootsJournal?.review('opportunities', records.map(record => ({ id: record.id, content: record })), { force }) || null;
    return records;
  }
  function row(record) {
    const project = record.type === 'Project';
    const matchLabel = project ? `${record.team.length} suggested people` : `${record.matchCount} interest ${record.matchCount === 1 ? 'match' : 'matches'}`;
    const relevance = project ? `${record.benefit} The suggested roles draw on the interests recorded in their profiles.` : record.matchCount ? `${record.matchCount} ${record.matchCount === 1 ? 'person has interests that overlap' : 'people have interests that overlap'} with this lead’s themes: ${(record.interests || []).join(', ').toLowerCase()}. This is a starting point for a conversation, rather than a confirmed offer.` : 'No stated interests match yet. This lead may become more useful as people share what they want to learn or contribute.';
    const check = project ? record.checks[0] : (record.requirements || [])[0];
    return `<article class="opp-finding" data-opp-entry="${e(record.id)}"><div class="opp-finding-body"><details class="opp-finding-notes"${view.expanded.has(record.id) ? ' open' : ''}><summary><span class="opp-finding-title">${e(record.title)}</span><span class="opp-finding-description">${e(record.benefit)}</span><span class="opp-finding-meta">${e(project ? 'Project idea' : record.type)}<span aria-hidden="true"> · </span>${e(matchLabel)}</span><span class="opp-finding-caret">${api.icon('chevron-down')}</span></summary><div class="opp-finding-expanded"><p><strong>Why it connects</strong>${e(relevance)}</p>${check ? `<p><strong>Worth checking</strong>${e(check)}${/[.!?]$/.test(check) ? '' : '.'}</p>` : ''}<div class="opp-finding-actions"><button class="text-button" data-opp-open="${e(record.id)}">${project ? 'Explore the plan' : 'Explore this lead'} ${api.icon('arrow')}</button><span>${e(project ? money(record.total) + ' illustrative budget' : record.status)}</span></div></div></details>${saveButton(record)}</div></article>`;
  }
  function results() {
    const records = filtered();
    const shown = records.slice(0, view.limit);
    const noResults = view.query ? `<h3>No matches for “${e(view.query)}”</h3><p>Try a skill, benefit, or project name.</p><button class="button" data-opp-clear>Clear search</button>` : view.tab === 'saved' ? '<h3>A place for promising leads.</h3><p>Save an opportunity or project plan to find it here.</p><button class="button primary" data-opp-tab="all">Explore opportunities</button>' : '<h3>No opportunities in this view</h3><p>Try another category to explore the current leads.</p>';
    return `${records.length ? `<div class="opp-findings">${shown.map(row).join('')}</div>` : `<div class="empty opp-empty">${noResults}</div>`}<div class="opp-list-footer"><span role="status">${records.length ? `Showing ${shown.length} of ${records.length} ${view.tab === 'projects' ? 'project ideas' : 'leads'}` : 'No results'}</span>${shown.length < records.length ? `<button class="text-button" data-opp-more>Show ${Math.min(records.length - shown.length, 4)} more ${api.icon('chevron-down')}</button>` : ''}</div>`;
  }
  const connections = () => window.RootsConnections?.rankOpportunities(state(),list(),{order:view.order,supportOnly:view.supportOnly})||[];
  const peopleHeadlines = {
    o01:n=>`${n} people could explore a regular service pathway`,
    o02:n=>`${n} people could help a climate project grow`,
    o03:n=>`${n} people could shape a community growing space`,
    o04:n=>`${n} people could bring a learning garden to life`,
    o05:n=>`${n} people could build a service-hour pathway`,
    o06:n=>`${n} people could contribute to a specialist project`,
    o07:n=>`${n} people could make use of shared tools`,
    o08:n=>`${n} people could grow more with seeds and supplies`,
    o09:n=>`${n} people could build on their interests through training`,
    o10:n=>`${n} people could explore employer-backed volunteering`,
    o11:n=>`Ask ${n} people what would make taking part easier`
  };
  const joinWords = words => words.length<2?words[0]||'':words.slice(0,-1).join(', ')+' and '+words[words.length-1];
  function connectionMarkup(item) {
    const record=list().find(record=>record.id===item.id);if(!record)return '';
    const linkedProjects=projects().filter(project=>project.sourceOpportunityId===item.id);
    const matched=item.personIds.map(id=>people().find(person=>person.id===id)).filter(Boolean);
    const names=matched.slice(0,3).map(person=>`<button data-opp-person="${e(person.id)}">${api.avatar(person)}<span>${e(person.name)}</span></button>`).join('');
    const themes=joinWords(item.interests.map(interest=>interest.label.toLowerCase()));
    const value=['Grant','Fellowship'].includes(record.type)||record.supportKind==='funding'?'Funding amount unverified':record.type==='In-kind benefit'?'In-kind support to explore':record.type==='Employer benefit'?'Employer terms to check':record.type;
    const headline=(peopleHeadlines[item.id]?.(item.peopleCount)||`${item.peopleCount} people share interests with ${record.title}`).replace(/^1 people/, '1 person');
    return `<article class="opp-connection" data-people-opportunity="${e(item.id)}"><h2>${e(headline)}</h2><div class="opp-people-line" aria-label="People with matching interests">${names}${matched.length>3?`<button class="opp-more-people" data-opp-connection-people="${e(item.id)}">+${matched.length-3} more</button>`:''}</div><p class="opp-connection-summary">Their recorded interests connect through ${e(themes)}. ${e(record.benefit)}</p><div class="finding-sources" aria-label="Opportunity source"><button data-opp-open="${e(record.id)}">${api.icon('leaf')}${e(record.title)}</button><span aria-hidden="true">&middot;</span><span>${e(value)}</span></div><div class="finding-next"><button class="briefing-action" data-opp-open="${e(record.id)}">Explore opportunity ${api.icon('arrow')}</button><details class="briefing-evidence"><summary>Why these people</summary><div><p>${item.peopleCount} ${item.peopleCount===1?'person has':'people have'} at least one stated interest matching this lead. ${item.closeCount?`${item.closeCount} ${item.closeCount===1?'person matches':'people match'} two or more themes.`:''} This shows a possible connection, not confirmed participation or eligibility.</p><p>${item.interests.map(interest=>`${e(interest.label)}: ${interest.count}`).join(' · ')}. People can appear under more than one interest.</p>${linkedProjects.length?`<p><strong>A project to explore:</strong> ${linkedProjects.map(project=>`<button class="briefing-discuss" data-opp-open="${e(project.id)}">${e(project.title)} ${api.icon('arrow')}</button>`).join(' ')}</p>`:''}<p><strong>Next step:</strong> Ask the people whether this would be useful, then ${e((record.steps?.[0]||'verify the provider’s current terms').replace(/^[A-Z]/,c=>c.toLowerCase()))}.</p><button class="briefing-discuss" data-opp-connection-people="${e(item.id)}">${api.icon('users')}See all ${item.peopleCount} people</button><button class="briefing-discuss" data-opp-discuss="${e(item.id)}">${api.icon('message')}Explore this with Roots</button></div></details></div></article>`;
  }
  function communityContent(findings) {
    const shown=findings.slice(0,view.connectionLimit);
    return `<div class="opp-priority-controls"><label for="opp-order"><span>Start with</span><select id="opp-order"><option value="reach"${view.order==='reach'?' selected':''}>Most people</option><option value="closest"${view.order==='closest'?' selected':''}>Closest match</option></select></label><button data-opp-support aria-pressed="${view.supportOnly}">Funding &amp; support ${view.supportOnly?api.icon('check'):''}</button></div><p class="opp-priority-note">${view.order==='reach'?'More people with matching interests come first.':'More people with two or more matching interests come first.'} ${view.supportOnly?'Includes funding and in-kind leads; values are unverified.':'Interest is a starting point for a conversation.'}</p><div class="opp-connections">${shown.length?shown.map(connectionMarkup).join(''):'<div class="outreach-empty"><h2>A little more context will help.</h2><p>Add interests to people’s profiles, then explore the leads that could support them.</p><a class="text-button" href="#people">Explore your people</a></div>'}</div>${shown.length<findings.length?`<div class="opp-more-connections"><button class="text-button" data-opp-connections-more>Show ${Math.min(3,findings.length-shown.length)} more possibilities ${api.icon('chevron-down')}</button><span>${shown.length} of ${findings.length}</span></div>`:''}`;
  }
  function render() {
    const records=reviewRecords(), findings=connections(), savedCount=records.filter(record=>saved(record.id)).length;
    const checked=review?.checkedAt, stamp=checked&&window.RootsJournal.formatStamp(checked);
    const descriptions={all:'The source leads behind these possibilities.',projects:'Draft plans shaped around your community.',saved:'Promising leads and plans to return to.'};
    const content=view.tab==='connections'?communityContent(findings):`<section id="opp-panel" role="tabpanel" aria-labelledby="opp-tab-${view.tab}"><div class="opp-toolbar"><p>${descriptions[view.tab]}</p><label class="search-field opp-search">${api.icon('search')}<input id="opp-search" type="search" aria-label="Search opportunities and projects" placeholder="Search leads…" value="${e(view.query)}"></label></div>${view.tab==='all'?`<div class="opp-audiences" role="group" aria-label="Lead audience">${[['all','Everyone'],['volunteers','For volunteers'],['organization','For the organization']].map(([id,label])=>`<button data-opp-audience="${id}" aria-pressed="${view.audience===id}">${label}</button>`).join('')}</div>`:''}<div id="opp-results">${results()}</div></section>`;
    return `<div class="opp-intelligence">${api.head('Opportunities','Possibilities shaped around your people.')}<div class="opp-review"><p role="status">${stamp?`Records checked ${e(stamp)}`:'Connections from your saved records'}</p><button class="text-button" data-opp-review>Check again ${api.icon('refresh')}</button></div><div class="opp-tabs" role="tablist" aria-label="Opportunity views">${tabs.map(([id,label])=>`<button id="opp-tab-${id}" class="opp-tab ${view.tab===id?'active':''}" role="tab" aria-selected="${view.tab===id}" aria-controls="${id==='connections'?'opp-community-panel':'opp-panel'}" tabindex="${view.tab===id?'0':'-1'}" data-opp-tab="${id}">${label}${id==='saved'?`<span>${savedCount}</span>`:''}</button>`).join('')}</div>${view.tab==='connections'?`<section id="opp-community-panel" role="tabpanel" aria-labelledby="opp-tab-connections">${content}</section>`:content}<details class="opp-provenance"><summary>How these connections are found ${api.icon('chevron-down')}</summary><p>Roots compares interests people have shared with the themes of saved leads. People may appear in several possibilities. “Most people” orders by the number of matching profiles; “Closest match” first counts profiles with at least two matching themes, then total people. Funding &amp; support includes grants, fellowships, funded partnerships, in-kind and employer leads; it does not rank money because current award values are unverified. These are illustrative records and candidate leads. Current terms, eligibility, funding and people’s interest in taking part still need confirmation.</p></details></div>`;
  }
  function openConnectionPeople(id) {
    const item=connections().find(item=>item.id===id), record=list().find(record=>record.id===id);if(!item||!record)return;
    api.openDialog('People behind this possibility',`<h2 id="dialog-title">${item.peopleCount} people · ${e(record.title)}</h2><p class="lead">These people share interests with this lead. Ask whether it would be useful to them; participation and eligibility have not been confirmed.</p><div class="briefing-people">${item.matches.map(match=>({person:people().find(person=>person.id===match.personId),interests:match.interests})).filter(item=>item.person).map(({person,interests})=>`<button data-opp-person="${e(person.id)}">${api.avatar(person)}<span><strong>${e(person.name)}</strong><small>${e(interests.join(' · '))}</small></span>${api.icon('arrow')}</button>`).join('')}</div>`);
  }
  function accordion(title, content, count) {
    return `<details class="opp-details"><summary><span>${e(title)}</span>${count != null ? `<small>${count}</small>` : ''}${api.icon('chevron-down')}</summary><div>${content}</div></details>`;
  }
  function personRow(match, role) {
    const person = people().find(item => item.id === match.personId);
    if (!person) return '';
    return `<button class="opp-person" data-opp-person="${e(person.id)}">${api.avatar(person)}<span><strong>${e(person.name)}${role ? `<small>${e(role)}</small>` : ''}</strong><span>${e(match.reason)}</span></span>${api.icon('chevron-right')}</button>`;
  }
  function open(id) {
    const record = allRecords().find(item => item.id === id);
    if (!record) { api.toast('That opportunity is no longer available.'); return; }
    const project = record.type === 'Project';
    if (project) {
      const funding = list().find(item => item.id === record.sourceOpportunityId);
      api.openDialog('Project plan', `<div class="opp-sheet"><span class="badge neutral">Draft for your team</span><h2 id="dialog-title">${e(record.title)}</h2><p class="lead">${e(record.description)}</p><div class="opp-benefit"><span>What this could create</span><strong>${e(record.benefit)}</strong></div><section class="opp-match-section"><div class="opp-section-heading"><h3>A team to ask</h3><span>${record.team.length} suggestions</span></div>${record.team.map(member => personRow(member, member.role)).join('')}<p class="source-note">Suggested from fictional profiles. Roles and participation have not been agreed.</p></section>${accordion('Draft budget', `<div class="opp-budget">${record.budget.map(([label, amount]) => `<div><span>${e(label)}</span><strong>${money(amount)}</strong></div>`).join('')}<div class="opp-budget-total"><span>Illustrative total</span><strong>${money(record.total)}</strong></div></div>`, money(record.total))}${accordion('Before this can go ahead', `<ul class="opp-checks">${record.checks.map(check => `<li>${api.icon('info')}<span>${e(check)}</span></li>`).join('')}</ul>`, record.checks.length)}${accordion('A funding route to explore', `<p>${e(record.funding)}. The project scope and current program terms need review together.</p>${funding ? `<button class="button quiet" data-opp-open="${e(funding.id)}">Explore ${e(funding.title)} ${api.icon('arrow')}</button>` : ''}`)}<div class="dialog-actions">${saveButton(record, true)}</div><p class="source-note">Example scope and budget for discussion. No funding application or commitment has been made.</p></div>`);
      return;
    }
    const visibleMatches = record.matches.slice(0, 3);
    const extraMatches = record.matches.slice(3);
    api.openDialog('Opportunity', `<div class="opp-sheet"><span class="badge neutral">${e(record.type)} · Candidate</span><h2 id="dialog-title">${e(record.title)}</h2><p class="lead">${e(record.description.replace(/^Conceptual (match|local partnership|partnership idea):\s*/i, '').replace(/^Conceptual lead from the brief:\s*/i, ''))}</p><div class="opp-benefit"><span>Potential benefit</span><strong>${e(record.benefit)}</strong><small>${api.icon('info')}${e(record.status)}</small></div><section class="opp-match-section"><div class="opp-section-heading"><h3>People who may be interested</h3><span>${record.matchCount} ${record.matchCount === 1 ? 'match' : 'matches'}</span></div>${visibleMatches.length ? visibleMatches.map(match => personRow(match)).join('') : '<p class="opp-no-match">No stated interests match yet. Add interests to a person’s profile to make future matches more useful.</p>'}${extraMatches.length ? accordion(`See ${extraMatches.length} more matches`, extraMatches.map(match => personRow(match)).join('')) : ''}<p class="source-note">Interest matches only. Ask the person and verify program conditions before making an offer.</p></section>${accordion('Terms to confirm', `<ul class="opp-checks">${(record.requirements || []).map(requirement => `<li>${api.icon('info')}<span>${e(requirement)}</span></li>`).join('')}</ul>`, (record.requirements || []).length)}${accordion('Next steps', `<ol class="step-list">${(record.steps || []).map(step => `<li>${e(step)}</li>`).join('')}</ol>`, (record.steps || []).length)}<div class="dialog-actions">${saveButton(record, true)}${record.sourceUrl ? `<a class="button" href="${e(record.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official program ${api.icon('external')}</a>` : ''}</div><p class="source-note">${record.sourceUrl ? 'Check the official program for current terms and availability.' : 'A provider and current source still need to be identified.'} No confirmed benefit or eligibility decision is implied.</p></div>`);
  }
  function updateResults() {
    const target = document.getElementById('opp-results');
    if (target) target.innerHTML = results();
  }
  function changeTab(id) {
    if (!tabs.some(tab => tab[0] === id)) return;
    view.tab = id; view.query = ''; view.limit = 4;
    api.render();
    document.querySelector(`#opp-tab-${id}`)?.focus();
  }
  function toggleSave(id) {
    const record = allRecords().find(item => item.id === id);
    if (!record) return;
    const isSaved = saved(id);
    state().saved = isSaved ? state().saved.filter(item => item !== id) : [...(state().saved || []), id];
    api.persist();
    api.logActivity(`${isSaved ? 'Removed saved' : 'Saved'} ${record.title}`);
    api.render();
    document.querySelectorAll('[data-opp-save]').forEach(button => {
      if (button.dataset.oppSave !== id) return;
      const active = saved(id);
      button.classList.toggle('saved', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active ? 'Remove saved' : 'Save'} ${record.title}`);
      const label = button.querySelector('span');
      if (label) label.textContent = active ? 'Saved' : record.type === 'Project' ? 'Save plan' : 'Save opportunity';
    });
    if (!document.getElementById('detail-dialog')?.open) {
      const focusTarget = document.querySelector(`[data-opp-save="${id}"]`) || document.getElementById(`opp-tab-${view.tab}`);
      focusTarget?.focus();
    }
    api.toast(isSaved ? 'Removed from saved' : record.type === 'Project' ? 'Project plan saved' : 'Opportunity saved');
  }
  function configure(nextApi) {
    api = nextApi;
    if (bound) return;
    bound = true;
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-opp-tab],[data-opp-open],[data-opp-save],[data-opp-person],[data-opp-clear],[data-opp-more],[data-opp-review],[data-opp-audience],[data-opp-connection-people],[data-opp-discuss],[data-opp-support],[data-opp-connections-more]');
      if (!button || !api) return;
      if (button.hasAttribute('data-opp-review')) { reviewRecords(true); api.render(); document.querySelector('[data-opp-review]')?.focus(); api.toast('Record matches checked. External program terms still need review.'); }
      else if (button.hasAttribute('data-opp-connection-people')) openConnectionPeople(button.dataset.oppConnectionPeople);
      else if (button.hasAttribute('data-opp-discuss')) {const item=connections().find(item=>item.id===button.dataset.oppDiscuss),record=list().find(record=>record.id===button.dataset.oppDiscuss);if(item&&record)window.RootsChat.setPrompt(`Help me explore ${record.title} for the ${item.peopleCount} people whose stated interests connect. Explain who could benefit or take part, what to ask them, and the provider terms to verify. Do not assume eligibility, funding or participation, and do not send messages.`);}
      else if (button.hasAttribute('data-opp-support')) {view.supportOnly=!view.supportOnly;view.connectionLimit=3;api.render();document.querySelector('[data-opp-support]')?.focus();}
      else if (button.hasAttribute('data-opp-connections-more')) {const previous=view.connectionLimit;view.connectionLimit+=3;api.render();const next=document.querySelectorAll('[data-people-opportunity] h2')[previous];if(next){next.setAttribute('tabindex','-1');next.focus();}}
      else if (button.hasAttribute('data-opp-audience')) {view.audience=button.dataset.oppAudience;view.limit=4;api.render();document.querySelector(`[data-opp-audience="${view.audience}"]`)?.focus();}
      else if (button.hasAttribute('data-opp-tab')) changeTab(button.dataset.oppTab);
      else if (button.hasAttribute('data-opp-open')) open(button.dataset.oppOpen);
      else if (button.hasAttribute('data-opp-save')) toggleSave(button.dataset.oppSave);
      else if (button.hasAttribute('data-opp-person')) api.showPerson(button.dataset.oppPerson);
      else if (button.hasAttribute('data-opp-clear')) { view.query = ''; view.limit = 4; const input = document.getElementById('opp-search'); if (input) { input.value = ''; input.focus(); } updateResults(); }
      else if (button.hasAttribute('data-opp-more')) { view.limit += 4; updateResults(); document.querySelectorAll('#opp-results .opp-finding-notes > summary')[view.limit - 4]?.focus(); }
    });
    document.addEventListener('toggle', event => {
      const details = event.target;
      if (!details.isConnected || !details.matches?.('.opp-finding-notes')) return;
      const id = details.closest('[data-opp-entry]')?.dataset.oppEntry;
      if (!id) return;
      if (details.open) view.expanded.add(id); else view.expanded.delete(id);
    }, true);
    document.addEventListener('change', event => {
      if(event.target.id!=='opp-order')return;
      view.order=event.target.value==='closest'?'closest':'reach';view.connectionLimit=3;api.render();document.getElementById('opp-order')?.focus();
    });
    document.addEventListener('input', event => {
      if (event.target.id !== 'opp-search') return;
      view.query = event.target.value; view.limit = 4; updateResults();
    });
    document.addEventListener('keydown', event => {
      const button = event.target.closest('.opp-tab');
      if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.findIndex(tab => tab[0] === view.tab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      changeTab(tabs[next][0]);
    });
  }
  window.RootsOpportunities = { configure, render, open, list, projects };
})();
