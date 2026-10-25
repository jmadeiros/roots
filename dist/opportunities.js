/* Opportunity candidates and project drafts for the Roots demonstration. */
(() => {
  'use strict';
  let api;
  let bound = false;
  let review = null;
  const view = { tab: 'connections', audience:'all', query: '', limit: 4, connectionLimit:3, order:'participation', supportOnly:false, expanded: new Set() };
  const tabs = [['connections', 'For your community'], ['all', 'All leads'], ['projects', 'Projects'], ['saved', 'Saved']];
  const additions = [
    { id:'o12', title:'Microsoft employee volunteer matching', type:'Employer giving', supportKind:'employer', interests:[], employer:'Microsoft', policyCheckedAt:'2026-10-24', policyRate:25, policyAnnualLimit:15000, sourceUrl:'https://www.microsoft.com/en-us/reno/community-involvement', guideUrl:'https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/FY25-Max-Employee-Engagement-March-2025.pdf', benefit:'$25 per eligible volunteer hour, donated to the nonprofit.', description:'Microsoft’s published U.S. employee program donates $25 per eligible volunteer hour to eligible nonprofits. The combined annual matching benefit is capped at $15,000 per employee across time and giving. Neither Roots’ eligibility nor any employee’s participation has been confirmed.', status:'Public policy checked 24 Oct 2026 · Eligibility to confirm', requirements:['Confirm the organization meets Microsoft’s nonprofit criteria and is registered with Benevity','Find a willing eligible Microsoft employee; a recorded employer name alone does not establish eligibility','Check current employee terms and the remaining combined annual matching limit'], steps:['Confirm nonprofit eligibility and review Benevity registration','Prepare a recurring volunteer activity with clear supervision and hour records','Find an employee contact or Change Agent and ask whether the activity is useful','Ask participating employees to submit their eligible volunteer-hour requests; unsolicited grant requests are not the route'] },
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
    o05: { audiences: ['volunteers'], interests: ['Service hours'], status: 'School approval needed', short: 'Create a recurring route to school service hours.' },
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
      const matched = record.employer ? employerPeople(record.employer).map(person=>({personId:person.id,reason:'Microsoft is recorded as their employer; employee eligibility still needs checking.'})) : matches(interests).map(({ personId, reason }) => ({ personId, reason }));
      return { ...record, ...meta, sourceUrl: record.sourceUrl || null, audiences: meta.audiences || record.audiences || (record.employer?['volunteers','organization']:['volunteers']), benefit: meta.short || record.benefit, interests, matches: matched, matchCount: matched.length, candidate: true };
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
  const participationPlans = {
    o01:{title:'Build a recurring campus-to-garden shift',activity:'Propose a weekly garden shift with a campus partner, a named supervisor and a simple attendance record.',benefit:'A predictable place to contribute and learn; any funded placement depends on campus approval.',steps:['Ask who is enrolled and what experience or hours they actually need.','Agree a pilot schedule and supervision with a participating campus.']},
    o02:{title:'Give a composting project a regular team',activity:'Propose a monthly compost workshop, supported by a small recurring team that records material diverted and what participants learn.',benefit:'Practical climate experience for volunteers; a fellowship could add capacity if the host terms fit.',steps:['Ask interested people which roles and times they would choose.','Confirm a trained lead, site permission and current fellowship requirements.']},
    o03:{title:'Turn a growing space into a weekly learning project',activity:'Propose one teaching bed, clear growing signs and a weekly session to plant, maintain and share the harvest.',benefit:'A tangible project people can return to; a suitable grant could cover eligible materials.',steps:['Agree the bed, accessible tasks and a supervisor with the garden team.','Cost the materials, then verify an open funding round before applying.']},
    o04:{title:'Run a short series of garden learning walks',activity:'Propose four volunteer-led walks, supported by simple signs explaining what is growing and how the space works.',benefit:'A clear role for people who want to teach, welcome or document; education support is a lead to verify.',steps:['Ask the proposed team what they want to contribute and what support they need.','Prepare the route and materials, then check education-program eligibility.']},
    o05:{title:'Make service hours a reason to come back',activity:'Propose four weekly, two-hour garden shifts with a named supervisor and a record of completed hours.',benefit:'A clear route to contribute regularly. School recognition depends on each person’s requirements and school approval.',steps:['Ask which people are students, their deadlines and any confirmed hour targets.','Agree school approval and supervision, then offer a repeatable shift.']},
    o06:{title:'Give an employer team a useful, bounded project',activity:'Propose a small volunteer project: a garden map, a clearer sign-up flow or a monthly impact report.',benefit:'An employer team can contribute a specific deliverable; people choose roles based on skills they have actually shared.',steps:['Choose one deliverable and a staff point of contact.','Find the employer’s volunteer coordinator and agree time, skills and access.']},
    o07:{title:'Pair repeat visits with a practical take-home benefit',activity:'Propose a short growing series and explore a tool-library partnership so participants can borrow equipment to use what they learn.',benefit:'Useful equipment and practical learning could make another visit worthwhile. Ask people first; no lending offer is secured.',steps:['Find out which tools or materials people would actually use.','Ask a local provider about loans, deposits and access, then share confirmed terms.']},
    o08:{title:'Connect a planting session with seeds to grow at home',activity:'Propose a seasonal sowing session with a seed-library or donation partner, followed by a shared growing check-in.',benefit:'A small, practical benefit that extends the activity beyond the garden, if a supplier agrees.',steps:['Ask what people want to grow and what space they have available.','Confirm seed supply, collection rules and a fair way to share it.']},
    o09:{title:'Give the next visit a clear learning outcome',activity:'Propose a hands-on composting or habitat workshop with a follow-up volunteer session where people can practise together.',benefit:'A useful new skill and a reason to return. A training partner might offer community places or a group rate.',steps:['Ask which topic and format people would find useful.','Find a suitable trainer and verify any funded places before offering them.']},
    o10:{title:'Find employer benefits that can support more volunteering',activity:'Invite people to share any paid volunteering days or donation-matching scheme they already have through work.',benefit:'An existing employee benefit could support their time or generate a donation for the organization.',steps:['Record an employer or program only when the person chooses to share it.','Verify that employer’s terms, then prepare the hours record or project brief.']},
    o11:{title:'Remove a practical barrier to taking part',activity:'Ask privately what would make another visit easier, then explore a specific travel, equipment or access partner around the needs people name.',benefit:'Support is useful when it answers a need the person has actually shared.',steps:['Use an optional question; do not infer needs from someone’s profile.','Confirm a provider, access rules and delivery before making an introduction.']}
  };
  const profileFor=person=>window.RootsPeople?.profileData(person)||person;
  function employerPeople(employer) {
    return people().filter(person=>{
      const name=String(profileFor(person).employer||'').trim().toLowerCase();
      return name===employer.toLowerCase() || name===employer.toLowerCase()+' corporation';
    });
  }
  function avatarCluster(members,id) {
    const shown=members.slice(0,6);
    return `<div class="people-cluster" aria-label="People connected to this possibility">${shown.map(person=>`<button data-opp-person="${e(person.id)}" title="${e(person.name)}" aria-label="View ${e(person.name)}">${api.avatar(person)}</button>`).join('')}${members.length>shown.length?`<button class="people-cluster-more" data-opp-connection-people="${e(id)}" title="See all ${members.length} people" aria-label="See all ${members.length} people">+${members.length-shown.length}</button>`:''}</div>`;
  }
  function connectionMarkup(item) {
    const record=list().find(record=>record.id===item.id);if(!record)return '';
    const plan=participationPlans[item.id]||{title:record.title,activity:record.benefit,benefit:record.description,steps:record.steps?.slice(0,2)||[]};
    const linkedProjects=projects().filter(project=>project.sourceOpportunityId===item.id);
    const matched=item.personIds.map(id=>people().find(person=>person.id===id)).filter(Boolean);
    const first=matched.filter(person=>person.visits===1).length;
    const knownVisits=matched.filter(person=>Number.isSafeInteger(person.visits)&&person.visits>=0).length;
    const recordedHours=matched.filter(person=>Number.isFinite(person.hours)&&person.hours>=0);
    const totalHours=recordedHours.reduce((total,person)=>total+person.hours,0);
    const value=['Grant','Fellowship'].includes(record.type)||record.supportKind==='funding'?'Funding to verify':record.type==='In-kind benefit'?'In-kind support':record.type==='Employer benefit'?'Employer benefit to check':record.type;
    return `<article class="opp-connection" data-people-opportunity="${e(item.id)}"><div class="opp-idea"><h2>${e(plan.title)}</h2><p class="opp-connection-summary">${e(plan.activity)}</p><p class="opp-proposed-benefit"><strong>Why it could help</strong> ${e(plan.benefit)}</p><ol class="opp-plan-steps">${plan.steps.map(step=>`<li>${e(step)}</li>`).join('')}</ol><div class="finding-sources" aria-label="Opportunity source"><button data-opp-open="${e(record.id)}">${api.icon('leaf')}${e(record.title)}</button><span aria-hidden="true">&middot;</span><span>${e(value)}</span></div><div class="finding-next"><button class="briefing-action" data-opp-discuss="${e(record.id)}">Shape this idea ${api.icon('arrow')}</button><details class="briefing-evidence"><summary>See the basis</summary><div><p>These are proposed activities. Interest matches do not establish a person’s participation, eligibility or need for support.</p>${linkedProjects.length?`<p><strong>A draft to build on:</strong> ${linkedProjects.map(project=>`<button class="briefing-discuss" data-opp-open="${e(project.id)}">${e(project.title)} ${api.icon('arrow')}</button>`).join(' ')}</p>`:''}<button class="briefing-discuss" data-opp-open="${e(record.id)}">Check program terms ${api.icon('arrow')}</button></div></details></div></div><aside class="opp-people-evidence" aria-label="People and recorded evidence"><h3>${item.peopleCount} ${item.peopleCount===1?'person to ask':'people to ask'}</h3>${avatarCluster(matched,item.id)}<button class="opp-see-people" data-opp-connection-people="${e(item.id)}">See the people ${api.icon('arrow')}</button><dl class="opp-evidence-facts"><div><dt>One recorded visit</dt><dd>${knownVisits?`${first} of ${knownVisits}`:'Not recorded'}</dd></div><div><dt>${item.id==='o05'?'Recorded contribution':'Shared interest themes'}</dt><dd>${item.id==='o05'?(recordedHours.length?`${totalHours.toLocaleString()} h`:'Not recorded'):item.interests.length}</dd></div></dl><p class="opp-evidence-observation">${item.id==='o05'?`${item.peopleCount} list service hours as an interest${first?`; ${first} have one recorded visit`:''}. Student status and school requirements need confirming.`:first?`${first} ${first===1?'person in this group has':'people in this group have'} one recorded visit. A useful benefit or activity is something to ask about, not an assumed motivation.`:'These people share relevant interests. Ask what would make this activity useful to them.'}</p><details class="opp-interest-detail"><summary>Interests behind this ${api.icon('chevron-down')}</summary><ul>${item.interests.map(interest=>`<li><span>${e(interest.label)}</span><strong>${interest.count}</strong></li>`).join('')}</ul></details></aside></article>`;
  }
  function csrLeadMarkup() {
    const record=list().find(record=>record.id==='o12'), members=employerPeople('Microsoft');
    return `<section class="opp-csr-lead" aria-labelledby="csr-lead-heading"><div class="opp-idea"><h2 id="csr-lead-heading">Turn employee volunteer hours into a donation</h2><p class="opp-connection-summary">Microsoft’s published U.S. program donates $25 for each eligible employee volunteer hour to an eligible nonprofit. This is a concrete employer route to explore.</p><p class="opp-proposed-benefit"><strong>A practical approach</strong> Prepare a recurring volunteer activity, check nonprofit eligibility through Benevity, then find a willing employee contact or Change Agent. The employee submits the eligible hours.</p><div class="finding-sources"><a href="${e(record.sourceUrl)}" target="_blank" rel="noopener noreferrer">Microsoft’s published policy ${api.icon('external')}</a><span>Checked 24 Oct 2026</span></div><button class="briefing-action opp-csr-action" data-opp-open="o12">Explore the employer route ${api.icon('arrow')}</button></div><aside class="opp-people-evidence"><h3>What the policy offers</h3><dl class="opp-evidence-facts"><div><dt>Eligible volunteer time</dt><dd>$25 / hour</dd></div><div><dt>Combined annual match limit</dt><dd>$15,000 / employee</dd></div></dl><p class="opp-evidence-observation">The cap covers eligible time and donations together. It is a program limit, not projected income for Roots.</p>${members.length?`${avatarCluster(members,'o12')}<p class="opp-evidence-observation">${members.length} ${members.length===1?'profile records':'profiles record'} Microsoft as an employer. Check the person’s program eligibility.</p>`:'<p class="opp-csr-gap">No Microsoft employer connection is recorded yet.</p>'}<a class="opp-csr-guide" href="${e(record.guideUrl)}" target="_blank" rel="noopener noreferrer">Nonprofit participation guide ${api.icon('external')}</a></aside></section>`;
  }
  function communityContent(findings) {
    const shown=findings.slice(0,view.connectionLimit);
    const ordering=view.order==='participation'?'Service-hour pathways, practical benefits and learning ideas come first.':view.order==='reach'?'More people with matching interests come first.':'More people with two or more matching interests come first.';
    return `<div class="opp-priority-controls"><label for="opp-order"><span>Start with</span><select id="opp-order"><option value="participation"${view.order==='participation'?' selected':''}>Participation ideas</option><option value="reach"${view.order==='reach'?' selected':''}>Most people</option><option value="closest"${view.order==='closest'?' selected':''}>Closest match</option></select></label><button data-opp-support aria-pressed="${view.supportOnly}">Funding &amp; support ${view.supportOnly?api.icon('check'):''}</button></div><p class="opp-priority-note">${ordering} Proposed activities, grounded in your records.</p><div class="opp-connections">${shown.length?shown.map(connectionMarkup).join(''):'<div class="outreach-empty"><h2>A little more context will help.</h2><p>Add interests to people’s profiles, then explore the leads that could support them.</p><a class="text-button" href="#people">Explore your people</a></div>'}</div>${shown.length<findings.length?`<div class="opp-more-connections"><button class="text-button" data-opp-connections-more>Show ${Math.min(3,findings.length-shown.length)} more ideas ${api.icon('chevron-down')}</button><span>${shown.length} of ${findings.length}</span></div>`:''}${csrLeadMarkup()}`;
  }
  function render() {
    const records=reviewRecords(), findings=connections(), savedCount=records.filter(record=>saved(record.id)).length;
    const checked=review?.checkedAt, stamp=checked&&window.RootsJournal.formatStamp(checked);
    const descriptions={all:'The source leads behind these possibilities.',projects:'Draft plans shaped around your community.',saved:'Promising leads and plans to return to.'};
    const content=view.tab==='connections'?communityContent(findings):`<section id="opp-panel" role="tabpanel" aria-labelledby="opp-tab-${view.tab}"><div class="opp-toolbar"><p>${descriptions[view.tab]}</p><label class="search-field opp-search">${api.icon('search')}<input id="opp-search" type="search" aria-label="Search opportunities and projects" placeholder="Search leads…" value="${e(view.query)}"></label></div>${view.tab==='all'?`<div class="opp-audiences" role="group" aria-label="Lead audience">${[['all','Everyone'],['volunteers','For volunteers'],['organization','For the organization']].map(([id,label])=>`<button data-opp-audience="${id}" aria-pressed="${view.audience===id}">${label}</button>`).join('')}</div>`:''}<div id="opp-results">${results()}</div></section>`;
    return `<div class="opp-intelligence">${api.head('Opportunities','More reasons to take part. More ways to make it possible.')}<div class="opp-review"><p role="status">${stamp?`Records checked ${e(stamp)}`:'Connections from your saved records'}</p><button class="text-button" data-opp-review>Check again ${api.icon('refresh')}</button></div><div class="opp-tabs" role="tablist" aria-label="Opportunity views">${tabs.map(([id,label])=>`<button id="opp-tab-${id}" class="opp-tab ${view.tab===id?'active':''}" role="tab" aria-selected="${view.tab===id}" aria-controls="${id==='connections'?'opp-community-panel':'opp-panel'}" tabindex="${view.tab===id?'0':'-1'}" data-opp-tab="${id}">${label}${id==='saved'?`<span>${savedCount}</span>`:''}</button>`).join('')}</div>${view.tab==='connections'?`<section id="opp-community-panel" role="tabpanel" aria-labelledby="opp-tab-connections">${content}</section>`:content}<details class="opp-provenance"><summary>How these connections are found ${api.icon('chevron-down')}</summary><p>Roots compares interests people have shared with the themes of saved leads. People may appear in several possibilities. “Participation ideas” prioritizes service-hour pathways, useful benefits and learning. “Most people” orders by the number of matching profiles; “Closest match” first counts profiles with at least two matching themes, then total people. Funding &amp; support includes grants, fellowships, funded partnerships, in-kind and employer leads; it does not rank projected income. The separately sourced Microsoft policy is checked against the linked official material; eligibility is still unconfirmed. These are illustrative records and candidate leads. Current terms, eligibility, funding and people’s interest in taking part still need confirmation.</p></details></div>`;
  }
  function openConnectionPeople(id) {
    const record=list().find(record=>record.id===id);if(id==='o12'){open(id);return;}const item=connections().find(item=>item.id===id);if(!item||!record)return;
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
    if(record.id==='o12'){
      api.openDialog('Employer support lead', `<div class="opp-sheet"><h2 id="dialog-title">${e(record.title)}</h2><p class="lead">${e(record.description)}</p><p class="source-note">Public policy checked 24 October 2026. This is an employee engagement route; Microsoft’s guide says it does not accept unsolicited grant or event-sponsorship requests.</p>${accordion('What to confirm', `<ul class="opp-checks">${record.requirements.map(value=>`<li>${api.icon('info')}<span>${e(value)}</span></li>`).join('')}</ul>`)}${accordion('A practical route in', `<ol class="step-list">${record.steps.map(value=>`<li>${e(value)}</li>`).join('')}</ol>`)}<div class="dialog-actions">${saveButton(record,true)}<a class="button" href="${e(record.sourceUrl)}" target="_blank" rel="noopener noreferrer">Read the policy ${api.icon('external')}</a><a class="button" href="${e(record.guideUrl)}" target="_blank" rel="noopener noreferrer">Nonprofit guide ${api.icon('external')}</a></div></div>`);return;
    }
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
      else if (button.hasAttribute('data-opp-discuss')) {const item=connections().find(item=>item.id===button.dataset.oppDiscuss),record=list().find(record=>record.id===button.dataset.oppDiscuss);if(item&&record)window.RootsChat.setPrompt(`Help me shape this proposed activity: ${participationPlans[item.id]?.activity||record.benefit} Use ${record.title} for the ${item.peopleCount} people whose stated interests connect. Explain who could benefit or take part, what to ask them, and the provider terms to verify. Do not assume eligibility, funding or participation, and do not send messages.`);}
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
      view.order=['participation','reach','closest'].includes(event.target.value)?event.target.value:'participation';view.connectionLimit=3;api.render();document.getElementById('opp-order')?.focus();
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
