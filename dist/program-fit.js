/* Program fit uses recorded circumstances and provider criteria, never interests. */
((root) => {
  'use strict';

  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  const key = value => text(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const has = (value, field) => Object.prototype.hasOwnProperty.call(value, field);
  const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const kinds = new Set(['education', 'college', 'climate-host', 'school-service', 'community-event', 'employer', 'watchlist', 'benefit']);
  const fields = ['studentStatus', 'school', 'educationLevel', 'fullTime', 'weeklyHoursAvailable', 'serviceRequirementHours', 'serviceRequirementDue', 'employer', 'benefitTags'];
  const employerKey = value => key(value).replace(/\s+(corporation|corp)$/, '');
  const amount = value => `$${value.toLocaleString('en-US', {maximumFractionDigits:2})}`;

  function copy(value, seen = new Map()) {
    if (!record(value) && !Array.isArray(value)) return value;
    if (seen.has(value)) return seen.get(value);
    const result = Array.isArray(value) ? [] : {};
    seen.set(value, result);
    for (const [field, child] of Object.entries(value)) result[field] = copy(child, seen);
    return result;
  }

  function peopleIndex(state, adapter) {
    const people = new Map();
    for (const original of Array.isArray(state?.people) ? state.people : []) {
      const id = record(original) ? text(original.id) : '';
      if (!id || people.has(id)) continue;
      let supplied = null;
      if (typeof adapter === 'function') {
        try { supplied = adapter(copy(original)); } catch { /* Use the recorded person if profile storage fails. */ }
      }
      supplied = record(supplied) ? supplied : {};
      const person = {id};
      // Own properties preserve explicit local clears instead of resurrecting
      // the older scenario value through a truthy/nullish fallback.
      for (const field of fields) person[field] = has(supplied, field) ? supplied[field] : original[field];
      people.set(id, person);
    }
    return people;
  }

  function namedSupervisors(people, scenario) {
    return [...new Set(Array.isArray(scenario.supervisorIds) ? scenario.supervisorIds.map(text).filter(Boolean) : [])]
      .map(id => people.get(id)).filter(Boolean);
  }

  function evaluate(state, program, suppliedScenario, profileAdapter) {
    if (!record(program) || !text(program.id) || !kinds.has(program.matchKind)) return null;
    const scenario = record(suppliedScenario) ? suppliedScenario : {};
    const people = peopleIndex(state, profileAdapter), pool = [...people.values()];
    const supervisors = namedSupervisors(people, scenario);
    const capacity = count(scenario.fellowHostCapacity) ? scenario.fellowHostCapacity : null;
    const result = {id:text(program.id), program, peopleCount:0, personIds:[], matches:[], facts:[], summary:'', gaps:[], readyCount:0, checkCount:0, stage:text(program.stage) || 'local'};
    const check = (satisfied, missing) => {
      result.checkCount++;
      if (satisfied) result.readyCount++;
      else if (missing) result.gaps.push(missing);
    };
    const fact = (label, value) => { if (result.facts.length < 3) result.facts.push({label, value:String(value)}); };
    const match = (members, reason) => {
      result.matches = members.map(person => ({personId:person.id, reason:typeof reason === 'function' ? reason(person) : reason}));
      result.personIds = members.map(person => person.id);
      result.peopleCount = members.length;
    };

    if (program.matchKind === 'watchlist') {
      fact('Eligibility rules', 'Awaiting publication');
      fact('Individual awards', 'Not yet published');
      fact('Community fit', 'Not assessed yet');
      check(false, 'Wait for the new funding notice, eligibility criteria and application window.');
      check(false, 'Assess the project and community against the published rules before claiming a fit.');
      result.summary = 'A funding route to watch for community farms and gardens. No cohort or eligibility match is claimed while the new-round rules remain unpublished.';
    }

    if (program.matchKind === 'education') {
      const students = pool.filter(person => person.studentStatus === 'Student');
      match(students, 'Recorded as a student; a potential participant in the proposed education program.');
      fact('Recorded students', students.length);
      fact('Named education leads', supervisors.length);
      fact('Agriculture education plan', scenario.agEducationProgram === true ? 'In the scenario' : 'Not recorded');
      check(students.length > 0, 'Identify the students or other learners the education project would serve.');
      check(supervisors.length > 0, 'Name an education lead and confirm their capacity.');
      check(scenario.agEducationProgram === true, 'Define the agriculture-education activities and learning outcomes.');
      check(false, 'Confirm applicant status and the provider’s current eligibility rules.');
      check(false, 'Prepare the project budget, delivery plan and application materials.');
      result.summary = students.length
        ? `Build an agriculture-education proposal around ${students.length} recorded students and ${supervisors.length} named ${supervisors.length === 1 ? 'lead' : 'leads'}.`
        : 'Define the learners and education activities before developing an application.';
    }

    if (program.matchKind === 'college') {
      const campuses = new Set((Array.isArray(program.campuses) ? program.campuses : []).map(key).filter(Boolean));
      const students = pool.filter(person => person.studentStatus === 'Student' && person.educationLevel === 'undergraduate' && person.fullTime === true && campuses.has(key(person.school)));
      const represented = new Set(students.map(person => key(person.school)));
      const definedMinimum = program.minimumHostFellows ?? program.minimumPeople;
      const minimum = count(definedMinimum) && definedMinimum > 0 ? definedMinimum : 2;
      const sacramento = students.some(person => ['sacramento state', 'california state university sacramento'].includes(key(person.school)));
      match(students, person => `Recorded full-time undergraduate at ${text(person.school)}; campus and financial eligibility still need review.`);
      fact('Full-time undergraduates', students.length);
      fact('Campuses represented', represented.size);
      fact('Planned host fellows', `${capacity === null ? 'Not recorded' : capacity} / ${minimum} statewide minimum`);
      check(students.length > 0, 'Find recorded full-time undergraduates at a participating campus.');
      check(capacity !== null && capacity >= minimum, `Confirm capacity to host at least ${minimum} fellows.`);
      if (sacramento) {
        check(capacity !== null && capacity >= 3, 'Sacramento State requires capacity for at least 3 fellows; the current host plan is short.');
        check(false, 'Confirm the Sacramento State placement can provide its required 15 hours per week.');
      }
      check(false, 'Secure campus approval and a host agreement; a student connection does not guarantee a placement.');
      check(false, 'The campus must check each student’s financial and other program eligibility.');
      result.summary = students.length
        ? `${students.length} recorded full-time undergraduates connect this host proposal to ${represented.size} participating ${represented.size === 1 ? 'campus' : 'campuses'}.`
        : 'Build a campus partnership after identifying students who meet the recorded study criteria.';
    }

    if (program.matchKind === 'climate-host') {
      const minimum = count(program.minimumPeople) && program.minimumPeople > 0 ? program.minimumPeople : 2;
      match(supervisors, 'Named in the host scenario as a supervisor; not counted as an incoming funded fellow.');
      fact('Named supervisors', supervisors.length);
      fact('Planned fellow roles', `${capacity === null ? 'Not recorded' : capacity} / ${minimum} minimum`);
      fact('Host organisation', scenario.isNonprofit === true ? 'Nonprofit in scenario' : 'Status not recorded');
      check(supervisors.length > 0, 'Name people who can supervise incoming fellows.');
      check(capacity !== null && capacity >= minimum, `Confirm capacity to host at least ${minimum} incoming fellows.`);
      check(scenario.isNonprofit === true, 'Confirm the organisation type and applicable host eligibility.');
      check(false, 'Confirm the provider’s host approval, application window and funding terms.');
      check(false, 'Agree the climate work plan, supervision time and placement requirements.');
      result.summary = capacity !== null && capacity > 0
        ? `Explore ${capacity} incoming funded fellow ${capacity === 1 ? 'role' : 'roles'}, supported by ${supervisors.length} named ${supervisors.length === 1 ? 'supervisor' : 'supervisors'}.`
        : 'Define the incoming fellow roles and supervision capacity for a host application.';
    }

    if (program.matchKind === 'school-service') {
      const students = pool.filter(person => person.studentStatus === 'Student' && person.educationLevel === 'secondary' && positive(person.serviceRequirementHours));
      const totalHours = students.reduce((total, person) => total + person.serviceRequirementHours, 0);
      const schools = new Set(students.map(person => key(person.school)).filter(Boolean));
      match(students, person => `Recorded secondary student with a ${person.serviceRequirementHours}-hour service requirement${text(person.school) ? ` at ${text(person.school)}` : ''}.`);
      fact('Students with a requirement', students.length);
      fact('Required hours in total', Number.isFinite(totalHours) ? totalHours : 'Check recorded values');
      fact('Schools represented', schools.size);
      check(students.length > 0, 'Record secondary students and their positive service-hour requirements.');
      check(students.length > 0 && students.every(person => text(person.school)), 'Record the school or coordinator for each student.');
      check(false, 'Agree school approval, sign-off, supervision and safeguarding before offering places.');
      check(false, 'Confirm student availability and deadlines; existing volunteer hours have not been approved against these requirements.');
      result.summary = students.length
        ? `Offer a supervised school partnership for ${students.length} students with ${Number.isFinite(totalHours) ? totalHours : 'recorded'} required service hours in total.`
        : 'Record school service requirements to build a partnership around a real student need.';
    }

    if (program.matchKind === 'benefit') {
      // Benefits for the volunteer: matched on circumstances people chose to record, never on interests.
      const tag = text(program.benefitTag);
      const members = pool.filter(person => Array.isArray(person.benefitTags) && person.benefitTags.includes(tag));
      match(members, () => text(program.matchReason) || 'Recorded on their profile.');
      fact('People this applies to', members.length);
      for (const [label, value] of Array.isArray(program.fitFacts) ? program.fitFacts : []) fact(label, value);
      check(members.length > 0, 'Record who this applies to, with their permission.');
      for (const item of Array.isArray(program.hostChecks) ? program.hostChecks : []) check(false, item);
      result.summary = members.length
        ? text(program.fitSummary).replace('{n}', members.length)
        : 'Record who this applies to before telling people about it.';
    }

    if (program.matchKind === 'community-event') {
      const tierMap = new Map();
      for (const tier of Array.isArray(program.tiers) ? program.tiers : []) {
        if (record(tier) && count(tier.people) && tier.people > 0 && positive(tier.amount) && !tierMap.has(tier.people)) tierMap.set(tier.people, tier);
      }
      const tiers = [...tierMap.values()].sort((a,b) => a.people-b.people);
      const reached = tiers.filter(tier => tier.people <= pool.length).at(-1);
      const next = tiers.find(tier => tier.people > pool.length);
      match(pool, 'In the recorded volunteer pool; event attendance has not been confirmed.');
      fact('Known volunteer pool', pool.length);
      fact('Tier to plan for', reached ? `Up to ${amount(reached.amount)} / ${reached.people} people` : 'Minimum group not yet reached');
      fact('Next group threshold', next ? `${next.people-pool.length} more for ${next.people} people` : tiers.length ? 'Largest listed tier reached' : 'Provider criteria needed');
      check(tiers.length > 0, 'Verify the provider’s current group-size and reimbursement tiers.');
      check(Boolean(reached), next ? `Recruit at least ${next.people-pool.length} more people to reach the first listed group tier.` : 'Establish a volunteer group against verified provider criteria.');
      check(false, 'Confirm event attendance; the known volunteer pool is not a turnout commitment.');
      check(false, 'Confirm eligible costs, reimbursement approval and remaining provider funds.');
      result.summary = reached
        ? `${pool.length} people in the known pool could support the ${reached.people}-person tier, with up to ${amount(reached.amount)} in reimbursement if attendance and costs qualify.`
        : `The known pool has ${pool.length} people; establish the required group before planning a reimbursement application.`;
    }

    if (program.matchKind === 'employer') {
      const employer = employerKey(program.employer);
      const employees = employer ? pool.filter(person => employerKey(person.employer) === employer) : [];
      match(employees, person => `Employer recorded as ${text(person.employer)}; employee-program participation is unconfirmed.`);
      fact('Recorded employee connections', employees.length);
      fact('Employer', text(program.employer) || 'Not recorded');
      check(Boolean(employer), 'Identify the employer behind this giving policy.');
      check(employees.length > 0, 'Find an employee connection before planning outreach through the employer program.');
      check(false, 'Confirm employee participation and the organisation’s eligibility with the program.');
      check(false, 'Ask the employee to verify qualifying hours and the claim process; no donation is guaranteed.');
      result.summary = employees.length
        ? `Explore the employee-giving route through ${employees.length} recorded ${employees.length === 1 ? 'connection' : 'connections'} at ${text(program.employer)}.`
        : `Find an employee connection at ${text(program.employer) || 'the company'} to explore this giving policy.`;
    }

    return result;
  }

  function rank(state, programs, scenario, profileAdapter, options = {}) {
    options = record(options) ? options : {};
    const filter = ['benefits', 'grants', 'placements', 'service'].includes(options.filter) ? options.filter : 'all';
    const seen = new Set(), results = [];
    for (const program of Array.isArray(programs) ? programs : []) {
      if (!record(program) || seen.has(text(program.id))) continue;
      if (filter !== 'all' && program.category !== filter) continue;
      const result = evaluate(state, program, scenario, profileAdapter);
      if (!result) continue;
      seen.add(result.id);
      results.push(result);
    }
    const priority = item => typeof item.program.priority === 'number' && Number.isFinite(item.program.priority) ? item.program.priority : Number.MAX_SAFE_INTEGER;
    return results.sort((a,b) => (options.order === 'people' ? b.peopleCount-a.peopleCount : 0) || priority(a)-priority(b) || a.id.localeCompare(b.id));
  }

  const api = {evaluate, rank};
  if (root) root.RootsProgramFit = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : null);
