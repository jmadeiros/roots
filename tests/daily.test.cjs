const assert = require('node:assert/strict');
const test = require('node:test');
const {execFileSync} = require('node:child_process');
const {createLedger} = require('../dist/daily.js');

const START = '2026-10-24T18:00:00.000Z';
const LATER = '2026-10-24T18:05:00.000Z';
const memory = () => {
  const values = new Map();
  return {getItem:key => values.get(key) ?? null, setItem:(key,value) => values.set(key,value)};
};
const baseline = () => ({people:[{id:'p1',name:'Maya',hours:4,visits:1,interests:['Gardening','Service hours'],studentStatus:'Student'}], events:[{id:'e1',title:'Garden shift',date:'2026-10-30',capacity:20}], opportunities:[{id:'o1',title:'Grant',stage:'open',matches:[{personId:'p1',reason:'Student'}]}], drafts:[], activity:[]});

test('first observation establishes a baseline without treating existing records as today’s activity', () => {
  const ledger = createLedger({storage:memory()});
  const initial = baseline();
  initial.drafts.push({id:'d1',createdAt:START,personName:'Maya',channel:'sms'});
  initial.activity.push({id:'a1',text:'Maya joined',time:'Just now'});
  const result = ledger.observe(initial, START);
  assert.equal(result.since, START);
  assert.equal(result.startedNow, true);
  assert.deepEqual(result.entries, []);
  assert.deepEqual(result.totalToday, {addedPeople:0,updatedPeople:0,addedEvents:0,newDrafts:0});
  assert.deepEqual(result.tracked, {people:1,events:1,opportunities:1,drafts:1});
  assert.equal(result.storageAvailable, true);
  assert.deepEqual(ledger.observe(initial, LATER).entries, []);
});

test('batches additions, records keyed updates and removals, and never treats a renamed person as a new identity', () => {
  const ledger = createLedger(), state = baseline();
  ledger.observe(state, START);
  state.people[0].name = 'Maya Chen';
  state.people.push({id:'p2',name:'Daniel'}, {id:'p3',name:'Priya'});
  state.events.push({id:'e2',title:'Learning walk'});
  const result = ledger.observe(state, LATER);
  assert.deepEqual(result.totalToday, {addedPeople:2,updatedPeople:1,addedEvents:1,newDrafts:0});
  const addition = result.entries.find(entry => entry.kind === 'people-added');
  assert.equal(addition.title, '2 people added');
  assert.deepEqual(addition.personIds, ['p2','p3']);
  assert.deepEqual(result.entries.find(entry => entry.kind === 'people-updated').personIds, ['p1']);
  state.people.splice(0,1);
  const removed = ledger.observe(state, '2026-10-24T18:06:00Z').entries[0];
  assert.equal(removed.kind, 'people-removed');
  assert.deepEqual(removed.personIds, ['p1']);
});

test('stable content ignores ordering, duplicate IDs, check timestamps, and profile display metadata', () => {
  const ledger = createLedger(), state = baseline();
  ledger.observe(state, START);
  state.people[0].interests.reverse();
  Object.assign(state.people[0], {checkedAt:LATER,preferencesUpdatedAt:LATER,notesUpdatedAt:LATER,color:'pink',initials:'XX',recentActivity:[{date:'2026-10-23',illustrative:true}]});
  state.people.push({id:'p1',name:'Duplicate ignored'});
  state.opportunities[0].sourceCheckedAt = LATER;
  state.opportunities[0].checkedAt = LATER;
  state.events[0].metadata = {checkedAt:LATER};
  assert.deepEqual(ledger.observe(state,LATER).entries, []);
});

test('genuine attendance, context, interests and notes changes produce one profile update per observation', () => {
  const ledger = createLedger(), state = baseline();
  ledger.observe(state, START);
  Object.assign(state.people[0], {hours:8,visits:2,school:'School A',age:17,notes:'Wants a recurring shift',serviceHours:{target:40,approved:4,pending:4},interests:['Service hours']});
  const result = ledger.observe(state,LATER);
  assert.equal(result.entries.length,1);
  assert.equal(result.entries[0].kind,'people-updated');
  state.people[0].visits = 3;
  assert.equal(ledger.observe(state,'2026-10-24T18:06:00Z').totalToday.updatedPeople,1,'today counts distinct people, not the number of edits');
});

test('only substantive event and programme fit changes create entries', () => {
  const ledger = createLedger(), state = baseline();
  ledger.observe(state,START);
  state.events[0].capacity = 25;
  state.opportunities[0].matches.push({personId:'p2',reason:'Confirmed education need'});
  let result = ledger.observe(state,LATER);
  assert.deepEqual(result.entries.map(entry => entry.kind),['opportunities-updated','events-updated']);
  state.opportunities[0].matches.reverse();
  assert.equal(ledger.observe(state,'2026-10-24T18:06:00Z').entries.length,2);
  state.opportunities[0].stage = 'closed';
  result = ledger.observe(state,'2026-10-24T18:07:00Z');
  assert.equal(result.entries[0].kind,'opportunities-updated');
  assert.deepEqual(result.entries[0].opportunityIds,['o1']);
});

test('repeated renders and a page reload do not duplicate entries', () => {
  const storage = memory(), state = baseline();
  const first = createLedger({storage});
  first.observe(state,START);
  state.people.push({id:'p2',name:'Daniel'});
  first.observe(state,LATER);
  assert.equal(first.observe(state,LATER).entries.length,1);
  const reloaded = createLedger({storage});
  assert.equal(reloaded.observe(state,LATER).entries.length,1);
  assert.equal(reloaded.today(LATER).since,START);
  assert.equal(reloaded.today(LATER).totalToday.addedPeople,1);
});

test('missing or unloaded collections do not remove records; late collection hydration establishes its baseline', () => {
  const ledger = createLedger();
  ledger.observe({people:baseline().people},START);
  assert.equal(ledger.observe({opportunities:baseline().opportunities},LATER).entries.length,0);
  assert.equal(ledger.observe({people:null,events:'loading'},LATER).tracked.people,1);
  assert.equal(ledger.observe({people:[]},LATER).entries[0].kind,'people-removed');
});

test('draft timestamps distinguish newly prepared messages from old records loaded by the bridge', () => {
  const ledger = createLedger(), state = baseline();
  ledger.observe(state,START);
  state.drafts.push({id:'old',createdAt:'2026-10-24T17:00:00Z',channel:'sms'}, {id:'new',createdAt:'2026-10-24T18:02:00Z',channel:'sms',personId:'p1',personName:'Maya'}, {id:'future',createdAt:'2026-10-25T18:02:00Z',channel:'email'});
  const result = ledger.observe(state,LATER);
  assert.equal(result.totalToday.newDrafts,1);
  assert.equal(result.entries[0].title,'SMS draft prepared for Maya');
  assert.equal(result.entries[0].at,'2026-10-24T18:02:00.000Z');
  assert.deepEqual(result.entries[0].personIds,['p1']);
  assert.deepEqual(result.entries[0].draftIds,['new']);
  state.drafts[1].body = 'Edited text';
  assert.equal(ledger.observe(state,LATER).totalToday.newDrafts,1);
});

test('undated newly observed drafts use observation time only after the drafts baseline exists', () => {
  const ledger = createLedger();
  ledger.observe({people:[]},START);
  assert.equal(ledger.observe({drafts:[{id:'old-undated'}]},LATER).entries.length,0);
  const result = ledger.observe({drafts:[{id:'old-undated'},{id:'new-undated',personName:'Daniel',channel:'email'}]},'2026-10-24T18:06:00Z');
  assert.equal(result.entries[0].at,'2026-10-24T18:06:00.000Z');
  assert.equal(result.entries[0].title,'EMAIL draft prepared for Daniel');
});

test('a dated draft created after baseline can arrive with the first asynchronous draft collection', () => {
  const ledger = createLedger();
  ledger.observe({people:[]},START);
  const result = ledger.observe({drafts:[{id:'new',createdAt:'2026-10-24T18:03:00Z'}]},LATER);
  assert.equal(result.totalToday.newDrafts,1);
  ledger.observe({drafts:[]},LATER);
  assert.equal(ledger.observe({drafts:[{id:'new',createdAt:'2026-10-24T18:03:00Z'}]},LATER).totalToday.newDrafts,1,'reappearing action IDs are not recounted');
});

test('legacy relative activity cannot invent history and confirmed self-test delivery is labelled precisely', () => {
  const ledger = createLedger(), state = baseline();
  ledger.observe(state,START);
  state.activity = [
    {id:'a1',text:'Four people joined',time:'Just now'},
    {id:'a2',kind:'draft_created',createdAt:LATER},
    {id:'a3',kind:'telegram_test_preview',createdAt:LATER,status:'failed',deliveredToVolunteers:false},
    {id:'a4',kind:'telegram_test_preview',createdAt:LATER,status:'sent',deliveredToVolunteers:false}
  ];
  const result = ledger.observe(state,LATER);
  assert.equal(result.entries.length,1);
  assert.equal(result.entries[0].title,'Demo messages sent to your Telegram chat');
  assert.equal(result.entries[0].kind,'telegram-preview-sent');
  assert.equal(result.totalToday.newDrafts,0);
});

test('local midnight determines Today, while the original baseline and history persist', () => {
  const script = `const {createLedger}=require('./dist/daily.js'); const ledger=createLedger(); ledger.observe({people:[]},'2026-10-25T06:58:00Z'); ledger.observe({people:[{id:'a'}]},'2026-10-25T06:59:00Z'); const before=ledger.today('2026-10-25T06:59:00Z'); const after=ledger.today('2026-10-25T07:01:00Z'); process.stdout.write(JSON.stringify({before,after}));`;
  const result = JSON.parse(execFileSync(process.execPath,['-e',script],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,TZ:'America/Los_Angeles'},encoding:'utf8'}));
  assert.equal(result.before.day,'2026-10-24');
  assert.equal(result.before.totalToday.addedPeople,1);
  assert.equal(result.after.day,'2026-10-25');
  assert.equal(result.after.entries.length,0);
  assert.equal(result.after.since,'2026-10-25T06:58:00.000Z');
});

test('storage denial or corruption falls back to an in-memory ledger without breaking observation', () => {
  for (const storage of [() => {throw new Error('denied');}, {getItem:() => '{invalid',setItem:() => {throw new Error('quota');}}]) {
    const ledger = createLedger({storage});
    ledger.observe({people:[]},START);
    const result = ledger.observe({people:[{id:'p1'}]},LATER);
    assert.equal(result.totalToday.addedPeople,1);
    assert.equal(result.storageAvailable,false);
    assert.equal(ledger.observe({people:[{id:'p1'}]},LATER).entries.length,1);
  }
});

test('history storage is bounded to at most 300 entries and returned data cannot mutate its internal state', () => {
  const storage = memory(), ledger = createLedger({storage,maxEntries:5000});
  ledger.observe({people:[{id:'p1',visits:0}]},START);
  for (let visits=1;visits<=305;visits++) ledger.observe({people:[{id:'p1',visits}]},LATER);
  const saved = JSON.parse(storage.getItem('roots-daily-v1'));
  assert.equal(saved.entries.length,300);
  assert.equal(saved.entries[0].sequence,6);
  const result = ledger.today(LATER);
  result.entries[0].personIds.push('forged');
  result.totalToday.updatedPeople = 100;
  assert.equal(ledger.today(LATER).totalToday.updatedPeople,1);
});

test('malformed snapshots and records cannot manufacture a baseline or poison ID maps', () => {
  const ledger = createLedger();
  for (const value of [undefined,null,[],{},'bad']) assert.equal(ledger.observe(value,START).since,null);
  ledger.observe({people:[null,[],{}, {id:''},{id:'__proto__',name:'Valid ID'}]},START);
  const result = ledger.observe({people:[{id:'__proto__',name:'Updated valid ID'}, {id:'constructor',name:'Another ID'}]},LATER);
  assert.equal(result.totalToday.updatedPeople,1);
  assert.equal(result.totalToday.addedPeople,1);
});

test('recent includes seven local calendar days, with period totals distinct from today and stable after reload', () => {
  const storage = memory(), ledger = createLedger({storage});
  const at = (day,hour = 12,minute = 0) => new Date(2026,9,day,hour,minute);
  const state = {people:[{id:'p1',visits:0}]};
  ledger.observe(state,at(17));
  state.people.push({id:'outside'});
  ledger.observe(state,at(18,23,59));
  state.people.push({id:'first-day'});
  state.people[0].visits = 1;
  ledger.observe(state,at(19,0));
  state.people[0].visits = 2;
  ledger.observe(state,at(24));
  state.people.push({id:'today'});
  ledger.observe(state,at(25));
  const result = ledger.recent(undefined,at(25,13));
  assert.deepEqual(result.period,{days:7,startDay:'2026-10-19',endDay:'2026-10-25'});
  assert.equal(result.entries.length,4);
  assert.deepEqual(result.entries[0].personIds,['today']);
  assert.ok(result.entries.every(entry => !entry.personIds.includes('outside')));
  assert.deepEqual(result.totalPeriod,{addedPeople:2,updatedPeople:1,addedEvents:0,newDrafts:0});
  assert.deepEqual(result.totalToday,{addedPeople:1,updatedPeople:0,addedEvents:0,newDrafts:0});
  assert.deepEqual(createLedger({storage}).recent(7,at(25,13)),result);
  assert.deepEqual(ledger.recent(1,at(25,13)),ledger.today(at(25,13)));
  assert.equal(ledger.recent(0,at(25,13)).period.days,7);
});

test('recent uses local calendar boundaries across the autumn clock change', () => {
  const script = `const {createLedger}=require('./dist/daily.js'); const ledger=createLedger(); const state={people:[]}; ledger.observe(state,'2026-10-31T18:00:00Z'); state.people.push({id:'outside'}); ledger.observe(state,'2026-11-01T06:59:00Z'); state.people.push({id:'included'}); ledger.observe(state,'2026-11-01T07:30:00Z'); process.stdout.write(JSON.stringify(ledger.recent(7,'2026-11-07T20:00:00Z')));`;
  const result = JSON.parse(execFileSync(process.execPath,['-e',script],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,TZ:'America/Los_Angeles'},encoding:'utf8'}));
  assert.deepEqual(result.period,{days:7,startDay:'2026-11-01',endDay:'2026-11-07'});
  assert.equal(result.entries.length,1);
  assert.deepEqual(result.entries[0].personIds,['included']);
  assert.equal(result.totalPeriod.addedPeople,1);
  assert.equal(result.totalToday.addedPeople,0);
});

test('recent never invents pre-baseline history or includes events beyond the requested observation time', () => {
  const ledger = createLedger();
  const initial = baseline();
  initial.people[0].createdAt = '2026-10-20T18:00:00Z';
  initial.drafts.push({id:'d1',createdAt:'2026-10-23T18:00:00Z'});
  ledger.observe(initial,START);
  assert.deepEqual(ledger.recent(7,LATER).entries,[]);
  assert.equal(ledger.recent(7,LATER).since,START);
  initial.people.push({id:'later'});
  ledger.observe(initial,'2026-10-25T18:00:00Z');
  assert.deepEqual(ledger.recent(7,LATER).entries,[]);
  const result = ledger.recent(7,'2026-10-25T18:01:00Z');
  assert.equal(result.totalPeriod.addedPeople,1);
  result.entries[0].personIds.push('forged');
  assert.equal(ledger.recent(7,'2026-10-25T18:01:00Z').totalPeriod.addedPeople,1);
});
