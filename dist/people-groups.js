/* People groups connect recorded interests, participation and shared personal context. */
((root) => {
  'use strict';

  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  const validCount = value => Number.isSafeInteger(value) && value >= 0;
  const validHours = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const DEMO_CONTEXT = 'Fictional demo scenario';
  const groupOrder = (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'en');
  const thoughts = {
    'community gardening':'What would this group like to grow, learn or share? Ask before choosing a session or project; a broad interest can mean different things to different people.',
    'service hours':'Ask what experience or hours people need before shaping a recurring service pathway.',
    'composting':'A practical composting session could bring this group together around a shared project.',
    'community outreach':'Ask whether people would like to help welcome volunteers or tell the community’s story.',
    'native plants':'A planting or habitat session could turn this shared interest into something practical.',
    'data analysis':'A clearly scoped reporting task could offer a useful place to apply this interest.',
    'environmental education':'Ask what people would like to learn or share in a community learning session.',
    'food recovery':'A regular harvest or food-sharing session could give this interest a common purpose.'
  };

  function records(values) {
    const result = new Map();
    for (const value of Array.isArray(values) ? values : []) {
      if (!isRecord(value) || !text(value.id) || result.has(value.id)) continue;
      result.set(value.id, value);
    }
    return result;
  }

  function interestLabels(values) {
    const result = new Map();
    for (const value of Array.isArray(values) ? values : []) {
      const label = text(value);
      if (label && !result.has(label.toLowerCase())) result.set(label.toLowerCase(), label);
    }
    return result;
  }

  function contextValue(original, profile, field) {
    const source = profile.personContextSource;
    if (isRecord(source) && Object.prototype.hasOwnProperty.call(source, field)) {
      const supported = ['Locally recorded', 'Recorded in profile'].includes(source[field]) || source[field] === DEMO_CONTEXT && original.contextSource === DEMO_CONTEXT;
      return supported ? profile[field] : null;
    }
    return original[field];
  }

  const recordedContext = (original, profile, field) => text(contextValue(original, profile, field));

  function compute(state, leads, profileAdapter) {
    const people = [], interestGroups = new Map(), ageGroups = new Map();
    const participation = [
      {id:'participation-one', label:'One recorded visit', nextThought:'Ask what would make another visit useful or enjoyable; the total alone does not tell us when someone last attended.'},
      {id:'participation-repeat', label:'More than one visit', nextThought:'Ask what people would like to do next, before suggesting a new role or a larger commitment.'},
      {id:'participation-zero', label:'No recorded visits', nextThought:'A simple conversation about interests and availability could help shape a first invitation.'},
      {id:'participation-unknown', label:'Visits not recorded', nextThought:'Check the attendance record before making assumptions about participation.'}
    ].map(group => ({...group, count:0, personIds:[], opportunityIds:[]}));
    const coverage = {people:0, interests:0, visits:0, ageGroups:0, students:0, employers:0, targets:0, demoContext:0};
    for (const [id, original] of records(isRecord(state) ? state.people : null)) {
      let profile = original;
      if (typeof profileAdapter === 'function') {
        try {
          const supplied = profileAdapter({...original, ...(Array.isArray(original.interests) ? {interests:[...original.interests]} : {})});
          if (isRecord(supplied)) profile = {...original, ...supplied};
        } catch { /* Keep the direct record when profile enrichment is unavailable. */ }
      }
      const interests = interestLabels(profile.interests);
      // Explicit source values (including labelled demo context) or local edits
      // are allowed. Unattributed enrichment must never invent demographics.
      const ageGroup = recordedContext(original, profile, 'ageGroup') || recordedContext(original, profile, 'ageBand');
      const visits = profile.visits;
      const name = text(original.name) || 'Unnamed person';
      const studentStatus = recordedContext(original, profile, 'studentStatus');
      const employer = recordedContext(original, profile, 'employer');
      const target = profile.serviceHours?.targetSource === 'Locally recorded' && validHours(profile.serviceHours.target) && profile.serviceHours.target > 0 ? profile.serviceHours.target : null;
      const educationLevel = studentStatus === 'Student' ? recordedContext(original, profile, 'educationLevel') : '';
      const fullTime = studentStatus === 'Student' ? contextValue(original, profile, 'fullTime') === true : false;
      const weeklyCapacity = contextValue(original, profile, 'weeklyHoursAvailable');
      const requirement = studentStatus === 'Student' ? contextValue(original, profile, 'serviceRequirementHours') : null;
      const demoContext = original.contextSource === DEMO_CONTEXT;
      people.push({id, name, initials:text(original.initials) || name.split(' ').slice(0, 2).map(part => part[0]).join(''), color:text(original.color) || 'sage', interests:[...interests.values()], visits, hours:validHours(original.hours) ? original.hours : null, availability:text(profile.availability), studentStatus, employer, target, educationLevel, fullTime, school:recordedContext(original, profile, 'school'), weeklyHoursAvailable:validHours(weeklyCapacity) ? weeklyCapacity : null, serviceRequirementHours:validHours(requirement) && requirement > 0 ? requirement : null, demoContext});
      coverage.people++;
      if (interests.size) coverage.interests++;
      if (validCount(visits)) coverage.visits++;
      if (ageGroup) coverage.ageGroups++;
      if (studentStatus === 'Student') coverage.students++;
      if (employer) coverage.employers++;
      if (target !== null) coverage.targets++;
      if (demoContext) coverage.demoContext++;
      for (const [key, label] of interests) {
        if (!interestGroups.has(key)) interestGroups.set(key, {id:`interest-${encodeURIComponent(key)}`, label, count:0, personIds:[], opportunityIds:[], nextThought:thoughts[key] || `Ask what people would like to do with their shared interest in ${label.toLowerCase()}.`});
        const group = interestGroups.get(key);
        group.count++; group.personIds.push(id);
      }
      const visitGroup = participation[!validCount(visits) ? 3 : visits === 0 ? 2 : visits === 1 ? 0 : 1];
      visitGroup.count++; visitGroup.personIds.push(id);
      if (ageGroup) {
        const key = ageGroup.toLowerCase();
        if (!ageGroups.has(key)) ageGroups.set(key, {id:`age-${encodeURIComponent(key)}`, label:ageGroup, count:0, personIds:[], opportunityIds:[], nextThought:'Ask people what would make participation work for them; a shared age range does not imply shared needs.'});
        const group = ageGroups.get(key);
        group.count++; group.personIds.push(id);
      }
    }
    const relatedLeads = [];
    for (const [id, lead] of records(leads)) {
      if (!text(lead.title)) continue;
      relatedLeads.push({id, title:text(lead.title)});
      for (const key of interestLabels(lead.interests).keys()) {
        if (interestGroups.has(key)) interestGroups.get(key).opportunityIds.push(id);
      }
    }
    const service = interestGroups.get('service hours');
    const goalGroup = (id, label, members, description, nextThought, opportunityIds = []) => ({id, label, count:members.length, personIds:members.map(person => person.id), description, nextThought, opportunityIds:opportunityIds.filter(id => relatedLeads.some(lead => lead.id === id))});
    const servicePeople = people.filter(person => service?.personIds.includes(person.id));
    const firstPeople = people.filter(person => person.visits === 1);
    const students = people.filter(person => person.studentStatus === 'Student');
    const schoolStudents = students.filter(person => person.educationLevel === 'secondary' && person.serviceRequirementHours !== null);
    const undergraduates = students.filter(person => person.educationLevel === 'undergraduate');
    const otherStudents = students.filter(person => !schoolStudents.includes(person) && !undergraduates.includes(person));
    const employed = people.filter(person => person.employer);
    const employedIds = new Set(employed.map(person => person.id));
    const employerRoutes = [...records(leads).values()].filter(lead => lead.matchKind === 'employer'
      && Array.isArray(lead.matches) && lead.matches.some(match => employedIds.has(match?.personId))).map(lead => lead.id);
    const targets = people.filter(person => person.target !== null);
    const goals = [
      {...goalGroup('goal-school', 'School students with service goals', schoolStudents, `${schoolStudents.length} secondary-school students have a service-hour requirement in their profile.`, 'Build a school-approved programme of supervised garden shifts. Agree safeguarding, attendance sign-off and which hours count before offering places.', ['o05']), contextFacts:[['Service-hour goals', `${schoolStudents.reduce((total, person) => total + person.serviceRequirementHours, 0)} h total`], ['Weekly capacity', `${schoolStudents.reduce((total, person) => total + (person.weeklyHoursAvailable ?? 0), 0)} h combined`]]},
      {...goalGroup('goal-undergraduates', 'Undergraduates to connect with funded pathways', undergraduates, `${undergraduates.length} undergraduates · ${undergraduates.filter(person => person.fullTime).length} full-time · ${new Set(undergraduates.map(person => person.school).filter(Boolean)).size} campuses.`, 'Explore a College Corps host partnership with the participating campuses. Match a supervised role to study schedules, then check individual eligibility and the next placement cycle.', ['o01']), contextFacts:[['At least 12 h / week', `${undergraduates.filter(person => person.weeklyHoursAvailable >= 12).length} people`], ['Full-time students', `${undergraduates.filter(person => person.fullTime).length} people`]]},
      goalGroup('goal-return', 'A reason to come back', firstPeople, `${firstPeople.length} ${firstPeople.length === 1 ? 'person has' : 'people have'} one recorded visit.`, 'Ask what they enjoyed and what would make a next visit worthwhile. A visit total does not tell us when someone attended or whether they plan to return.'),
      goalGroup('goal-students', 'Students shaping their next step', otherStudents, `${otherStudents.length} ${otherStudents.length === 1 ? 'person has' : 'people have'} student status recorded; education and requirements need more detail.`, 'Explore a project that connects with their learning or service goals, then confirm school approval and supervision.', ['o01', 'o05']),
      goalGroup('goal-employers', 'Connections through work', employed, `${employed.length} ${employed.length === 1 ? 'person has' : 'people have'} an employer recorded.`, 'Ask whether they want to explore a team activity, volunteer time or matching gifts through work. An employer name does not establish a benefit.', employerRoutes),
      goalGroup('goal-targets', 'Recorded hour goals to plan around', targets, `${targets.length} ${targets.length === 1 ? 'person has' : 'people have'} a locally recorded service-hour target.`, 'Agree a manageable schedule and how hours will be verified. Recorded totals do not establish approved progress toward a school requirement.', ['o05']),
      goalGroup('goal-service', 'An interest in service hours', servicePeople, `${servicePeople.length} ${servicePeople.length === 1 ? 'person lists' : 'people list'} service hours as an interest.`, 'This is an interest rather than a confirmed requirement. Ask what experience and approval each person needs before planning a pathway.', service?.opportunityIds || [])
    ].filter(group => group.count);
    const groupStats = group => {
      const members = people.filter(person => group.personIds.includes(person.id));
      return {...group, demoContext:members.some(person => person.demoContext), stats:{
        hours:members.reduce((sum, person) => sum + (person.hours ?? 0), 0),
        hoursKnown:members.filter(person => person.hours !== null).length,
        oneVisit:members.filter(person => person.visits === 1).length,
        visitsKnown:members.filter(person => validCount(person.visits)).length,
        percent:coverage.people ? Math.round(group.count / coverage.people * 100) : 0,
        targetCount:members.filter(person => person.target !== null).length
      }};
    };
    return {
      people, leads:relatedLeads, coverage,
      goals:goals.map(groupStats),
      interests:[...interestGroups.values()].sort(groupOrder).map(groupStats),
      participation:participation.filter(group => group.count).map(groupStats),
      ageGroups:[...ageGroups.values()].sort(groupOrder).map(groupStats)
    };
  }

  let api = null, bound = false;
  const view = {tab:'groups', grouping:'goals', all:false, expanded:new Set()};
  const groupingNames = [['goals','Ways to take part'], ['interests','Interests'], ['participation','Participation'], ['ageGroups','Age groups']];
  const e = value => api.esc(value);
  const number = value => new Intl.NumberFormat('en-US', {maximumFractionDigits:1}).format(value);

  function clusterMarkup(members, group) {
    const visible = members.slice(0, 5), remaining = members.length - visible.length;
    return `<div class="people-cluster" role="group" aria-label="People in ${e(group.label)}">${visible.map(person => `<button type="button" data-people-group-person="${e(person.id)}" title="${e(person.name)}" aria-label="Open ${e(person.name)}’s profile">${api.avatar(person)}</button>`).join('')}${remaining ? `<button type="button" class="people-cluster-more" data-people-group-open="${e(group.id)}" aria-controls="people-details-${e(group.id)}" aria-expanded="${view.expanded.has(group.id)}" aria-label="See all ${group.count} people in ${e(group.label)}" title="See all ${group.count} people">+${remaining}</button>` : ''}</div>`;
  }

  function groupMarkup(group, result) {
    const members = group.personIds.map(id => result.people.find(person => person.id === id)).filter(Boolean);
    const leads = group.opportunityIds.map(id => result.leads.find(lead => lead.id === id)).filter(Boolean);
    const count = `${group.count} ${group.count === 1 ? 'person' : 'people'}`;
    const description = group.description || (view.grouping === 'interests' ? `${count} ${group.count === 1 ? 'lists' : 'list'} this interest.` : view.grouping === 'ageGroups' ? `${count} ${group.count === 1 ? 'has' : 'have'} this age range recorded.` : `${count} in the current records.`);
    const stats = group.stats;
    const facts = group.contextFacts || [['Recorded hours', stats.hoursKnown ? number(stats.hours) : '—'], ['With one visit', stats.visitsKnown ? stats.oneVisit : '—'], ...(stats.targetCount ? [['Recorded hour goals', stats.targetCount]] : [])];
    const demoLabel = group.demoContext && (view.grouping === 'ageGroups' || ['goal-school', 'goal-undergraduates', 'goal-students'].includes(group.id)) ? '<span class="people-example-label">Demo context</span>' : '';
    const coverageNote = [stats.hoursKnown < group.count ? `Hours recorded for ${stats.hoursKnown} of ${group.count}.` : '', stats.visitsKnown < group.count ? `Visits recorded for ${stats.visitsKnown} of ${group.count}.` : ''].filter(Boolean).join(' ');
    return `<article class="people-group"><div class="people-group-story"><h2>${e(group.label)}</h2>${demoLabel}<p class="people-group-description">${e(description)}</p><p class="people-group-thought">${e(group.nextThought)}</p>${group.label.toLowerCase() === 'community gardening' ? '<p class="people-group-qualification">This records who named the interest, not everyone who might enjoy gardening.</p>' : ''}</div><aside class="people-group-evidence" aria-label="People and recorded facts">${clusterMarkup(members, group)}<p class="people-group-count">${group.count} of ${result.coverage.people} people <span>· ${stats.percent}% of the community</span></p><dl class="people-group-stats">${facts.map(([label, value]) => `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>${coverageNote ? `<p class="people-group-coverage">${e(coverageNote)}</p>` : ''}</aside><details id="people-details-${e(group.id)}" class="people-group-details" data-people-group-id="${e(group.id)}"${view.expanded.has(group.id) ? ' open' : ''}><summary>See ${e(count)}${leads.length ? ' and related leads' : ''}${api.icon('chevron-down')}</summary><div class="people-group-expanded"><ul class="people-group-members">${members.map(person => `<li><button type="button" data-people-group-person="${e(person.id)}">${api.avatar(person)}<span><strong>${e(person.name)}</strong><small>${e(person.availability || 'Availability not recorded')}</small></span>${api.icon('arrow')}</button></li>`).join('')}</ul>${leads.length ? `<section class="people-group-leads"><h3>Possible next steps</h3><p>Leads to explore with this group. Participation and current program terms still need checking.</p><ul>${leads.map(lead => `<li><button type="button" data-people-group-lead="${e(lead.id)}"><span>${e(lead.title)}</span>${api.icon('arrow')}</button></li>`).join('')}</ul></section>` : ''}</div></details></article>`;
  }

  function groupsMarkup(result) {
    const groups = result[view.grouping];
    const visible = view.grouping === 'interests' && !view.all ? groups.slice(0, 4) : groups;
    let content = visible.map(group => groupMarkup(group, result)).join('');
    if (!groups.length) {
      content = view.grouping === 'ageGroups'
        ? '<p class="people-groups-empty">Age groups aren’t recorded yet. This view will use age ranges people choose to share.</p>'
        : view.grouping === 'interests'
          ? '<p class="people-groups-empty">There are no stated interests to group yet. Shared interests will appear here as people add them.</p>'
          : view.grouping === 'goals'
            ? '<p class="people-groups-empty">A shared goal starts with a conversation. Add interests or People context to a profile to find useful ways to take part.</p>'
            : '<p class="people-groups-empty">Add people to start exploring participation.</p>';
    }
    const note = view.grouping === 'goals'
      ? `Groups can overlap. ${result.coverage.demoContext ? 'Age, education, weekly capacity and school requirements are labelled fictional demo context. ' : ''}Use confirmed requirements and programme rules before making commitments.`
      : view.grouping === 'interests'
      ? `Groups use stated interests, so a person can appear in more than one. ${result.coverage.people - result.coverage.interests ? `${result.coverage.people - result.coverage.interests} ${result.coverage.people - result.coverage.interests === 1 ? 'person has' : 'people have'} no interests recorded. ` : ''}Fictional demo records.`
      : view.grouping === 'participation'
        ? 'These are total recorded visits, not a measure of recent attendance or retention. Fictional demo records.'
        : `Age ranges come from explicit profile context${result.coverage.demoContext ? ' and include fictional demo ages' : ''}.${groups.length && result.coverage.people > result.coverage.ageGroups ? ` ${result.coverage.people - result.coverage.ageGroups} ${result.coverage.people - result.coverage.ageGroups === 1 ? 'person has' : 'people have'} no age range recorded.` : ''}`;
    const missingContext = [!result.coverage.students ? 'Student' : '', !result.coverage.employers ? 'employer' : ''].filter(Boolean);
    const contextNote = view.grouping === 'goals' && missingContext.length ? `<p class="people-groups-context">${e(missingContext.join(' and '))} groups appear when people share that context. Open a profile and use <strong>People context</strong> to record it.</p>` : '';
    return `<div class="people-grouping-controls" role="group" aria-label="Group people by">${groupingNames.map(([id,label]) => `<button type="button" id="people-grouping-${id}" data-people-grouping="${id}" aria-pressed="${view.grouping === id}">${label}</button>`).join('')}</div><div class="people-group-list">${content}</div>${view.grouping === 'interests' && groups.length > 4 ? `<button type="button" class="people-groups-more" data-people-groups-all aria-expanded="${view.all}">${view.all ? 'Show fewer groups' : `Show all ${groups.length} groups`}</button>` : ''}${contextNote}<p class="people-groups-note">${e(note)}</p>`;
  }

  function render(renderEveryone) {
    const result = compute(api.getState(), root.RootsOpportunities?.list?.() || [], root.RootsPeople?.profileData);
    const everyone = view.tab === 'everyone';
    return `<section class="people-intelligence${everyone ? ' people-everyone' : ''}">${api.head('People', 'Find the people behind the possibilities.')}<div class="people-view-tabs" role="tablist" aria-label="People view">${[['groups','Groups'],['everyone','Everyone']].map(([id,label]) => `<button type="button" role="tab" id="people-view-${id}" data-people-view="${id}" aria-selected="${view.tab === id}" aria-controls="people-view-panel" tabindex="${view.tab === id ? '0' : '-1'}">${label}</button>`).join('')}</div><div id="people-view-panel" role="tabpanel" aria-labelledby="people-view-${view.tab}" tabindex="0">${everyone ? `<div class="people-everyone-actions"><button class="button" data-action="add-person">${api.icon('plus')} Add volunteer</button></div>${renderEveryone()}` : groupsMarkup(result)}</div></section>`;
  }

  function selectTab(tab) {
    if (!['groups','everyone'].includes(tab)) return;
    view.tab = tab;
    api.render();
    document.getElementById(`people-view-${tab}`)?.focus();
  }

  function configure(nextApi) {
    api = nextApi;
    if (bound || typeof document === 'undefined') return;
    bound = true;
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-people-view],[data-people-grouping],[data-people-groups-all],[data-people-group-person],[data-people-group-lead],[data-people-group-open]');
      if (!button || !api) return;
      if (button.hasAttribute('data-people-view')) selectTab(button.dataset.peopleView);
      else if (button.hasAttribute('data-people-grouping')) {
        if (!groupingNames.some(([id]) => id === button.dataset.peopleGrouping)) return;
        view.grouping = button.dataset.peopleGrouping;
        api.render();
        document.getElementById(`people-grouping-${view.grouping}`)?.focus();
      } else if (button.hasAttribute('data-people-groups-all')) {
        view.all = !view.all;
        api.render();
        document.querySelector('[data-people-groups-all]')?.focus();
      } else if (button.hasAttribute('data-people-group-open')) {
        const details = document.getElementById(`people-details-${button.dataset.peopleGroupOpen}`);
        if (details) {
          details.open = !details.open;
          button.setAttribute('aria-expanded', String(details.open));
          if (details.open) details.querySelector('summary')?.focus();
        }
      } else if (button.hasAttribute('data-people-group-person')) api.showPerson(button.dataset.peopleGroupPerson);
      else if (button.hasAttribute('data-people-group-lead')) api.showOpportunity(button.dataset.peopleGroupLead);
    });
    document.addEventListener('toggle', event => {
      if (!event.target.isConnected || !event.target.matches?.('.people-group-details')) return;
      const id = event.target.dataset.peopleGroupId;
      if (event.target.open) view.expanded.add(id); else view.expanded.delete(id);
      document.querySelectorAll('[data-people-group-open]').forEach(button => {
        if (button.dataset.peopleGroupOpen === id) button.setAttribute('aria-expanded', String(event.target.open));
      });
    }, true);
    document.addEventListener('keydown', event => {
      if (!event.target.matches?.('[data-people-view]') || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      selectTab(event.key === 'Home' ? 'groups' : event.key === 'End' ? 'everyone' : view.tab === 'groups' ? 'everyone' : 'groups');
    });
  }

  const exported = {compute, configure, render};
  if (root) root.RootsPeopleGroups = exported;
  if (typeof module !== 'undefined' && module.exports) module.exports = exported;
})(typeof window !== 'undefined' ? window : null);
