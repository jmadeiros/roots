const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dist/people-detail.js'), 'utf8');
const storageKey = 'roots-people-details-v1';
const plain = value => JSON.parse(JSON.stringify(value));
const person = values => ({id:'p01', name:'Avery Green', email:'avery@example.test', interests:[], availability:'Weekends', visits:1, hours:3, status:'New', ...values});
function demoData() {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/data.js'), 'utf8'), context);
  return plain(context.window.ROOTS_DATA);
}

function harness({people = [person()], edits = {}, storage = new Map(), bridge = true, opportunityList} = {}) {
  if (!storage.has(storageKey)) storage.set(storageKey, JSON.stringify(edits));
  const listeners = new Map(), events = [], panel = {innerHTML:'', setAttribute() {}};
  let renderCount = 0, syncCount = 0;
  const window = {
    ROOTS_DATA:{opportunities:[]},
    dispatchEvent(event) { events.push(event.type); }
  };
  if (opportunityList) window.RootsOpportunities = {list:opportunityList};
  if (bridge) window.RootsBridge = {sync() { syncCount++; window.dispatchEvent({type:'roots:records-changed'}); }};
  const document = {
    addEventListener(type, callback) { listeners.set(type, callback); },
    querySelector(selector) { return selector === '[data-people-panel]' ? panel : null; },
    querySelectorAll() { return []; },
    activeElement:null
  };
  const FormData = class {
    constructor(form) { this.values = form.values; }
    get(key) { return this.values[key] ?? null; }
    entries() { return Object.entries(this.values); }
  };
  vm.runInNewContext(source, {
    window, document, FormData,
    CustomEvent:class { constructor(type) { this.type = type; } },
    localStorage:{getItem:key => storage.get(key), setItem:(key, value) => storage.set(key, value)}
  }, {filename:'people-detail.js'});
  window.RootsPeople.configure({
    getState:() => ({people}),
    esc:value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character])),
    icon:() => '', avatar:() => '', openDialog() {}, toast() {},
    render() { renderCount++; }
  });
  return {
    profiles:window.RootsPeople, storage, events, panel,
    get renderCount() { return renderCount; },
    get syncCount() { return syncCount; },
    submit(values) {
      window.RootsPeople.open(people[0].id);
      const form = {
        id:'people-preferences-form',
        values:{skills:'', availability:'Weekends', channel:'Not recorded', target:'', studentStatus:'Not recorded', school:'', employer:'', ...values},
        reportValidity:() => true
      };
      listeners.get('submit')({target:form, preventDefault() {}});
    }
  };
}

test('student and employment facts are unrecorded even when names, interests, email, or hours suggest them', () => {
  const h = harness();
  const result = h.profiles.profileData(person({name:'Student Worker', email:'student@college.example', interests:['Service hours', 'Youth mentoring'], hours:40, company:'Guesswork Ltd'}));
  assert.equal(result.studentStatus, 'Not recorded');
  assert.equal(result.school, null);
  assert.equal(result.employer, null);
  assert.deepEqual(plain(result.personContextSource), {studentStatus:'Not recorded', school:'Not recorded', employer:'Not recorded'});
  assert.equal(result.serviceHours.target, 40);
  assert.equal(result.serviceHours.targetSource, 'Illustrative target');
  for (const field of ['age', 'ageGroup', 'ethnicity', 'religion', 'income', 'gender']) assert.equal(Object.hasOwn(result, field), false);

  const unknown = h.profiles.profileData(person({id:'new-person', name:'New volunteer'}));
  assert.equal(unknown.studentStatus, 'Not recorded');
  assert.equal(unknown.school, null);
  for (const field of ['age', 'ageBand', 'educationLevel', 'fullTime', 'weeklyHoursAvailable', 'serviceRequirementHours']) assert.equal(Object.hasOwn(unknown, field), false, `${field} is not filled from the demo scenario`);
});

test('fictional scenario supplies bounded school and college cohorts without changing participation records', () => {
  const data = demoData(), h = harness();
  const profiles = data.people.map(value => h.profiles.profileData(value));
  const school = profiles.filter(value => value.educationLevel === 'secondary');
  const college = profiles.filter(value => value.educationLevel === 'undergraduate');
  assert.equal(data.people.length, 35);
  assert.equal(profiles.filter(value => value.studentStatus === 'Student').length, 20);
  assert.equal(school.length, 8);
  assert.ok(school.every(value => [16, 17].includes(value.age) && value.ageBand === 'Under 18' && value.serviceRequirementHours === 40 && value.serviceRequirementDue === '2027-05-31'));
  assert.ok(school.every(value => value.serviceHours.target === 40 && value.serviceHours.targetSource === 'Fictional demo scenario'));
  assert.equal(college.length, 12);
  assert.ok(college.every(value => value.age >= 18 && value.age <= 24 && value.fullTime && value.weeklyHoursAvailable >= 12));
  assert.deepEqual([...new Set(college.map(value => value.school))], ['UC Davis', 'Sacramento State']);
  assert.ok(profiles.every(value => value.contextSource === 'Fictional demo scenario' && value.personContextSource.age === 'Fictional demo scenario' && value.employer === null));
  assert.equal(profiles.reduce((sum, value) => sum + value.hours, 0), 893);
  assert.equal(profiles.reduce((sum, value) => sum + value.visits, 0), 224);
  assert.equal(data.scenario.source, 'Fictional demo scenario');
  assert.equal(data.scenario.fellowHostCapacity, 2);
  assert.ok(data.scenario.supervisorIds.every(id => profiles.some(value => value.id === id && value.age >= 18 && value.studentStatus === 'Not a student')));
});

test('local unknowns and edits take precedence over all seeded eligibility context', () => {
  const people = demoData().people;
  const h = harness({people, edits:{
    p01:{studentStatus:'Not recorded', school:null, target:null, age:null},
    p02:{studentStatus:'Not a student', weeklyHoursAvailable:0},
    p06:{target:60}
  }});
  const cleared = h.profiles.profileData(people.find(value => value.id === 'p01'));
  assert.equal(cleared.studentStatus, 'Not recorded');
  assert.equal(cleared.school, null);
  for (const field of ['age', 'ageBand', 'educationLevel', 'fullTime', 'serviceRequirementHours', 'serviceRequirementDue']) assert.equal(cleared[field], null, `${field} remains unknown after a clear`);
  const former = h.profiles.profileData(people.find(value => value.id === 'p02'));
  assert.equal(former.educationLevel, null);
  assert.equal(former.fullTime, null);
  assert.equal(former.weeklyHoursAvailable, 0);
  assert.equal(former.personContextSource.weeklyHoursAvailable, 'Locally recorded');
  const adjusted = h.profiles.profileData(people.find(value => value.id === 'p06'));
  assert.equal(adjusted.serviceRequirementHours, 60);
  assert.equal(adjusted.personContextSource.serviceRequirementHours, 'Locally recorded');
});

test('profiles label demo context and unrelated preference edits do not promote it to a confirmed record', () => {
  const people = [demoData().people[0]], h = harness({people});
  h.profiles.open(people[0].id);
  assert.match(h.panel.innerHTML, /Demo context/);
  assert.match(h.panel.innerHTML, /fictional scenario details/);
  assert.match(h.panel.innerHTML, /40 hours by May 31, 2027/);
  assert.match(h.panel.innerHTML, /Demo goal\. Replace it with a confirmed requirement\./);
  h.submit({studentStatus:people[0].studentStatus, school:people[0].school, target:'40', channel:'Email'});
  const saved = JSON.parse(h.storage.get(storageKey)).p01;
  for (const field of ['studentStatus', 'school', 'target']) assert.equal(Object.hasOwn(saved, field), false, `${field} keeps the original provenance when unchanged`);
  const profile = harness({people, storage:h.storage}).profiles.profileData(people[0]);
  assert.equal(profile.personContextSource.studentStatus, 'Fictional demo scenario');
  assert.equal(profile.serviceHours.targetSource, 'Fictional demo scenario');
});

test('profile programme routes use current criteria: school service for Sofia, college for undergraduates, no interest inference', () => {
  const {evaluate} = require('../dist/program-fit.js');
  const data = demoData();
  const catalogueContext = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/programs.js'), 'utf8'), catalogueContext);
  const catalogue = plain(catalogueContext.window.ROOTS_PROGRAMS);
  const unknown = person({id:'new', name:'New volunteer', interests:['Community gardening', 'Service hours']});
  const people = [...data.people, unknown];
  const h = harness({people, opportunityList:() => catalogue.map(programme => ({...programme, matches:evaluate({people}, programme, data.scenario, h.profiles.profileData).matches}))});
  h.profiles.open('p06');
  assert.match(h.panel.innerHTML, /Programme routes/);
  assert.match(h.panel.innerHTML, /data-opportunity-id="o05"/);
  assert.doesNotMatch(h.panel.innerHTML, /data-opportunity-id="o01"/);
  assert.doesNotMatch(h.panel.innerHTML, /Interest matches|Connects with/);
  const schoolRoute = catalogue.find(programme => programme.id === 'o05');
  const schoolReason = evaluate({people}, schoolRoute, data.scenario, h.profiles.profileData).matches.find(match => match.personId === 'p06').reason;
  assert.ok(h.panel.innerHTML.includes(schoolReason));
  assert.equal(h.panel.innerHTML.match(/data-opportunity-id="([^"]+)"/)[1], 'o05');
  h.profiles.open('p02');
  assert.equal(h.panel.innerHTML.match(/data-opportunity-id="([^"]+)"/)[1], 'o01');
  h.profiles.open('new');
  assert.match(h.panel.innerHTML, /data-opportunity-id="o13"/);
  assert.doesNotMatch(h.panel.innerHTML, /data-opportunity-id="o01"/);
  assert.doesNotMatch(h.panel.innerHTML, /data-opportunity-id="o05"/);
});

test('direct context fields are read literally, validated, and bounded without inventing student status', () => {
  const h = harness();
  const explicit = h.profiles.profileData(person({studentStatus:'Student', school:' Shared College ', employer:' Community Bakery '}));
  assert.equal(explicit.studentStatus, 'Student');
  assert.equal(explicit.school, 'Shared College');
  assert.equal(explicit.employer, 'Community Bakery');
  assert.deepEqual(plain(explicit.personContextSource), {studentStatus:'Recorded in profile', school:'Recorded in profile', employer:'Recorded in profile'});
  assert.equal(h.profiles.profileData(person({school:'Shared College'})).studentStatus, 'Not recorded', 'a school alone is not an assertion of student status');
  assert.equal(h.profiles.profileData(person({studentStatus:'Not a student'})).studentStatus, 'Not a student');
  const malformed = h.profiles.profileData(person({studentStatus:true, school:[], employer:{name:'Company'}}));
  assert.equal(malformed.studentStatus, 'Not recorded');
  assert.equal(malformed.school, null);
  assert.equal(malformed.employer, null);
  assert.equal(h.profiles.profileData(person({employer:'x'.repeat(200)})).employer.length, 160);
});

test('saving explicit context retains notes, target, unrelated stored edits and other people across reloads', () => {
  const people = [person({studentStatus:'Not a student', employer:'Prior employer'})];
  const edits = {p01:{notes:'Follow up about planting.', notesUpdatedAt:'2026-10-20T12:00:00Z', futurePreference:'keep'}, p02:{notes:'Other person'}};
  const h = harness({people, edits});
  h.submit({studentStatus:'Student', school:' Shared College ', employer:' Community Bakery ', skills:'Gardening, Gardening, Photography', channel:'Email', target:'80'});
  const saved = JSON.parse(h.storage.get(storageKey));
  assert.deepEqual(saved.p02, edits.p02);
  assert.equal(saved.p01.notes, edits.p01.notes);
  assert.equal(saved.p01.notesUpdatedAt, edits.p01.notesUpdatedAt);
  assert.equal(saved.p01.futurePreference, 'keep');
  assert.deepEqual(saved.p01.skills, ['Gardening', 'Photography']);
  assert.equal(saved.p01.target, 80);
  assert.equal(saved.p01.channel, 'Email');
  assert.equal(saved.p01.school, 'Shared College');
  assert.equal(saved.p01.employer, 'Community Bakery');
  assert.equal(h.renderCount, 1);
  assert.equal(h.syncCount, 1);
  assert.deepEqual(h.events, ['roots:records-changed']);
  const reloaded = harness({people, storage:h.storage}).profiles.profileData(people[0]);
  assert.equal(reloaded.studentStatus, 'Student');
  assert.equal(reloaded.school, 'Shared College');
  assert.equal(reloaded.employer, 'Community Bakery');
  assert.deepEqual(plain(reloaded.personContextSource), {studentStatus:'Locally recorded', school:'Locally recorded', employer:'Locally recorded'});
  assert.equal(reloaded.serviceHours.target, 80);
  assert.equal(reloaded.serviceHours.targetSource, 'Locally recorded');
});

test('clearing saved context becomes unknown and does not fall back to direct profile values', () => {
  const people = [person({studentStatus:'Student', school:'Former College', employer:'Former employer'})];
  const h = harness({people, edits:{p01:{studentStatus:'Student', school:'Saved College', employer:'Saved employer'}}});
  h.submit({studentStatus:'Not recorded', school:'  ', employer:''});
  const reloaded = harness({people, storage:h.storage}).profiles.profileData(people[0]);
  assert.equal(reloaded.studentStatus, 'Not recorded');
  assert.equal(reloaded.school, null);
  assert.equal(reloaded.employer, null);
  assert.deepEqual(plain(reloaded.personContextSource), {studentStatus:'Not recorded', school:'Not recorded', employer:'Not recorded'});
});

test('optional fields appear with shared-details guidance and saved changes notify without a bridge', () => {
  const h = harness({bridge:false});
  h.profiles.open('p01');
  assert.match(h.panel.innerHTML, /Record only what this person has shared\./);
  assert.match(h.panel.innerHTML, /name="studentStatus"[^>]*><option selected>Not recorded<\/option><option>Student<\/option><option>Not a student<\/option>/);
  assert.match(h.panel.innerHTML, /School \/ college \(optional\)/);
  assert.match(h.panel.innerHTML, /Employer \(optional\)/);
  assert.doesNotMatch(h.panel.innerHTML, /name="(?:studentStatus|school|employer)"[^>]*\brequired\b/);
  h.submit({studentStatus:'Student', employer:'Shared employer'});
  assert.deepEqual(h.events, ['roots:records-changed']);
  assert.equal(h.renderCount, 1);
});
