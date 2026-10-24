const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const numberValue = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;

export const opportunities = [
  {
    id: 'ava', name: 'Ava Community Energy', category: 'funding', amount: 'Up to $2,500', status: 'Sponsorship',
    description: 'Support for a community project that connects people with a cleaner, healthier future.',
    detail: 'The published community sponsorship window is September–November. Confirm the current intake, applicant or fiscal sponsor eligibility, and eligible costs before building a request.',
    link: 'https://avaenergy.org/community/grants-sponsorships/community-sponsorships/',
    initials: 'Av', note: 'A project funding route, subject to eligibility and approval.'
  },
  {
    id: 'microsoft', name: 'Microsoft volunteer matching', category: 'funding', amount: '$25 / eligible hour', status: 'Employee benefit',
    description: 'An eligible employee’s volunteer time can generate a contribution to an approved organization.',
    detail: 'Microsoft’s Reno community page describes a $25 contribution per eligible volunteer hour. Recipient organization approval, employee eligibility, claims, and program limits must be confirmed. The contribution goes to the organization.',
    link: 'https://www.microsoft.com/en-us/reno/community-involvement',
    initials: 'M', note: 'Potential matching support; recipient eligibility is unconfirmed.'
  },
  {
    id: 'college', name: 'Berkeley College Corps', category: 'funding', amount: 'Up to $10,000', status: 'Student service',
    description: 'Selected students can receive financial support while completing 450 hours of service.',
    detail: 'Support is for selected students completing 450 hours, not a grant paid to the project. A Guild placement would require approval and a hosting agreement with the campus program.',
    link: 'https://publicservice.berkeley.edu/programs/collegecorps/',
    initials: 'CC', note: 'A possible student placement route; hosting approval is required.'
  },
  {
    id: 'santa-cruz', name: 'Santa Cruz Permaculture', category: 'learning', amount: '$1,395 tuition value', status: 'Internship',
    description: 'An internship includes a full tuition waiver for the Permaculture Design Certificate.',
    detail: 'The published tuition value is $1,395. The internship requires a yearlong fall, winter, and spring commitment. The advertised start was October 3, 2026; check the next available intake directly.',
    link: 'https://santacruzpermaculture.com/internships/',
    initials: 'SC', note: 'A benefit of their internship, with a substantial time commitment.'
  },
  {
    id: 'berkeley-food', name: 'Berkeley Student Food Collective', category: 'learning', amount: '10% purchase discount', status: 'Cooperative membership',
    description: 'Volunteer at a community food cooperative and take part in its member-led work.',
    detail: 'Membership is open to everyone, not only students. The collective describes two volunteer hours per week plus committee work, with a 10% discount on purchases. This benefit applies only within its own program.',
    link: 'https://www.foodcollective.org/membership',
    initials: 'BF', note: 'A recurring commitment at the collective; not a Roots-wide benefit.'
  }
];

export const people = [
  {
    id: 'alex', name: 'Alex', category: 'Gardening · Composting', amount: '', status: 'Wants to mentor',
    description: 'An experienced gardener and composter who wants to share their skills.',
    detail: 'A possible workday lead and mentor for newer volunteers. Confirm availability and the support needed to guide a small group.',
    link: '', initials: 'AL', role: 'Suggested: workday lead'
  },
  {
    id: 'priya', name: 'Priya', category: 'GIS · Data', amount: '', status: 'Building environmental experience',
    description: 'Brings mapping and data skills to hands-on environmental work.',
    detail: 'A possible partner for a simple site map and project observations. Agree on a useful, manageable piece of work before the first session.',
    link: '', initials: 'PR', role: 'Suggested: mapping support'
  },
  {
    id: 'sam', name: 'Sam', category: 'Team volunteering', amount: '', status: 'Eligibility to confirm',
    description: 'An illustrative Microsoft employee contact exploring a team service day.',
    detail: 'A possible contact for a small employee team. Employer program eligibility, recipient approval, and any matching contribution remain unconfirmed.',
    link: '', initials: 'SA', role: 'Suggested: team contact'
  }
];

const icon = (initials) => `<span class="record-icon" aria-hidden="true">${escapeHtml(initials)}</span>`;
const heading = (title, description) => `<header class="page-heading"><h1>${title}</h1><p>${description}</p></header>`;
const sourceLink = (opportunity) => `<a class="btn-text" href="${escapeHtml(opportunity.link)}" target="_blank" rel="noopener noreferrer">View official program <span aria-hidden="true">↗</span></a>`;
const demoNote = '<p class="record-meta">Illustrative workspace · Program notes reflect the supplied October 24, 2026 brief. Confirm current terms with each program.</p>';
const savedIds = (state) => Array.isArray(state.saved) ? state.saved : [];

function saveButton(opportunity, state) {
  const saved = savedIds(state).includes(opportunity.id);
  return `<button class="btn${saved ? '' : ' btn-primary'}" data-action="save-opportunity" data-id="${opportunity.id}" aria-pressed="${saved}">${saved ? 'Added to plan' : 'Add to plan'}</button>`;
}

function opportunityRow(opportunity, state, compact = false) {
  return `<article class="record-row">
    ${icon(opportunity.initials)}
    <div class="record-body">
      <div class="record-title"><button class="btn-text" data-action="opportunity" data-id="${opportunity.id}">${escapeHtml(opportunity.name)}</button></div>
      <p>${escapeHtml(opportunity.description)}</p>
      <div class="record-meta"><span class="status${opportunity.category === 'funding' ? ' green' : ' warm'}">${escapeHtml(opportunity.status)}</span> <span>${escapeHtml(opportunity.note)}</span></div>
    </div>
    <div class="record-end"><span class="amount">${escapeHtml(opportunity.amount)}</span>${compact ? '' : saveButton(opportunity, state)}</div>
  </article>`;
}

function filters(state) {
  return `<div class="filter-tabs" aria-label="Filter opportunities">${[['all', 'All opportunities'], ['funding', 'Funding'], ['learning', 'Learning & benefits']].map(([id, label]) => `<button data-action="filter" data-id="${id}" aria-pressed="${(state.filter || 'all') === id}">${label}</button>`).join(' ')}</div>`;
}

function opportunityList(state) {
  const search = String(state.search || '').trim().toLowerCase();
  const filtered = opportunities.filter((opportunity) => ((state.filter || 'all') === 'all' || opportunity.category === state.filter) && `${opportunity.name} ${opportunity.description} ${opportunity.amount}`.toLowerCase().includes(search));
  return `<div class="toolbar">${filters(state)}<input class="input" id="opportunity-search" type="search" aria-label="Find an opportunity" placeholder="Search opportunities" value="${escapeHtml(state.search)}" autocomplete="off"></div>
    <div class="list">${filtered.length ? filtered.map((opportunity) => opportunityRow(opportunity, state)).join('') : '<div class="empty-state"><h3>No matching opportunities</h3><p>Try another search or choose All opportunities.</p></div>'}</div>`;
}

function goals(state) {
  return `<div class="goal-tabs" aria-label="Your volunteer goal">${[['earn', 'Earn support'], ['learn', 'Learn a skill'], ['save', 'Save on essentials']].map(([id, label]) => `<button data-action="goal" data-id="${id}" aria-pressed="${(state.goal || 'earn') === id}">${label}</button>`).join(' ')}</div>`;
}

function opportunitiesView(state) {
  return `${heading('Good work starts here.', 'Find the support, people, and practical next steps to bring a community project to life.')}
    <div class="two-column"><section aria-label="Available opportunities">
      ${opportunityList(state)}
    </section><aside class="context-panel">
      <h2>One project. A few good connections.</h2><p>Start with the work you want to do. Add promising opportunities to your plan, then check the fit together.</p>
      <div class="divider"></div><h3>Your project</h3><p>${escapeHtml(state.projectName || 'Neighborhood regeneration skills series')}</p>
      <p class="record-meta">${savedIds(state).length} ${savedIds(state).length === 1 ? 'opportunity' : 'opportunities'} saved</p>
      <a class="btn btn-primary" href="#/workspace/project">Open project plan <span aria-hidden="true">→</span></a>
      <div class="divider"></div><h3>A note on the benefits</h3><p>Some programs fund organizations. Others support students, employees, or participants in a specific program. Each has its own requirements.</p>
    </aside></div>${demoNote}`;
}

const budget = [['Tools & materials', 700], ['Plants & soil', 500], ['Facilitation', 600], ['Participation support', 400], ['Documentation & outreach', 300]];
const projectChecks = [
  ['scope', 'Agree on a useful, manageable project'],
  ['sponsor', 'Confirm the applicant or fiscal sponsor'],
  ['eligibility', 'Check program eligibility and current terms'],
  ['roles', 'Match volunteers with clear roles'],
  ['permission', 'Confirm permission to use the site'],
  ['supervision', 'Confirm on-site supervision']
];

function checklist(items, stateChecks, action) {
  return `<div class="list">${items.map(([id, label, duration, description]) => duration
    ? `<div class="build-row"><input id="build-${id}" type="checkbox" data-action="${action}" data-id="${id}"${stateChecks?.[id] ? ' checked' : ''}><div class="record-body"><label for="build-${id}">${escapeHtml(label)}</label>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div><span class="duration">${escapeHtml(duration)}</span></div>`
    : `<label class="checkbox-row"><input type="checkbox" data-action="${action}" data-id="${id}"${stateChecks?.[id] ? ' checked' : ''}><span class="record-body">${escapeHtml(label)}</span></label>`).join('')}</div>`;
}

function calculator(state) {
  const employees = numberValue(state.employees, 6);
  const hours = numberValue(state.hours, 3);
  return `<section class="calculator"><h3>What could a team contribute?</h3><p>Explore the potential of eligible employee volunteer hours.</p>
    <div class="calculator-fields"><div class="field"><label for="employees">Employees</label><input class="input" id="employees" type="number" min="0" max="1000" step="1" value="${escapeHtml(employees)}" inputmode="numeric"></div>
    <div class="field"><label for="hours">Hours each</label><input class="input" id="hours" type="number" min="0" max="1000" step="0.5" value="${escapeHtml(hours)}" inputmode="decimal"></div></div>
    <output id="match-total" class="calculator-result" for="employees hours" aria-live="polite">${money(employees * hours * 25)}</output><p>Potential contribution at $25 per eligible hour.</p>
    <p>Paid to an approved organization, subject to employee eligibility, claims, and program limits. This is an estimate.</p></section>`;
}

function projectView(state) {
  const selected = opportunities.filter((opportunity) => savedIds(state).includes(opportunity.id));
  return `${heading('Make room for good work.', 'A practical draft for a small project, with the funding and people it may need.')}
    <div class="two-column"><div>
      <section><div class="section-heading"><h2>Your project</h2><span class="status warm">Local draft</span></div>
        <div class="field"><label for="project-name">Project name</label><input class="input" id="project-name" value="${escapeHtml(state.projectDraft ?? state.projectName ?? 'Neighborhood regeneration skills series')}" maxlength="140"></div>
        <button class="btn" data-action="save-project">Save project name</button>
        <p>A proposed series of practical sessions in planting, soil care, and neighborhood regeneration. Scope, location, and partners are still to be confirmed.</p>
      </section><div class="divider"></div>
      <section><div class="section-heading"><h2>Opportunities in your plan</h2><a class="btn-text" href="#/workspace/opportunities">Browse opportunities <span aria-hidden="true">→</span></a></div>
        <div class="list">${selected.length ? selected.map((opportunity) => opportunityRow(opportunity, state)).join('') : '<div class="empty-state"><p>Your plan has room to grow.</p><p>Add a promising program from Opportunities to keep it here.</p><a class="btn" href="#/workspace/opportunities">Find an opportunity</a></div>'}</div>
      </section><div class="divider"></div>
      <section class="team-preview"><div class="section-heading"><h2>Suggested people</h2><a class="btn-text" href="#/dashboard/people">View community</a></div><div class="list">${people.map(person => personRow(person, state, true)).join('')}</div><p class="small-note">Fictional profiles · Availability and commitments to confirm.</p><button class="btn" data-action="invite" aria-expanded="${Boolean(state.invite)}">${state.invite ? 'Close invitation preview' : 'Preview invitation'}</button>${state.invite ? '<div class="invitation"><h3>A draft for your potential team</h3><p>We’re planning a three-hour planting and soil-care workday. Would you be interested in helping, sharing a skill, or learning alongside the group?</p><p>Let us know what you would enjoy doing and when you might be available. We’ll confirm the date, site, and supervision before asking for a commitment.</p><p class="small-note">Preview only. No message has been sent.</p></div>' : ''}</section><div class="divider"></div>
      <section><div class="section-heading"><h2>A starting budget</h2><span class="record-meta">Illustrative</span></div>
        <table class="data-table"><caption class="record-meta">Example allocation for a $2,500 project</caption><thead><tr><th scope="col">Item</th><th scope="col">Amount</th></tr></thead><tbody>${budget.map(([label, amount]) => `<tr><th scope="row">${label}</th><td>${money(amount)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">Total</th><td>${money(2500)}</td></tr></tfoot></table>
        <p class="record-meta">This draft is not a statement of eligible costs. Confirm each line with the funding program.</p>
      </section>
    </div><aside class="context-panel"><h2>A little preparation goes a long way.</h2>${checklist(projectChecks, state.checks, 'check')}<p class="readiness-note">Site permission: ${state.checks?.permission ? 'marked confirmed' : 'pending'}. Supervision: ${state.checks?.supervision ? 'marked confirmed' : 'pending'}. Planning notes are local to this preview.</p><div class="divider"></div>${calculator(state)}</aside></div>${demoNote}`;
}

function volunteersView(state) {
  const goal = state.goal || 'earn';
  const selected = goal === 'learn' ? opportunities.filter((opportunity) => opportunity.id === 'santa-cruz') : goal === 'save' ? opportunities.filter((opportunity) => opportunity.id === 'berkeley-food') : opportunities.filter((opportunity) => ['college', 'microsoft'].includes(opportunity.id));
  const copy = {
    earn: ['Support that can follow your service.', 'Some programs support selected students; employee matching can support an approved organization. Neither is a general wage for volunteering.'],
    learn: ['Learn by doing something useful.', 'Look for a structured role, a clear commitment, and someone who can help you develop your skills.'],
    save: ['Small benefits, with clear commitments.', 'A cooperative’s benefits belong to its own membership program. Check the commitment before deciding it fits your week.']
  }[goal] || ['Find your next step.', 'Explore a program that fits your interests and available time.'];
  return `${heading('Bring what you know. Learn something new.', 'Make a useful contribution, meet people, and find a next step that fits your life.')}
    ${goals(state)}<div class="two-column subsection"><section><div class="section-heading"><h2>${copy[0]}</h2></div><p>${copy[1]}</p>
      <div class="list">${selected.map((opportunity) => opportunityRow(opportunity, state)).join('')}</div>
    </section><aside class="context-panel"><h2>A place to begin</h2><h3>Planting & soil-care workday</h3><p>A proposed three-hour session with practical roles for first-time volunteers and experienced growers.</p><p class="record-meta">Date and site to confirm · Illustrative event</p><a class="btn btn-primary" href="#/dashboard/events">Explore the workday <span aria-hidden="true">→</span></a><div class="divider"></div><h3>Come with a question</h3><p>What would you like to learn? How much time can you comfortably give? A useful role should work for you, too.</p><section class="workshop-note"><span class="status warm">Proposed partnership</span><h3>Sponsored workshop places</h3><p>A possible free training place attached to a recurring Guild role. A provider, funding, and eligibility would need to be agreed. This benefit is not yet available.</p></section></aside></div>${demoNote}`;
}

const buildTasks = [
  ['foundation', 'Establish the foundation', '2 hours', 'Confirm the Garden Steward Vue/Strapi repository, applicant assumptions, reviewed sources, and fictional profiles.'],
  ['matching', 'Make opportunity matching useful', '2 hours', 'Show pass, fail, and unknown conditions alongside the evidence and intended recipient.'],
  ['workspace', 'Connect the project workspace', '2.5 hours', 'Carry one opportunity through a project, team, and readiness checklist.'],
  ['participant', 'Make participant value clear', '2 hours', 'Explain benefits, preview an invitation, and connect approved attendance with a next visit.'],
  ['delivery', 'Verify and deliver', '3.5 hours', 'Test eligibility and the matching calculator, rehearse the complete journey, and package the result.']
];

function buildView(state) {
  const done = buildTasks.filter(([id]) => state.buildChecks?.[id]).length;
  return `${heading('One complete journey. Twelve focused hours.', 'A software hackathon plan for taking Roots from a promising opportunity to a useful participant experience.')}
    <div class="two-column"><section><div class="section-heading"><h2>The build plan</h2><span class="record-meta">${done} of ${buildTasks.length} steps complete</span></div>
      ${checklist(buildTasks, state.buildChecks, 'build-check')}
      <p class="record-meta">Time estimates are illustrative. Progress is saved only in this browser.</p>
      <div class="divider"></div><h2>Rehearse the whole journey.</h2><p>Find an opportunity, understand its conditions, shape a project, connect a team, and show a participant why returning could be worthwhile.</p>
      <a class="btn btn-primary" href="#/workspace/opportunities">Start with an opportunity <span aria-hidden="true">→</span></a>
    </section><aside class="context-panel"><h2>A clear scope for the day.</h2><p>Build one complete journey with reviewed program information and fictional community records.</p><div class="divider"></div><h3>Keep the evidence visible</h3><p>Show who receives a benefit, what is confirmed, and what still requires approval.</p><div class="divider"></div><h3>A useful finish</h3><p>Working interactions, clear eligibility conditions, a verified calculator, and a packaged demonstration.</p><span class="status warm">12-hour hackathon plan</span></aside></div>${demoNote}`;
}

function personRow(person, state, compact = false) {
  const expanded = state.expandedPerson === person.id;
  return `<article class="record-row"><span class="avatar ${person.id}" aria-hidden="true">${person.initials}</span><div class="record-body"><div class="record-title"><button class="btn-text" data-action="person" data-id="${person.id}" aria-expanded="${expanded}" aria-controls="person-detail-${person.id}">${person.name}</button></div><p>${escapeHtml(person.category)}</p><div class="record-meta">${escapeHtml(compact ? person.role : person.status)}</div>${expanded ? `<div class="inline-detail" id="person-detail-${person.id}"><p>${escapeHtml(person.detail)}</p><p class="record-meta">Fictional profile for this preview. Availability has not been confirmed.</p></div>` : `<div id="person-detail-${person.id}" hidden></div>`}</div>${compact ? '' : `<span class="status">${escapeHtml(person.role.replace('Suggested: ', ''))}</span>`}</article>`;
}

function eventRow(state, compact = false) {
  return `<article class="record-row">${icon('↗')}<div class="record-body"><h3 class="record-title">Planting & soil-care workday</h3><p>Three hours of practical work, shared learning, and getting to know the people nearby.</p><p class="record-meta">Proposed · Date and site to confirm</p>${compact ? '' : '<p>Potential roles include planting, preparing soil, welcoming participants, and capturing observations. Activities and accessibility details will be confirmed with a host.</p>'}</div>${compact ? '<a class="btn" href="#/dashboard/events">View workday</a>' : `<button class="btn${state.rsvp ? '' : ' btn-primary'}" data-action="event-rsvp" aria-pressed="${Boolean(state.rsvp)}">${state.rsvp ? 'Interest noted' : 'I’m interested'}</button>`}</article>`;
}

function overviewView(state) {
  return `${heading('Good people. New possibilities.', 'A little coordination can turn shared interests into something useful.')}
    <p class="inline-summary"><span><strong>35</strong> volunteers</span><span><strong>42%</strong> return rate</span><span><strong>6</strong> opportunities</span></p><p class="small-note">Illustrative overview</p>
    <section class="feature"><div><span class="status green">Ava Community Energy</span>
      <h2>A little support for your next community project.</h2><p>Explore community sponsorship and check the current application window. Your project will need an eligible applicant or fiscal sponsor.</p>
      <button class="btn btn-primary" data-action="opportunity" data-id="ava">Explore Ava sponsorship <span aria-hidden="true">→</span></button> <a class="btn-text" href="#/workspace/project">Open your project plan</a>
    </div><div class="feature-side"><span class="amount">Up to $2,500</span><small>Subject to eligibility and approval</small></div></section>
    <div class="two-column"><section><div class="section-heading"><h2>Something to gather around</h2><a class="btn-text" href="#/dashboard/events">All events</a></div><div class="list">${eventRow(state, true)}</div>
      <div class="divider"></div><h2>A few next steps</h2>${checklist(projectChecks.slice(0, 3), state.checks, 'check')}
    </section><aside class="context-panel"><div class="section-heading"><h2>People to connect</h2><a class="btn-text" href="#/dashboard/people">View all</a></div><div class="list">${people.map((person) => personRow(person, state, true)).join('')}</div><p class="record-meta">Suggested connections from fictional profiles.</p></aside></div>${demoNote}`;
}

function peopleView(state) {
  const search = String(state.peopleSearch || '').trim().toLowerCase();
  const filtered = people.filter((person) => `${person.name} ${person.category} ${person.description} ${person.role}`.toLowerCase().includes(search));
  return `${heading('There’s a person behind every possibility.', 'Find complementary skills, make a thoughtful introduction, and give people a clear way to help.')}
    <div class="two-column"><section><div class="section-heading"><h2>Your community</h2><button class="btn" data-action="invite" aria-expanded="${Boolean(state.invite)}" aria-controls="invitation-draft">${state.invite ? 'Close invitation' : 'Draft an invitation'}</button></div>
      ${state.invite ? `<div id="invitation-draft" class="invitation"><h3>An invitation to shape together</h3><p>We’re exploring a neighborhood planting and soil-care workday. If you’d like to share a skill, learn alongside others, or help organize, we’d love to hear what interests you.</p><p>We’ll confirm the date, site, activities, and access details before asking for a commitment.</p><p class="record-meta">Local draft only. No invitation has been sent.</p></div>` : '<div id="invitation-draft" hidden></div>'}
      <div class="field"><label for="people-search">Find a person or skill</label><input class="input" id="people-search" type="search" placeholder="Search names, interests, or skills" value="${escapeHtml(state.peopleSearch)}" autocomplete="off"></div>
      <div class="list">${filtered.length ? filtered.map((person) => personRow(person, state)).join('') : '<div class="empty-state"><h3>No matching people</h3><p>Try a name or a broader skill, such as gardening or data.</p></div>'}</div>
      <p class="record-meta">Showing ${filtered.length} fictional ${filtered.length === 1 ? 'profile' : 'profiles'} from the illustrative community.</p>
    </section><aside class="context-panel"><h2>Useful roles beat vague requests.</h2><p>A good invitation makes the work, time commitment, and support clear.</p><div class="divider"></div><h3>For the first workday</h3><div class="list"><p>Someone to guide the practical work.</p><p>Someone to welcome new people.</p><p>Someone to notice and document what changes.</p></div><div class="divider"></div><p class="record-meta">Ask about availability and interests before assigning a role.</p></aside></div>${demoNote}`;
}

function fundingView(state) {
  return `${heading('Support the work you want to do.', 'Explore funding, service programs, and practical benefits with their conditions in view.')}
    <div class="two-column"><section>${opportunityList(state)}</section><aside class="context-panel"><h2>Know where the support goes.</h2><div class="list"><div><h3>Project funding</h3><p>Ava sponsorship may support an eligible community project.</p></div><div><h3>Organization support</h3><p>Employee volunteer matching may contribute to an approved recipient organization.</p></div><div><h3>Participant benefits</h3><p>College Corps, internships, and cooperative memberships support participants under their own terms.</p></div></div><div class="divider"></div>${calculator(state)}</aside></div>${demoNote}`;
}

function eventsView(state) {
  return `${heading('Make a little time for something good.', 'Start with one manageable gathering and a clear purpose.')}
    <div class="two-column"><section><div class="section-heading"><h2>Taking shape</h2><span class="status warm">Proposed event</span></div><div class="list">${eventRow(state)}</div>
      ${state.rsvp ? '<p role="status">Your interest is noted in this preview. A date, site, and host still need to be confirmed.</p>' : ''}
      <p class="record-meta">Interest is stored locally. This does not register you for a real event or send a message.</p>
      <div class="divider"></div><h2>What three hours could look like</h2><div class="list"><div class="record-row"><span class="record-meta">30 min</span><div class="record-body"><h3>Arrive and get oriented</h3><p>Meet the group, discuss the site, and choose a role.</p></div></div><div class="record-row"><span class="record-meta">2 hours</span><div class="record-body"><h3>Learn through practical work</h3><p>Plant and care for soil with guidance, breaks, and room for questions.</p></div></div><div class="record-row"><span class="record-meta">30 min</span><div class="record-body"><h3>Leave things well</h3><p>Clean up together and share what you learned.</p></div></div></div>
    </section><aside class="context-panel"><h2>Details before commitment.</h2><p>The host should confirm the location, access needs, tools, weather arrangements, and any relevant participation requirements.</p><div class="divider"></div><h3>Could a team join?</h3><p>Possibly. Start by agreeing on a useful group size and roles. Any employee matching contribution requires a separate eligibility check.</p><a class="btn" href="#/dashboard/funding">Explore program support <span aria-hidden="true">→</span></a></aside></div>${demoNote}`;
}

export function renderView(mode, page, state = {}) {
  const workspaceViews = { opportunities: opportunitiesView, project: projectView, volunteers: volunteersView, build: buildView };
  const dashboardViews = { overview: overviewView, people: peopleView, funding: fundingView, events: eventsView };
  const views = mode === 'dashboard' ? dashboardViews : workspaceViews;
  const fallback = mode === 'dashboard' ? overviewView : opportunitiesView;
  return (views[page] || fallback)(state);
}
