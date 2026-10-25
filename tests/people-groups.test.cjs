const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const {compute} = require('../dist/people-groups.js');

test('interest groups count people once, normalize labels and prioritize the largest groups', () => {
  const result = compute({people:[
    {id:'a', name:'Avery', interests:[' Garden ', 'GARDEN', 'Data   analysis', null]},
    {id:'b', name:'Blake', interests:['garden', 'Art']},
    {id:'c', name:'Casey', interests:['Data analysis']},
    {id:'d', name:'Drew', interests:[]}, {id:'e', name:'Ellis'}
  ]});
  assert.deepEqual(result.interests.map(group => [group.label, group.count]), [['Data analysis', 2], ['Garden', 2], ['Art', 1]]);
  assert.deepEqual(result.interests[1].personIds, ['a', 'b']);
  assert.equal(result.coverage.people, 5);
  assert.equal(result.coverage.interests, 3);
  assert.ok(result.interests.every(group => group.nextThought));
});

test('participation separates one, repeat, zero and unknown without using illustrative history', () => {
  const result = compute({people:[
    {id:'one', visits:1}, {id:'repeat', visits:3}, {id:'zero', visits:0},
    {id:'missing'}, {id:'text', visits:'1'}, {id:'fraction', visits:1.5},
    {id:'negative', visits:-1}, {id:'large', visits:Infinity}, {id:'boolean', visits:true}
  ]}, [], person => ({...person, recentActivity:[{date:'2026-10-24'}], lastVisit:'2026-10-24'}));
  assert.deepEqual(result.participation.map(group => [group.id, group.count]), [
    ['participation-one', 1], ['participation-repeat', 1], ['participation-zero', 1], ['participation-unknown', 6]
  ]);
  assert.equal(result.coverage.visits, 3);
  assert.deepEqual(result.participation[3].personIds, ['missing', 'text', 'fraction', 'negative', 'large', 'boolean']);
  assert.doesNotMatch(JSON.stringify(result.participation), /2026-10-24|retention rate|overdue/);
});

test('age groups use only explicit ageGroup or ageBand strings, never names, interests or inferred ages', () => {
  const result = compute({people:[
    {id:'a', name:'Student', interests:['Service hours']},
    {id:'b', name:'Teen', birthDate:'2010-01-01', age:16},
    {id:'c', ageGroup:' 18–24 '}, {id:'d', ageBand:'18–24'},
    {id:'e', ageGroup:'', ageBand:'65+'},
    {id:'f', ageGroup:['Under 18']}, {id:'g', ageBand:65},
    {id:'h', ageGroup:'Not shared', ageBand:'18–24'}
  ]});
  assert.deepEqual(result.ageGroups.map(group => [group.label, group.count]), [['18–24', 2], ['65+', 1], ['Not shared', 1]]);
  assert.deepEqual(result.ageGroups[0].personIds, ['c', 'd']);
  assert.equal(result.coverage.ageGroups, 4);
  assert.equal(result.ageGroups.some(group => group.personIds.includes('a') || group.personIds.includes('b')), false);
  const adapted = compute({people:[{id:'unknown'}, {id:'recorded', ageBand:'65+'}]}, [], person => ({...person, ageGroup:'Under 18', ageBand:'Under 18'}));
  assert.deepEqual(adapted.ageGroups.map(group => [group.label, group.personIds]), [['65+', ['recorded']]], 'profile enrichment cannot create or replace explicitly recorded demographic groups');
  assert.equal(adapted.coverage.ageGroups, 1);
});

test('related leads require actual interest overlap and usable unique IDs', () => {
  const result = compute({people:[{id:'a', interests:['Community gardening', 'Art']}]}, [
    {id:'garden', title:'Garden project', interests:[' COMMUNITY gardening ', 'community gardening']},
    {id:'garden', title:'Duplicate', interests:['Art']},
    {id:'unrelated', title:'Mapping project', interests:['Cartography']},
    {id:'untitled', interests:['Art']}, {title:'No ID', interests:['Art']}
  ]);
  assert.deepEqual(result.interests.find(group => group.label === 'Community gardening').opportunityIds, ['garden']);
  assert.deepEqual(result.interests.find(group => group.label === 'Art').opportunityIds, []);
  assert.deepEqual(result.leads.map(lead => lead.id), ['garden', 'unrelated']);
});

test('malformed records and adapter failures are safe, and source records are not mutated', () => {
  for (const state of [undefined, null, false, [], {people:'bad'}, {people:[null, [], false, {id:' '}]}]) {
    const result = compute(state, null, () => { throw new Error('broken'); });
    assert.deepEqual(result.interests, []);
    assert.deepEqual(result.participation, []);
    assert.deepEqual(result.ageGroups, []);
    assert.equal(result.coverage.people, 0);
  }
  const state = {people:[{id:'a', name:'Avery', interests:['Art'], visits:1}, {id:'a', name:'Duplicate', interests:['Sport'], visits:99}]};
  const before = JSON.stringify(state);
  const result = compute(state, [], person => {
    person.interests.push('Garden');
    return {...person, id:'invented', name:'Invented'};
  });
  assert.equal(JSON.stringify(state), before);
  assert.equal(result.coverage.people, 1);
  assert.equal(result.people[0].id, 'a');
  assert.equal(result.people[0].name, 'Avery');
  assert.equal(result.interests.find(group => group.label === 'Sport'), undefined);
  assert.deepEqual(compute(state, [], () => { throw new Error('broken'); }).interests[0].personIds, ['a']);
});

test('current demo groups show eight gardeners and no fabricated age groups', () => {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/data.js'), 'utf8'), context);
  const result = compute(context.window.ROOTS_DATA);
  assert.equal(result.coverage.people, 35);
  assert.equal(result.interests[0].label, 'Community gardening');
  assert.equal(result.interests[0].count, 8);
  assert.deepEqual(result.participation.map(group => group.count), [8, 27]);
  assert.equal(result.coverage.ageGroups, 0);
  assert.deepEqual(result.ageGroups, []);
});
