const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../dist/journal.js'), 'utf8');
function harness(storage = new Map()) {
  let clock = '2026-10-24T12:00:00Z';
  const window = {};
  class Clock extends Date { constructor(value) { super(value === undefined ? clock : value); } }
  vm.runInNewContext(source, {window, Date:Clock, localStorage:{getItem:key=>storage.get(key), setItem:(key,value)=>storage.set(key,value)}});
  return {journal:window.RootsJournal, storage, advance:value=>{clock=value;}};
}
test('unchanged observations and reloads retain dates; explicit checks only update the check time', () => {
  const h = harness(), items = [{id:'a',content:{people:3}}];
  const first = h.journal.review('notices', items);
  h.advance('2026-10-25T12:00:00Z');
  assert.equal(h.journal.review('notices', items).checkedAt, first.checkedAt);
  const checked = h.journal.review('notices', items, {force:true});
  assert.notEqual(checked.checkedAt, first.checkedAt);
  assert.equal(checked.entries.a.updatedAt, first.entries.a.updatedAt);
  const reload = harness(h.storage).journal.review('notices', items);
  assert.equal(reload.entries.a.notedAt, first.entries.a.notedAt);
  assert.equal(reload.checkedAt, checked.checkedAt);
});
test('a changed finding gets an update date while preserving its first observation and other scopes', () => {
  const h = harness(), items = [{id:'a',content:{people:3}}];
  const first = h.journal.review('notices', items);
  const opportunities = h.journal.review('opportunities', items);
  h.advance('2026-10-25T12:00:00Z');
  const changed = h.journal.review('notices', [{id:'a',content:{people:4}}]);
  assert.equal(changed.entries.a.notedAt, first.entries.a.notedAt);
  assert.notEqual(changed.entries.a.updatedAt, first.entries.a.updatedAt);
  assert.equal(h.journal.review('opportunities', items).checkedAt, opportunities.checkedAt);
});
test('invalid stored state and dates recover without inventing a prior review', () => {
  const storage = new Map([['roots-review-journal-v1','{"notices":{"checkedAt":"bad","entries":{"a":{"notedAt":"bad"}}}}']]);
  const h = harness(storage), result = h.journal.review('notices', [{id:'a',content:'example'}]);
  assert.equal(result.entries.a.notedAt, result.checkedAt);
  assert.equal(h.journal.formatStamp('invalid'), 'Not checked');
});
