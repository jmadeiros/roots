const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const {compute} = require('../dist/analytics.js');

test('recorded visit groups preserve zero and unknown without treating the mix as retention', () => {
  const result = compute({people:[
    {id:'first', visits:1}, {id:'repeat', visits:3}, {id:'zero', visits:0},
    {id:'missing'}, {id:'text', visits:'2'}, {id:'fraction', visits:1.5},
    {id:'negative', visits:-1}, {id:'nan', visits:NaN}, {id:'bool', visits:true}
  ]});
  assert.equal(result.people.total, 9);
  assert.deepEqual([result.visits.first, result.visits.repeat, result.visits.zero, result.visits.unknown], [1, 1, 1, 6]);
  assert.equal(result.visits.known, 3);
  assert.equal(result.visits.participantCount, 2);
  assert.equal(result.visits.repeatShare, 0.5);
  assert.deepEqual(result.visits.ids.zero, ['zero']);
  assert.equal(result.hours.total, null);
  assert.equal(result.hours.unknown, 9);
});

test('hour totals include recorded zero and decimals but ignore illustrative history and missing values', () => {
  const people = [{id:'a', hours:2.5}, {id:'b', hours:0}, {id:'c', hours:'4'}, {id:'d'}, {id:'e', hours:Infinity}];
  const before = JSON.stringify(people);
  const result = compute({people}, person => ({...person, serviceHours:{recordedTotal:9000, approved:9000}, recentActivity:[{hours:9000}]}));
  assert.equal(result.hours.total, 2.5);
  assert.equal(result.hours.known, 2);
  assert.equal(result.hours.unknown, 3);
  assert.equal(result.hours.coverage, 2 / 5);
  assert.deepEqual(result.hours.ids.known, ['a', 'b']);
  assert.equal(JSON.stringify(people), before);
  assert.equal(compute({people:[{hours:0}]}).hours.total, 0);
});

test('event totals use the same valid pairs and exclude missing, overbooked, and fractional counts', () => {
  const result = compute({events:[
    {id:'a', capacity:18, attendees:12}, {id:'b', capacity:10, attendees:2},
    {id:'zero', capacity:0, attendees:0}, {id:'over', capacity:4, attendees:5},
    {id:'missing', capacity:20}, {id:'text', capacity:'9', attendees:2},
    {id:'fraction', capacity:10, attendees:1.5}
  ]}).events;
  assert.deepEqual([result.total, result.valid, result.unknown], [7, 3, 4]);
  assert.deepEqual([result.capacity, result.attendees, result.openPlaces], [28, 14, 14]);
  assert.equal(result.fillRate, 0.5, 'capacity-weighted ratio, not an average of event percentages');
  assert.equal(result.coverage, 3 / 7);
  assert.deepEqual(result.ids.valid, ['a', 'b', 'zero']);
  assert.equal(compute({events:[{capacity:0, attendees:0}]}).events.fillRate, null);
  assert.equal(compute({events:[{capacity:5}]}).events.capacity, null);
});

test('interests count each person once, normalize labels, retain missing coverage, and rank the top five deterministically', () => {
  const result = compute({people:[
    {id:'a', interests:[' Garden ', 'garden', 'Data   analysis', 'Art', 'Cooking', 'Ecology', 'Youth']},
    {id:'b', interests:['GARDEN', 'Data analysis']}, {id:'c', interests:[]},
    {id:'d'}, {id:'e', interests:[null, 4, ' ']}
  ]}).interests;
  assert.equal(result.top.length, 5);
  assert.deepEqual(result.top.map(item => [item.name.toLowerCase(), item.count]), [['data analysis', 2], ['garden', 2], ['art', 1], ['cooking', 1], ['ecology', 1]]);
  assert.deepEqual(result.top[1].personIds, ['a', 'b']);
  assert.deepEqual([result.known, result.unknown, result.empty], [3, 2, 1]);
  assert.equal(result.coverage, 3 / 5);
});

test('malformed entries, duplicate IDs, adapter failure, and aggregate overflow remain explicit', () => {
  const result = compute({people:[null, 5, [], {id:'a', hours:1}, {id:'a', hours:100}, {visits:1}], events:[false, {id:'e', capacity:4, attendees:1}, {id:'e', capacity:90, attendees:90}]}, () => { throw new Error('Bad profile'); });
  assert.equal(result.people.total, 2);
  assert.equal(result.hours.total, 1);
  assert.deepEqual(result.quality, {invalidPeople:3, duplicatePeople:1, peopleWithoutId:1, invalidEvents:1, duplicateEvents:1, eventsWithoutId:0, profileErrors:2});
  assert.equal(result.visits.first, 1);
  assert.deepEqual(result.visits.ids.first, [], 'no invented identifier is created for an unidentified record');
  const overflow = compute({people:[{hours:Number.MAX_SAFE_INTEGER}, {hours:Number.MAX_SAFE_INTEGER}], events:[{capacity:Number.MAX_SAFE_INTEGER, attendees:0}, {capacity:1, attendees:0}]});
  assert.equal(overflow.hours.total, null);
  assert.equal(overflow.hours.overflowed, true);
  assert.equal(overflow.events.capacity, null);
  assert.equal(overflow.events.fillRate, null);
  assert.equal(overflow.events.overflowed, true);
});

test('empty or absent collections yield zero counts and unavailable ratios', () => {
  for (const state of [undefined, null, {}, {people:'invalid', events:{}}]) {
    const result = compute(state);
    assert.equal(result.people.total, 0);
    assert.equal(result.visits.unknown, 0);
    assert.equal(result.visits.repeatShare, null);
    assert.equal(result.hours.total, null);
    assert.equal(result.hours.coverage, null);
    assert.equal(result.events.fillRate, null);
    assert.equal(result.interests.coverage, null);
    assert.deepEqual(result.interests.top, []);
  }
});

test('the demo snapshot has reproducible totals without deriving a time trend', () => {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/data.js'), 'utf8'), context);
  const result = compute(context.window.ROOTS_DATA);
  assert.equal(result.people.total, 35);
  assert.deepEqual([result.visits.first, result.visits.repeat, result.visits.zero, result.visits.unknown], [8, 27, 0, 0]);
  assert.equal(result.hours.total, 893);
  assert.deepEqual([result.events.capacity, result.events.attendees, result.events.openPlaces], [68, 43, 25]);
  assert.equal(result.interests.top[0].name, 'Community gardening');
  assert.equal(result.interests.top[0].count, 8);
});
