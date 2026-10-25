/* Possibilities grounded in current people, project plans and candidate leads. */
((root) => {
  'use strict';

  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  const idOf = value => record(value) && text(value.id) ? value.id : null;
  const validCount = value => Number.isSafeInteger(value) && value >= 0;
  const words = value => text(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const join = values => values.length < 2 ? values[0] || '' : `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`;

  function index(values) {
    const result = new Map();
    for (const value of Array.isArray(values) ? values : []) {
      const id = idOf(value);
      if (id && !result.has(id)) result.set(id, value);
    }
    return result;
  }

  function interestsOf(value) {
    const result = new Map();
    for (const raw of Array.isArray(value) ? value : []) {
      const label = text(raw), key = words(label);
      if (key && !result.has(key)) result.set(key, label);
    }
    return result;
  }

  function peopleIndex(state, profileAdapter) {
    const result = new Map();
    for (const [id, original] of index(record(state) ? state.people : null)) {
      let supplied = null;
      if (typeof profileAdapter === 'function') {
        try {
          supplied = profileAdapter({...original, ...(Array.isArray(original.interests) ? {interests:[...original.interests]} : {})});
        } catch { /* The recorded profile remains usable if its adapter fails. */ }
      }
      supplied = record(supplied) ? supplied : {};
      const name = text(original.name);
      if (!name) continue;
      // Identity comes from the record. Only direct interests and visit counts
      // are read; illustrative history, targets and approvals are not evidence.
      result.set(id, {
        id, name,
        interests: interestsOf(Array.isArray(supplied.interests) ? supplied.interests : original.interests),
        visits: validCount(supplied.visits) ? supplied.visits : original.visits
      });
    }
    return result;
  }

  function serviceConnection(people, leads) {
    const lead = leads.get('o05');
    if (!lead || !text(lead.title)) return null;
    const interested = [...people.values()].filter(person => person.interests.has('service hours'));
    if (!interested.length) return null;
    const first = interested.filter(person => person.visits === 1);
    const known = interested.filter(person => validCount(person.visits));
    const names = join(interested.slice(0, 3).map(person => person.name));
    const peopleSentence = interested.length > 3
      ? `${interested.length} people, including ${names}, list service hours as an interest.`
      : `${names} ${interested.length === 1 ? 'lists' : 'list'} service hours as an interest.`;
    const visitSentence = first.length ? ` ${first.length} ${first.length === 1 ? 'has' : 'have'} one recorded visit.` : '';
    return {
      id: 'connection-service-hours',
      title: 'Build a regular service-hour pathway',
      summary: `${peopleSentence}${visitSentence} A school partnership could turn that interest into a regular volunteering pathway.`,
      personIds: interested.map(person => person.id), opportunityIds: [lead.id], projectIds: [],
      nextStep: 'Ask whether a regular shift would help, then speak with a school coordinator about approval, supervision and recording hours.',
      limitations: [
        'Schools, eligibility and approval requirements have not been confirmed.',
        'A recorded interest is not consent to participate or receive a message.',
        ...(first.length ? ['Visit totals do not tell us when someone last attended or whether they intend to return.'] : [])
      ],
      evidence: [
        {label:'Service-hour interest', value:`${interested.length} ${interested.length === 1 ? 'person' : 'people'}: ${join(interested.map(person => person.name))}`},
        {label:'Recorded visits', value: known.length ? `${first.length} with one visit, among ${known.length} valid visit ${known.length === 1 ? 'count' : 'counts'}${known.length < interested.length ? `; ${interested.length - known.length} unknown` : ''}` : 'No valid visit counts recorded'},
        {label:'Related lead', value:text(lead.title)}
      ],
      suggestedPrompt: `Help me explore a recurring service-hour pathway with ${join(interested.map(person => person.name))}. Use the ${text(lead.title)} lead and their stated interests. Draft the questions to ask the people and school coordinator; do not assume school approval or send messages.`
    };
  }

  function projectConnection(project, people, leads, theme) {
    if (!project || !text(project.title)) return null;
    const lead = leads.get(project.sourceOpportunityId);
    if (!lead || !text(lead.title)) return null;
    const team = [], seen = new Set();
    for (const entry of Array.isArray(project.team) ? project.team : []) {
      if (!record(entry) || seen.has(entry.personId)) continue;
      seen.add(entry.personId);
      const person = people.get(entry.personId), role = text(entry.role), reason = words(entry.reason);
      if (!person || !role || !reason) continue;
      // A plan's suggestion is supported only where its reason actually names
      // an interest on that person's current profile. No skills are inferred.
      const shared = [...person.interests].filter(([key]) => (` ${reason} `).includes(` ${key} `)).map(([, label]) => label);
      if (shared.length) team.push({person, role, shared});
    }
    if (team.length < 2) return null;
    const names = join(team.map(item => item.person.name));
    const mainInterests = [...new Map(team.map(item => [words(item.shared[0]), item.shared[0].toLowerCase()])).values()];
    return {
      id:`connection-${project.id}`,
      title:theme.title,
      summary:`${names} have interests in ${join(mainInterests)} that could help shape the ${theme.short} project. ${text(lead.title)} is a possible support route to investigate.`,
      personIds:team.map(item => item.person.id), opportunityIds:[lead.id], projectIds:[project.id],
      nextStep:`Ask the suggested team whether they want to shape the ${theme.short} plan, then verify the linked program’s current terms before relying on it.`,
      limitations:[
        'These are stated interests and proposed roles, not verified skills or commitments.',
        'Availability, project scope and supervision still need agreement.',
        'The linked program is a candidate lead; current eligibility, funding and application timing are unverified.'
      ],
      evidence:[
        {label:'Draft project', value:text(project.title)},
        ...team.map(item => ({label:item.person.name, value:`Suggested for ${item.role.toLowerCase()}; lists ${join(item.shared.map(label => label.toLowerCase()))}`})),
        {label:'Related lead', value:text(lead.title)}
      ],
      suggestedPrompt:`Help me develop ${text(project.title)} with the suggested team of ${names}. Use their recorded interests and the current proposed roles. Explain what to ask the team and what to verify about ${text(lead.title)}. Keep the plan provisional; do not assume skills, availability, program eligibility or funding.`
    };
  }

  function compute(state, leads, projects, profileAdapter) {
    const people = peopleIndex(state, profileAdapter), leadIndex = index(leads), projectIndex = index(projects);
    return [
      serviceConnection(people, leadIndex),
      projectConnection(projectIndex.get('project-garden'), people, leadIndex, {title:'Start the garden signs with people already here', short:'garden signs'}),
      projectConnection(projectIndex.get('project-compost'), people, leadIndex, {title:'Turn composting interest into a shared project', short:'composting'})
    ].filter(Boolean);
  }

  function rankOpportunities(state, leads, options = {}) {
    const people = peopleIndex(state), supportTypes = new Set(['grant', 'fellowship', 'in kind benefit', 'employer benefit']);
    const ranked = [];
    for (const lead of index(leads).values()) {
      const interests = interestsOf(lead.interests), matches = [], counts = new Map();
      if (!text(lead.title) || (options.supportOnly && !supportTypes.has(words(lead.type)) && !['funding','in-kind','employer'].includes(lead.supportKind))) continue;
      for (const person of people.values()) {
        const shared = [...person.interests].filter(([key]) => interests.has(key)).map(([, label]) => label);
        if (!shared.length) continue;
        matches.push({personId:person.id, interests:shared});
        for (const label of shared) {
          const key = words(label), existing = counts.get(key);
          counts.set(key, {label, count:(existing?.count || 0) + 1});
        }
      }
      if (!matches.length) continue;
      matches.sort((a,b) => b.interests.length-a.interests.length || a.personId.localeCompare(b.personId));
      ranked.push({id:lead.id, personIds:matches.map(item=>item.personId), matches,
        peopleCount:matches.length, closeCount:matches.filter(item=>item.interests.length>1).length,
        interests:[...counts.values()].sort((a,b)=>b.count-a.count || a.label.localeCompare(b.label))});
    }
    const participationOrder = ['o05','o07','o09','o01','o10','o08','o11'];
    const participationPriority = id => participationOrder.includes(id) ? participationOrder.indexOf(id) : participationOrder.length;
    return ranked.sort((a,b) => (options.order === 'participation' ? participationPriority(a.id)-participationPriority(b.id) : 0) || (options.order === 'closest' ? b.closeCount-a.closeCount : 0) || b.peopleCount-a.peopleCount || a.id.localeCompare(b.id));
  }

  const api = {compute, rankOpportunities};
  if (root) root.RootsConnections = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : null);
