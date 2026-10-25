const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

function harness(now = '2026-10-24T12:00:00-07:00') {
  const RealDate = Date;
  class Clock extends RealDate { static now() { return new RealDate(now).valueOf(); } }
  const context = {window:{},document:{addEventListener(){}},Date:Clock};
  for (const file of ['data.js','programs.js','program-fit.js','opportunities.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),context);
  const data=context.window.ROOTS_DATA;
  context.window.RootsOpportunities.configure({data,getState:()=>data});
  return {api:context.window.RootsOpportunities,data,programs:context.window.ROOTS_PROGRAMS};
}

test('the catalog exposes actual programme criteria and never falls back to interest counts',()=>{
  const {api,data}=harness();
  const initial=api.list();
  assert.equal(initial.length,7);
  assert.equal(initial.find(p=>p.id==='o04').matchCount,20);
  assert.equal(initial.find(p=>p.id==='o01').matchCount,12);
  assert.equal(initial.find(p=>p.id==='o05').matchCount,8);
  assert.equal(initial.find(p=>p.id==='o02').matchCount,2);
  const before=initial.map(p=>[p.id,p.matchCount]);
  for(const person of data.people) person.interests=[];
  assert.deepEqual(api.list().map(p=>[p.id,p.matchCount]),before);
  const school=api.list().find(p=>p.id==='o05');
  assert.ok(school.readiness.facts.some(f=>f.label==='Required hours in total'&&f.value==='320'));
  assert.ok(api.list().find(p=>p.id==='o01').readiness.gaps.some(g=>g.includes('3 fellows')));
});

test('an expired published deadline closes the programme in every catalog surface and removes application encouragement',()=>{
  const {api}=harness('2026-11-02T09:00:01-08:00');
  const grant=api.list().find(p=>p.id==='o04');
  assert.equal(grant.stage,'closed');
  assert.match(grant.status,/deadline passed/);
  assert.match(grant.action,/new round/);
  assert.ok(grant.priority>100);
  assert.equal(grant.sourceCheckedAt,'2026-10-24');
});

test('real source review and local school proposal remain distinct in the assistant snapshot',()=>{
  const {api}=harness();
  const rows=api.list();
  assert.equal(rows.find(p=>p.id==='o05').sourceCheckedAt,null);
  assert.equal(rows.find(p=>p.id==='o05').sourceUrl,null);
  assert.ok(rows.filter(p=>p.id!=='o05').every(p=>p.sourceCheckedAt==='2026-10-24'&&p.sources.length>0));
  assert.equal(rows.find(p=>p.id==='o13').beneficiary,'Reimbursement to the eligible event organizer');
  assert.match(rows.find(p=>p.id==='o01').beneficiary,/students/);
  assert.equal(rows.find(p=>p.id==='o03').stage,'upcoming');
  assert.ok(!rows.some(p=>p.id==='o07'||p.id==='o09'));
});


test('unpublished grant rules cannot inherit student eligibility or cohort matches',()=>{
  const {api}=harness();
  const watch=api.list().find(p=>p.id==='o03');
  assert.equal(watch.matchKind,'watchlist');
  assert.equal(watch.matchCount,0);
  assert.equal(watch.matches.length,0);
  assert.equal(watch.readiness.readyCount,0);
  assert.match(watch.readiness.summary,/No cohort or eligibility match/);
  assert.ok(!watch.readiness.facts.some(f=>f.label==='Recorded students'));
});
