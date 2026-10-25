const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const {compute, rankOpportunities} = require('../dist/connections.js');

test('opportunity priority distinguishes reach from closer interest overlap without inventing scores or monetary value', () => {
  const state={people:[
    {id:'a',name:'A',interests:['Growing','Training']},
    {id:'b',name:'B',interests:['Growing']},
    {id:'c',name:'C',interests:['Growing']}
  ]};
  const leads=[{id:'broad',title:'Broad lead',interests:['Growing']},{id:'close',title:'Focused lead',interests:['Training','Growing']}];
  // Both reach three people; only one also supports a second stated interest.
  assert.deepEqual(rankOpportunities(state,leads).map(x=>x.id),['broad','close']);
  const closer=rankOpportunities(state,leads,{order:'closest'});
  assert.deepEqual(closer.map(x=>x.id),['close','broad']);
  assert.equal(closer[0].peopleCount,3);
  assert.equal(closer[0].closeCount,1);
  assert.deepEqual(closer[0].matches[0],{personId:'a',interests:['Growing','Training']});
  assert.doesNotMatch(JSON.stringify(closer),/amount|eligible|score|funding/);
});

test('priority uses distinct recorded people and normalized interests, then responds to changed records', () => {
  const state={people:[{id:'a',name:'A',interests:[' Gardening ','gardening']},{id:'a',name:'Duplicate',interests:['Training']},null,{id:'b',name:'B',interests:['Training']}]};
  const leads=[{id:'grow',title:'Grow',interests:['GARDENING','gardening']},{id:'learn',title:'Learn',interests:['Training']}];
  let result=rankOpportunities(state,leads);
  assert.deepEqual(result.map(x=>[x.id,x.peopleCount,x.closeCount]),[['grow',1,0],['learn',1,0]]);
  assert.deepEqual(result[0].interests,[{label:'Gardening',count:1}]);
  state.people[3].interests=['Gardening'];
  result=rankOpportunities(state,leads);
  assert.deepEqual(result.map(x=>[x.id,x.peopleCount]),[['grow',2]]);
  assert.deepEqual(rankOpportunities(null,[null]),[]);
});

test('support filter uses lead type, never an illustrative budget or assumed personal circumstances', () => {
  const state={people:[{id:'a',name:'A',interests:['Gardening'],age:20}]};
  const leads=['Grant','Fellowship','In-kind benefit','Employer benefit','Project','Partnership'].map((type,i)=>({id:String(i),title:type,type,interests:['Gardening'],total:999999}));
  leads.push({id:'funded-partner',title:'Funded pathway',type:'Partnership',supportKind:'funding',interests:['Gardening']});
  const result=rankOpportunities(state,leads,{supportOnly:true});
  assert.deepEqual(result.map(x=>x.id),['0','1','2','3','funded-partner']);
  assert.doesNotMatch(JSON.stringify(result),/999999|age|student/);
});

const leads = [
  {id:'o05', title:'School service-hour partnership'},
  {id:'o04', title:'CalAgPlate education program'},
  {id:'o02', title:'Climate Action Corps'}
];
const garden = {id:'project-garden', title:'Garden signs and learning walks', sourceOpportunityId:'o04', team:[
  {personId:'a', role:'Learning walks', reason:'Environmental education and youth mentoring'},
  {personId:'b', role:'Garden map', reason:'GIS mapping and data analysis'}
]};

test('service-hour connection counts actual interests and valid one-visit records without using illustrative targets', () => {
  const result = compute({people:[
    {id:'a', name:'Avery Adams', interests:[' Service   hours ', 'service hours'], visits:1},
    {id:'b', name:'Blake Brown', interests:['Service hours'], visits:'1'},
    {id:'c', name:'Casey Clark', interests:['Service hours'], visits:3},
    {id:'d', name:'Drew Davis', interests:['Youth mentoring'], visits:1}
  ]}, leads, [], person => ({...person, serviceHours:{target:40, approved:900}, recentActivity:[{date:'2020-01-01'}]}));
  assert.equal(result.length, 1);
  const connection = result[0];
  assert.deepEqual(connection.personIds, ['a', 'b', 'c']);
  assert.deepEqual(connection.opportunityIds, ['o05']);
  assert.match(connection.summary, /Avery Adams, Blake Brown and Casey Clark/);
  assert.match(connection.summary, /1 has one recorded visit/);
  assert.match(connection.evidence[1].value, /1 with one visit, among 2 valid visit counts; 1 unknown/);
  assert.doesNotMatch(JSON.stringify(connection), /2020-01-01|900|40-hour|overdue|not returned/);
});

test('project connections resolve current team IDs and role reasons rather than fixed demo names or skills', () => {
  const state = {people:[
    {id:'a', name:'Avery Adams', interests:['Environmental education']},
    {id:'b', name:'Blake Brown', interests:['GIS mapping']},
    {id:'unrelated', name:'Casey Clark', interests:['Composting']}
  ]};
  const [connection] = compute(state, leads, [garden]);
  assert.deepEqual(connection.personIds, ['a', 'b']);
  assert.deepEqual(connection.projectIds, ['project-garden']);
  assert.match(connection.summary, /Avery Adams and Blake Brown have interests/);
  assert.match(connection.evidence.find(item => item.label === 'Avery Adams').value, /learning walks; lists environmental education/);
  assert.ok(connection.limitations.some(item => item.includes('not verified skills')));
  assert.ok(connection.limitations.some(item => item.includes('funding') && item.includes('unverified')));
  const changed = {...garden, sourceOpportunityId:'o02', team:[garden.team[1], {personId:'unrelated', role:'Compost signs', reason:'Composting'}]};
  const [updated] = compute(state, leads, [changed]);
  assert.deepEqual(updated.personIds, ['b', 'unrelated']);
  assert.deepEqual(updated.opportunityIds, ['o02']);
  assert.match(updated.summary, /Climate Action Corps/);
  assert.doesNotMatch(updated.summary, /Avery|CalAgPlate/);
});

test('missing records, absent interests and unsupported team reasons cannot create connections', () => {
  const state = {people:[
    {id:'a', name:'Avery Adams', interests:['Environmental education']},
    {id:'b', name:'Blake Brown', interests:['Art']}
  ]};
  assert.deepEqual(compute(state, [], [garden]), []);
  assert.deepEqual(compute(state, leads, [garden]), [], 'a second supported team member is required');
  assert.deepEqual(compute(state, leads, [{...garden, team:[garden.team[0], {personId:'b', role:'Maps', reason:'Cartography'}]}]), [], 'art does not match the middle of cartography');
  assert.deepEqual(compute({people:[{id:'a', name:'Avery Adams'}]}, leads, []), []);
  assert.deepEqual(compute({people:[{id:'a', interests:['Service hours']}, {name:'No ID', interests:['Service hours']}]}, leads, []), []);
});

test('malformed inputs and adapters are safe; duplicate IDs use the first record', () => {
  for (const state of [null, undefined, [], 'invalid', {}, {people:[null, 4, [], {id:' '}] }]) {
    assert.deepEqual(compute(state, null, {bad:true}, () => { throw new Error('broken'); }), []);
  }
  const state = {people:[{id:'a', name:'Avery Adams', interests:['Service hours']}, {id:'a', name:'Duplicate', interests:['Other']}]};
  for (const adapter of [null, {}, () => null, () => [], () => { throw new Error('broken'); }]) {
    const [connection] = compute(state, [...leads, {id:'o05', title:'Wrong duplicate'}], [], adapter);
    assert.deepEqual(connection.personIds, ['a']);
    assert.match(connection.summary, /Avery Adams/);
    assert.doesNotMatch(connection.summary, /Duplicate|Wrong duplicate/);
  }
});

test('profile adaptation uses current direct fields without changing source identity or mutating input', () => {
  const state = {people:[{id:'a', name:'Avery Adams', interests:['Service hours'], visits:1}]};
  const before = JSON.stringify(state);
  const [connection] = compute(state, leads, [], person => {
    person.interests.push('Gardening');
    return {...person, id:'invented', name:'Invented Name', visits:2};
  });
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(connection.personIds, ['a']);
  assert.match(connection.summary, /Avery Adams/);
  assert.doesNotMatch(connection.summary, /Invented Name|one recorded visit/);
  assert.deepEqual(compute(state, leads, [], person => ({...person, interests:[]})), []);
});

test('current demo records yield three traceable connections, including five service-hour interests', () => {
  const context = {window:{}, document:{addEventListener() {}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/data.js'), 'utf8'), context);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/opportunities.js'), 'utf8'), context);
  const source = context.window.ROOTS_DATA;
  context.window.RootsOpportunities.configure({getState:() => source});
  const result = compute(source, context.window.RootsOpportunities.list(), context.window.RootsOpportunities.projects());
  assert.equal(result.length, 3);
  assert.deepEqual(result[0].personIds, ['p01', 'p07', 'p18', 'p20', 'p35']);
  assert.match(result[0].summary, /3 have one recorded visit/);
  assert.deepEqual(result[1].personIds, ['p08', 'p03', 'p05']);
  assert.deepEqual(result[1].opportunityIds, ['o04']);
  assert.deepEqual(result[2].personIds, ['p04', 'p19', 'p21']);
  assert.deepEqual(result[2].opportunityIds, ['o02']);
  for (const connection of result) {
    for (const id of connection.personIds) assert.ok(source.people.some(person => person.id === id));
    assert.ok(connection.evidence.length >= 3);
    assert.ok(connection.nextStep && connection.suggestedPrompt);
    assert.equal(connection.checkedAt, undefined);
    assert.equal(connection.discoveredAt, undefined);
  }
});


test('participation order prioritizes practical return-visit ideas only when actual interests match', () => {
  const state = {people:[
    {id:'a',name:'A',interests:['Service hours']},
    {id:'b',name:'B',interests:['Growing']},
    {id:'c',name:'C',interests:['Growing']}
  ]};
  const leads = [
    {id:'o01',title:'Campus route',interests:['Growing']},
    {id:'o05',title:'Service hours',interests:['Service hours']},
    {id:'o07',title:'Tools',interests:['Growing']},
    {id:'o09',title:'Training',interests:['Training']},
    {id:'o12',title:'Employer policy',interests:[]}
  ];
  assert.deepEqual(rankOpportunities(state,leads,{order:'participation'}).map(item=>item.id),['o05','o07','o01']);
  assert.deepEqual(rankOpportunities(state,leads,{order:'reach'}).map(item=>item.id),['o01','o07','o05']);
  state.people[0].interests = [];
  assert.deepEqual(rankOpportunities(state,leads,{order:'participation'}).map(item=>item.id),['o07','o01']);
});
