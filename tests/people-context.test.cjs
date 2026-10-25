const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dist/people-detail.js'), 'utf8');
const storageKey = 'roots-people-details-v1';
const plain = value => JSON.parse(JSON.stringify(value));
const person = values => ({id:'p01', name:'Avery Green', email:'avery@example.test', interests:[], availability:'Weekends', visits:1, hours:3, status:'New', ...values});

function harness({people = [person()], edits = {}, storage = new Map(), bridge = true} = {}) {
  if (!storage.has(storageKey)) storage.set(storageKey, JSON.stringify(edits));
  const listeners = new Map(), events = [], panel = {innerHTML:'', setAttribute() {}};
  let renderCount = 0, syncCount = 0;
  const window = {
    ROOTS_DATA:{opportunities:[]},
    dispatchEvent(event) { events.push(event.type); }
  };
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

  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/data.js'), 'utf8'), context);
  assert.ok(context.window.ROOTS_DATA.people.every(value => {
    const profile = h.profiles.profileData(value);
    return profile.studentStatus === 'Not recorded' && profile.school === null && profile.employer === null;
  }), 'the current demo has no recorded student, school, or employer facts');
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
