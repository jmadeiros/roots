const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const {evaluate, rank} = require('../dist/program-fit.js');

const program = (matchKind, extra = {}) => ({id:matchKind, matchKind, stage:'open', ...extra});
const student = (id, extra = {}) => ({id, studentStatus:'Student', educationLevel:'undergraduate', fullTime:true, school:'UC Davis', ...extra});
const tiers = [{people:12,amount:250}, {people:25,amount:500}, {people:50,amount:1000}, {people:75,amount:1500}];

test('college matching requires explicit student, study level, full-time status and a listed campus', () => {
  const people = [student('yes'), student('other-campus', {school:'Other college'}), student('part-time', {fullTime:false}), student('school', {educationLevel:'secondary'}), student('unknown', {studentStatus:'Not recorded'}), {id:'interest', interests:['Student', 'Training', 'Service hours'], age:20}, student('numeric', {fullTime:1})];
  const result = evaluate({people}, program('college', {campuses:['  UC   DAVIS  ']}), {fellowHostCapacity:2});
  assert.deepEqual(result.personIds, ['yes']);
  assert.equal(result.peopleCount, 1);
  assert.equal(result.matches[0].personId, 'yes');
  assert.match(result.matches[0].reason, /full-time undergraduate/);
  assert.ok(result.gaps.some(gap => /financial/.test(gap)));
  assert.ok(result.gaps.some(gap => /campus approval/i.test(gap)));
  assert.equal(result.facts.find(fact => fact.label === 'Planned host fellows').value, '2 / 2 statewide minimum');
});

test('Sacramento State requires a third host place and a separate weekly-hours check', () => {
  const state = {people:[student('sac', {school:'Sacramento State', weeklyHoursAvailable:20})]};
  const lead = program('college', {campuses:['Sacramento State']});
  const short = evaluate(state, lead, {fellowHostCapacity:2});
  assert.ok(short.gaps.some(gap => /at least 3 fellows/.test(gap)));
  assert.ok(short.gaps.some(gap => /15 hours per week/.test(gap)), 'student availability does not establish the host placement schedule');
  assert.equal(evaluate(state, lead, {fellowHostCapacity:3}).gaps.some(gap => /at least 3 fellows/.test(gap)), false);
});

test('profile adapter clears replace recorded values and adapter identity cannot create another person', () => {
  const state = {people:[student('cleared'), student('school-cleared'), student('kept')]};
  const result = evaluate(state, program('college', {campuses:['UC Davis']}), {}, person => person.id === 'cleared' ? {...person, id:'invented', studentStatus:'Not recorded'} : person.id === 'school-cleared' ? {...person, school:null} : person);
  assert.deepEqual(result.personIds, ['kept']);
  assert.equal(evaluate(state, program('education'), {}, () => ({studentStatus:null})).peopleCount, 0);
  assert.equal(evaluate(state, program('college', {campuses:['UC Davis']}), {}, () => { throw Error('profile unavailable'); }).peopleCount, 3);
});

test('education applications use recorded students, a named lead and an explicit activity plan', () => {
  const result = evaluate({people:[student('a'), student('b'), {id:'lead'}, {id:'interest', interests:['Environmental education']}]}, program('education'), {agEducationProgram:true, supervisorIds:['lead','lead','missing']});
  assert.deepEqual(result.personIds, ['a','b']);
  assert.deepEqual(result.facts.map(fact => fact.value), ['2','1','In the scenario']);
  assert.equal(result.readyCount, 3);
  assert.equal(result.checkCount, result.readyCount + result.gaps.length);
  assert.ok(result.gaps.some(gap => /applicant status/.test(gap)));
  assert.ok(result.gaps.some(gap => /budget/.test(gap)));
});

test('climate host matches only named actual supervisors and separates incoming fellow roles', () => {
  const result = evaluate({people:[{id:'a'}, {id:'b'}, student('c')]}, program('climate-host'), {supervisorIds:['a','a','missing','b'], fellowHostCapacity:2, isNonprofit:true});
  assert.deepEqual(result.personIds, ['a','b']);
  assert.equal(result.peopleCount, 2);
  assert.match(result.summary, /2 incoming funded fellow roles/);
  assert.ok(result.matches.every(match => /not counted as an incoming funded fellow/.test(match.reason)));
  assert.equal(result.readyCount, 3);
  assert.equal(evaluate({people:[{id:'a'}]}, program('climate-host'), {supervisorIds:['missing'], fellowHostCapacity:'2'}).peopleCount, 0);
  assert.ok(evaluate({people:[{id:'a'}]}, program('climate-host'), {supervisorIds:['a'], fellowHostCapacity:1}).gaps.some(gap => /at least 2 incoming/.test(gap)));
});

test('school service totals requirements without subtracting unrelated or unapproved recorded hours', () => {
  const state = {people:[student('a', {educationLevel:'secondary', serviceRequirementHours:40, hours:99, serviceHours:{approved:40}}), student('b', {educationLevel:'secondary', serviceRequirementHours:30}), student('college', {serviceRequirementHours:50}), student('zero', {educationLevel:'secondary', serviceRequirementHours:0}), student('string', {educationLevel:'secondary', serviceRequirementHours:'40'}), {id:'interest', interests:['Service hours'], hours:40}]};
  const result = evaluate(state, program('school-service'));
  assert.deepEqual(result.personIds, ['a','b']);
  assert.equal(result.facts.find(fact => fact.label === 'Required hours in total').value, '70');
  assert.match(result.summary, /70 required service hours/);
  assert.ok(result.gaps.some(gap => /existing volunteer hours have not been approved/.test(gap)));
});

test('community reimbursement matches the distinct pool to a tier but does not imply attendance or income', () => {
  const people = Array.from({length:35}, (_, index) => ({id:`p${index}`}));
  people.push({id:'p1'}, null, {id:' '});
  const result = evaluate({people}, program('community-event', {tiers}));
  assert.equal(result.peopleCount, 35);
  assert.equal(result.facts[1].value, 'Up to $500 / 25 people');
  assert.equal(result.facts[2].value, '15 more for 50 people');
  assert.ok(result.matches.every(match => /attendance has not been confirmed/.test(match.reason)));
  assert.ok(result.gaps.some(gap => /remaining provider funds/.test(gap)));
  assert.match(result.summary, /if attendance and costs qualify/);
  assert.equal(result.facts.some(fact => /\$750/.test(fact.value)), false, 'tiers are not summed');
});

test('reimbursement tiers reject malformed criteria and show a genuine shortfall for a small pool', () => {
  const result = evaluate({people:[{id:'one'}]}, program('community-event', {tiers:[{people:0,amount:99999}, {people:'1',amount:99999}, {people:2,amount:Infinity}, ...tiers]}));
  assert.equal(result.facts[1].value, 'Minimum group not yet reached');
  assert.equal(result.facts[2].value, '11 more for 12 people');
  assert.ok(result.gaps.some(gap => /at least 11 more/.test(gap)));
  assert.doesNotMatch(JSON.stringify(result.facts), /99999|Infinity/);
});

test('employer matching is exact after punctuation and optional Corporation normalization', () => {
  const state = {people:[{id:'one',employer:' Microsoft '}, {id:'two',employer:'Microsoft Corporation'}, {id:'three',employer:'MICROSOFT CORP.'}, {id:'no',employer:'Microsoft partner'}, {id:'interest',interests:['Microsoft']}]};
  const result = evaluate(state, program('employer', {employer:'Microsoft'}));
  assert.deepEqual(result.personIds, ['one','two','three']);
  assert.equal(evaluate(state, program('employer', {employer:'Microsoft'}), {}, () => ({employer:null})).peopleCount, 0);
  assert.equal(evaluate(state, program('employer')).peopleCount, 0);
});

test('rank preserves program status and details, applies categories, and sorts priority or people', () => {
  const programs = [program('college', {id:'campus',category:'placements',priority:3,campuses:['UC Davis'],stage:'campus',deadline:'2020-01-01'}), program('community-event', {id:'grant',category:'grants',priority:2,tiers}), program('education', {id:'first',category:'grants',priority:1,stage:'closed'}), program('school-service', {id:'service',category:'service',priority:4})];
  const state = {people:[student('student'), {id:'adult'}]};
  const result = rank(state, programs, {}, null, {order:'priority'});
  assert.deepEqual(result.map(item => item.id), ['first','grant','campus','service']);
  assert.equal(result[0].stage, 'closed', 'the evaluator does not reinterpret provider stages or deadlines');
  assert.equal(result[0].program, programs[2]);
  assert.deepEqual(rank(state, programs, {}, null, {order:'people'}).map(item => item.id), ['grant','first','campus','service']);
  assert.deepEqual(rank(state, programs, {}, null, {filter:'grants'}).map(item => item.id), ['first','grant']);
  assert.deepEqual(rank(state, programs, {}, null, {filter:'placements'}).map(item => item.id), ['campus']);
  assert.deepEqual(rank(state, programs, {}, null, {filter:'service'}).map(item => item.id), ['service']);
});

test('malformed input, duplicate IDs and missing criteria are safe without inventing matches', () => {
  for (const state of [undefined,null,false,[],{people:'bad'},{people:[null,[],false,{id:' '}]}]) {
    for (const kind of ['education','college','climate-host','school-service','community-event','employer']) {
      const result = evaluate(state, program(kind), null);
      assert.equal(result.peopleCount, 0);
      assert.deepEqual(result.personIds, []);
      assert.ok(result.facts.length <= 3);
      assert.equal(result.checkCount, result.readyCount + result.gaps.length);
    }
  }
  assert.equal(evaluate(null, null), null);
  assert.equal(evaluate(null, {id:'x',matchKind:'interest'}), null);
  assert.deepEqual(rank(null, null), []);
  assert.equal(rank({people:[student('a'), student('a'), {id:' '}]}, [program('education'), program('education')])[0].peopleCount, 1);
  assert.equal(rank({}, [program('education'), program('education')]).length, 1);
});

test('evaluation isolates adapter mutations and never reads interest data as program criteria', () => {
  const state = {people:[{id:'one',interests:['Student'],nested:{values:[1]}}]};
  const before = JSON.stringify(state);
  const result = evaluate(state, program('education'), {}, person => {
    person.interests.push('Grant');
    person.nested.values.push(2);
    return {...person,id:'new',name:'Student'};
  });
  assert.equal(result.peopleCount, 0);
  assert.equal(JSON.stringify(state), before);
  assert.doesNotMatch(JSON.stringify(result.matches), /Student|Grant/);
});

test('the fictional demo connects current program criteria to coherent student and host cohorts', () => {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/data.js'), 'utf8'), context);
  const state = context.window.ROOTS_DATA;
  const programs = require('../dist/programs.js');
  const results = new Map(rank(state, programs, state.scenario).map(result => [result.id,result]));
  assert.equal(results.get('o04').peopleCount, 20);
  assert.equal(results.get('o01').peopleCount, 12);
  assert.equal(results.get('o02').peopleCount, 2);
  assert.equal(results.get('o05').peopleCount, 8);
  assert.equal(results.get('o05').facts.find(fact => fact.label === 'Required hours in total').value, '320');
  assert.equal(results.get('o13').peopleCount, 35);
  assert.equal(results.get('o13').facts.find(fact => fact.label === 'Tier to plan for').value, 'Up to $500 / 25 people');
  assert.equal(results.get('o12').peopleCount, 0);
  assert.ok(results.get('o01').gaps.some(gap => /at least 3 fellows/.test(gap)));
  assert.ok(results.get('o02').personIds.every(id => state.scenario.supervisorIds.includes(id)));
});
