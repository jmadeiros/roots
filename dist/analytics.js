(function () {
  'use strict';

  const DAY = 86400000;
  const STATUSES = ['Attended', 'Missed', 'Scheduled'];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const number = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);
  const validRecords = records => (Array.isArray(records) ? records : []).filter(record => record && STATUSES.includes(record.status));
  const validDonations = records => (Array.isArray(records) ? records : []).filter(record => record && record.amount !== null && record.amount !== '' && Number.isFinite(Number(record.amount)) && Number(record.amount) >= 0);
  const personKey = record => record.personId == null ? null : String(record.personId);
  const contribution = record => record.status === 'Attended' && Number.isFinite(Number(record.hours)) ? Math.max(0, Number(record.hours)) : 0;
  const dateValue = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
    const timestamp = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : null;
  };
  const shortDate = timestamp => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(timestamp);
  const weekStart = timestamp => timestamp - ((new Date(timestamp).getUTCDay() + 6) % 7) * DAY;

  function summarize(records) {
    const source = validRecords(records);
    const people = new Set();
    const attendance = new Map();
    const summary = { attended: 0, missed: 0, scheduled: 0, completed: 0, attendanceRate: null, hours: 0, totalVolunteers: 0, returnRate: null, returning: 0, totalActive: 0 };
    source.forEach(record => {
      const person = personKey(record);
      if (person !== null) people.add(person);
      summary[record.status.toLowerCase()] += 1;
      summary.hours += contribution(record);
      if (record.status === 'Attended' && person !== null) attendance.set(person, (attendance.get(person) || 0) + 1);
    });
    summary.completed = summary.attended + summary.missed;
    summary.attendanceRate = summary.completed ? summary.attended / summary.completed * 100 : null;
    summary.hours = Math.round(summary.hours * 100) / 100;
    summary.totalVolunteers = people.size;
    summary.totalActive = attendance.size;
    summary.returning = [...attendance.values()].filter(count => count >= 2).length;
    summary.returnRate = summary.totalActive ? summary.returning / summary.totalActive * 100 : null;
    return summary;
  }

  function weeklyGroups(records, options) {
    const groups = new Map();
    const dates = [];
    records.forEach(record => {
      const date = dateValue(record.date);
      if (date === null) return;
      dates.push(date);
      const start = weekStart(date);
      if (!groups.has(start)) groups.set(start, { start, Attended: 0, Missed: 0, Scheduled: 0 });
      groups.get(start)[record.status] += 1;
    });
    const scopeStart = dateValue(options.startDate);
    const scopeEnd = dateValue(options.endDate);
    if (scopeStart !== null && scopeEnd !== null && scopeEnd >= scopeStart) dates.push(scopeStart, scopeEnd);
    if (!dates.length) return [];
    const first = weekStart(Math.min(...dates));
    const last = weekStart(Math.max(...dates));
    // Keep long, unrestricted histories compact without silently dropping their counts.
    if ((last - first) / (7 * DAY) <= 52) {
      for (let start = first; start <= last; start += 7 * DAY) {
        if (!groups.has(start)) groups.set(start, { start, Attended: 0, Missed: 0, Scheduled: 0 });
      }
    }
    return [...groups.values()].sort((a, b) => a.start - b.start);
  }

  function metric(label, value, detail, title) {
    return `<div class="analytics-metric"${title ? ` title="${esc(title)}"` : ''}><dt>${esc(label)}</dt><dd class="analytics-metric-value">${value}</dd><dd class="analytics-metric-detail">${esc(detail)}</dd></div>`;
  }

  function weeklyChart(records, options) {
    const weeks = weeklyGroups(records, options);
    if (!weeks.length) return `<div class="analytics-chart-empty"><strong>No shifts in this selection</strong><p>Choose another date range or include more events to see participation over time.</p></div>`;
    const max = Math.max(4, Math.ceil(Math.max(...weeks.map(week => week.Attended + week.Missed + week.Scheduled)) / 4) * 4);
    const chart = weeks.map(week => {
      const total = week.Attended + week.Missed + week.Scheduled;
      const height = total / max * 100;
      return `<div class="analytics-week-column"><div class="analytics-week-bar-area"><span class="analytics-week-count" style="bottom:calc(${height}% + 6px)">${total}</span><div class="analytics-week-stack" style="height:${height}%">${STATUSES.map(status => week[status] ? `<span class="analytics-segment analytics-segment-${status.toLowerCase()}" style="height:${week[status] / total * 100}%"></span>` : '').join('')}</div></div><span class="analytics-week-label">${esc(shortDate(week.start))}</span></div>`;
    }).join('');
    const table = `<table class="analytics-data-table"><caption>Volunteer shifts by week; weeks begin Monday</caption><thead><tr><th scope="col">Week of</th>${STATUSES.map(status => `<th scope="col">${status}</th>`).join('')}<th scope="col">Total</th></tr></thead><tbody>${weeks.map(week => `<tr><th scope="row">${esc(shortDate(week.start))}</th>${STATUSES.map(status => `<td>${week[status]}</td>`).join('')}<td>${week.Attended + week.Missed + week.Scheduled}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">Total</th>${STATUSES.map(status => `<td>${weeks.reduce((total, week) => total + week[status], 0)}</td>`).join('')}<td>${weeks.reduce((total, week) => total + week.Attended + week.Missed + week.Scheduled, 0)}</td></tr></tfoot></table>`;
    return `<div class="analytics-weekly-scroll"${weeks.length > 6 ? ' tabindex="0" role="region" aria-label="Weekly participation chart; scroll to see all weeks"' : ''}><div class="analytics-weekly-chart" style="min-width:${Math.max(260, weeks.length * 52 + 28)}px" aria-hidden="true"><div class="analytics-chart-scale"><span>${max}</span><span>${max / 2}</span><span>0</span></div><div class="analytics-week-columns" style="grid-template-columns:repeat(${weeks.length},minmax(0,1fr))">${chart}</div></div></div><div class="analytics-chart-footer"><span>Week of</span><ul class="analytics-legend" aria-label="Chart legend"><li><span class="analytics-legend-swatch analytics-segment-attended"></span>Attended</li><li><span class="analytics-legend-swatch analytics-segment-missed"></span>Missed</li><li><span class="analytics-legend-swatch analytics-segment-scheduled"></span>Scheduled</li></ul></div><details class="analytics-chart-details"><summary>View weekly counts</summary><div class="analytics-table-scroll">${table}</div></details>`;
  }

  function fundraisingChart(donations, raised, goal, options) {
    const amounts = new Map();
    donations.forEach(donation => {
      const date = dateValue(donation.date);
      if (date === null) return;
      const start = weekStart(date);
      amounts.set(start, (amounts.get(start) || 0) + Number(donation.amount));
    });
    const weeks = weeklyGroups(donations.map(donation => ({ date: donation.date, status: 'Scheduled' })), options);
    const max = Math.max(0, ...amounts.values());
    const chart = donations.length && weeks.length ? `<ul class="analytics-category-list" aria-label="Donation amounts by week">${weeks.map(week => {
      const amount = Math.round((amounts.get(week.start) || 0) * 100) / 100;
      return `<li><div class="analytics-category-heading"><span>Week of ${esc(shortDate(week.start))}</span><strong>${esc(money(amount))}</strong></div><div class="analytics-category-track" aria-hidden="true"><span style="width:${max ? amount / max * 100 : 0}%"></span></div><div class="analytics-category-detail"><span>${number(week.Scheduled)} ${week.Scheduled === 1 ? 'donation' : 'donations'}</span><span>${raised ? Math.round(amount / raised * 100) : 0}% of funds raised</span></div></li>`;
    }).join('')}</ul>` : `<div class="analytics-chart-empty"><strong>No donations in this selection</strong><p>Choose another date range or include a fundraising activity to see recorded giving.</p></div>`;
    const goalMarkup = goal > 0 ? `<div class="analytics-goal"><div class="analytics-goal-heading"><span>Fundraising goal</span><strong>${Math.round(raised / goal * 100)}%</strong></div><div class="analytics-goal-track" role="progressbar" aria-label="Fundraising goal progress" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(raised, goal)}" aria-valuetext="${esc(money(raised))} raised toward ${esc(money(goal))} goal"><span style="width:${Math.min(raised / goal * 100, 100)}%"></span></div><p>${esc(money(raised))} raised <span>of ${esc(money(goal))} goal</span></p></div>` : `<p class="analytics-category-total">Total funds raised <strong>${esc(money(raised))}</strong></p>`;
    return chart + goalMarkup;
  }

  function insight(records, summary, donations, raised) {
    if (!records.length && !donations.length) return 'No attendance or donation records match this selection. Try a wider date range or include more activities.';
    const repeat = summary.totalActive ? `${number(summary.returning)} of ${number(summary.totalActive)} attendees joined two or more shifts in this selection.` : '';
    if (donations.length) return `Recorded giving totals ${money(raised)} across ${number(donations.length)} ${donations.length === 1 ? 'donation' : 'donations'}.${repeat ? ' ' + repeat : ''}`;
    if (summary.attended) return `${number(summary.totalActive)} ${summary.totalActive === 1 ? 'volunteer contributed' : 'volunteers contributed'} ${number(summary.hours)} hours across ${number(summary.attended)} attended ${summary.attended === 1 ? 'shift' : 'shifts'}. ${repeat}`;
    if (summary.scheduled) return `${number(summary.scheduled)} upcoming ${summary.scheduled === 1 ? 'shift is' : 'shifts are'} scheduled. Attendance and contributed hours will appear as those shifts are completed.`;
    return `${number(summary.missed)} ${summary.missed === 1 ? 'shift was' : 'shifts were'} missed in this selection. No contributed hours have been recorded.`;
  }

  function render(records, options = {}) {
    const source = validRecords(records);
    const summary = summarize(source);
    const donations = validDonations(options.donations);
    const raised = Math.round(donations.reduce((total, donation) => total + Number(donation.amount), 0) * 100) / 100;
    const goal = Number.isFinite(options.fundraisingGoal) ? Math.max(0, options.fundraisingGoal) : 0;
    const rowCount = Number.isFinite(options.rowCount) ? Math.max(0, options.rowCount) : null;
    const percent = value => value === null ? '<span aria-label="Not available">—</span>' : `${Math.round(value)}<span class="analytics-value-unit">%</span>`;
    const scope = options.label || 'Current calendar selection';
    return `<section class="analytics-section" aria-labelledby="analytics-heading"><header class="analytics-heading"><div><h2 id="analytics-heading">Your impact, at a glance.</h2><p>${esc(scope)}${rowCount === null ? '' : ` <span aria-hidden="true">·</span> ${number(rowCount)} ${rowCount === 1 ? 'activity' : 'activities'}`}</p></div><span class="analytics-scope-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg>Follows your calendar filters</span></header><dl class="analytics-metrics">${metric('Attendance rate', percent(summary.attendanceRate), summary.completed ? `${number(summary.attended)} attended · ${number(summary.missed)} missed` : 'No completed shifts yet', 'Attended shifts divided by attended and missed shifts. Scheduled shifts are excluded.')}${metric('Hours contributed', number(summary.hours), `${number(summary.attended)} attended ${summary.attended === 1 ? 'shift' : 'shifts'}`, 'Hours from attended shifts only.')}${metric('Funds raised', esc(money(raised)), goal > 0 ? `${Math.round(raised / goal * 100)}% of ${money(goal)} goal` : 'Recorded donations in this selection', 'Sum of recorded donation amounts in this calendar selection.')}${metric('Donations received', number(donations.length), 'Recorded in this selection', 'Number of donation records in the current calendar selection.')}</dl><div class="analytics-panels"><article class="analytics-panel analytics-weekly-panel"><header class="analytics-panel-heading"><h3>Participation by week</h3><p>Volunteer shifts · attended, missed, and scheduled</p></header>${weeklyChart(source, options)}</article><article class="analytics-panel analytics-category-panel"><header class="analytics-panel-heading"><h3>Fundraising by week</h3><p>Recorded donations · actual amounts</p></header>${fundraisingChart(donations, raised, goal, options)}</article></div><aside class="analytics-insight"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20v-8m0 3c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-3c0-5 3-8 8-8 0 5-3 8-8 8Z"/></svg><p>${esc(insight(source, summary, donations, raised))}</p></aside></section>`;
  }

  window.RootsAnalytics = { summarize, render };
})();
