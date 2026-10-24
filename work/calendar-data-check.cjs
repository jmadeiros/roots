const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const calendarSource = fs.readFileSync(path.join(root, 'dist/calendar.js'), 'utf8');
const dataSource = fs.readFileSync(path.join(root, 'dist/data.js'), 'utf8');

function fixture(saved = {}) {
  const listeners = {};
  const context = {
    window: {},
    localStorage: { getItem: () => JSON.stringify(saved), setItem: () => {} },
    document: {
      addEventListener: (type, callback) => (listeners[type] ||= []).push(callback),
      querySelector: () => null,
    },
  };
  vm.createContext(context);
  vm.runInContext(dataSource, context);
  vm.runInContext(calendarSource, context);
  const customEvents = [
    { id: 'custom-zero', title: 'No invented attendees', date: '2026-11-14', capacity: 2, attendees: 0, time: '9:00 AM – 12:00 PM' },
    { id: 'custom-duration', title: 'Short shift', date: '2026-11-17', capacity: 2, attendees: 2, time: '9:30 AM – 10:45 AM' },
    { id: 'custom-december', title: 'Outside seed months', date: '2026-12-14', capacity: 3, attendees: 3, hours: 2.25 },
    { id: 'custom-april', title: 'Historical explicit event', date: '2026-04-03', capacity: 1, attendees: 1, start: '13:00', end: '17:00' },
  ];
  const api = context.window.RootsCalendar;
  api.configure({
    getPeople: () => context.window.ROOTS_DATA.people,
    getEvents: () => [...context.window.ROOTS_DATA.events, ...customEvents],
    render: () => {},
  });
  let monthIndex=9;
  function moveMonth(delta) {
    monthIndex+=delta;
    const current=new Date(2026,monthIndex,1);
    const value=`${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}`;
    for (const callback of listeners.change) {
      callback({target:{id:'calendar-report-month',value}});
    }
  }
  return { api, moveMonth };
}

const base = fixture();
const onDate = (records, id, date) => records.filter(record => record.eventId === id && record.date === date);
let rows = base.api.records();
assert.equal(onDate(rows, 'e01', '2026-10-31').length, 12);
assert.equal(onDate(rows, 'e01', '2026-10-31')[0].eventTitle, 'Saturday in the garden');
assert.equal(rows.filter(record => record.status === 'Scheduled').length, 12, 'Future recurring attendance must not be invented');
assert(rows.some(record => record.status === 'Attended'), 'Historical demonstration records should remain');

base.moveMonth(1);
rows = base.api.records();
for (const [id, day, count, hours] of [
  ['e02', '2026-11-03', 8, 1.5],
  ['e03', '2026-11-07', 16, 3],
  ['e04', '2026-11-11', 7, 2],
  ['custom-duration', '2026-11-17', 2, 1.25],
]) {
  const eventRows = onDate(rows, id, day);
  assert.equal(eventRows.length, count, `${id} must agree with the event list`);
  assert(eventRows.every(record => record.status === 'Scheduled' && record.hours === hours));
}
assert.equal(rows.filter(record => record.eventId === 'custom-zero').length, 0, 'New events start without invented volunteers');
assert.equal(rows.filter(record => record.eventId === 'e03' && record.date !== '2026-11-07').length, 0, 'No synthetic future native planting dates');

base.moveMonth(1);
rows = base.api.records();
assert.equal(onDate(rows, 'custom-december', '2026-12-14').length, 3, 'December is outside demo generation, not outside real event support');
assert(onDate(rows, 'custom-december', '2026-12-14').every(record => record.hours === 2.25));

base.moveMonth(-8);
rows = base.api.records();
assert.equal(onDate(rows, 'custom-april', '2026-04-03').length, 1);
assert.equal(onDate(rows, 'custom-april', '2026-04-03')[0].hours, 4);

const edited = fixture({ overrides: { 'e02|2026-11-03': { expected: 5, attended: 0, hours: 1 }, 'e03|2026-11-07': { expected: 0, attended: 0, hours: 3 } } });
edited.moveMonth(1);
rows = edited.api.records();
assert.equal(onDate(rows, 'e02', '2026-11-03').length, 5, 'Saved attendance overrides still take precedence');
assert(onDate(rows, 'e02', '2026-11-03').every(record => record.hours === 1));
assert.equal(onDate(rows, 'e03', '2026-11-07').length, 0, 'A zero expected override removes participation records');

console.log('PASS: exact event dates/counts, no invented future attendees, parsed/explicit duration, history cutoff, off-season event support, and saved overrides.');
