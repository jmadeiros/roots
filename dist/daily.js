/* Browser-local change history. Existing demo records establish a baseline. */
((root) => {
  'use strict';
  const VERSION = 1, KEY = 'roots-daily-v1', LIMIT = 300;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const clone = value => JSON.parse(JSON.stringify(value));
  const scalar = value => typeof value === 'number' ? (Number.isFinite(value) ? value : null)
    : typeof value === 'boolean' ? value : text(value) || null;
  const strings = value => [...new Set((Array.isArray(value) ? value : []).map(text).filter(Boolean))].sort();
  const pick = (value, fields) => Object.fromEntries(fields.map(key => [key, scalar(value[key])]));
  const clock = value => {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value ?? Date.now());
    return Number.isFinite(date.getTime()) ? date : new Date();
  };
  const dayOf = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;

  function content(kind, value) {
    if (kind === 'people') return {
      ...pick(value, ['name','email','phone','availability','hours','visits','status','consent','age','ageBand','studentStatus','school','employer','educationLevel','fullTime','weeklyHoursAvailable','serviceRequirementHours','serviceRequirementDue','communicationPreference','emailConsentRecorded','smsConsentRecorded','notes']),
      interests: strings(value.interests), declaredSkills: strings(value.declaredSkills),
      serviceHours: object(value.serviceHours) ? pick(value.serviceHours, ['target','recordedTotal','approved','pending']) : null
    };
    if (kind === 'events') return pick(value, ['title','date','start','end','time','location','description','category','attendees','capacity','status']);
    if (kind === 'opportunities') return {
      ...pick(value, ['title','provider','stage','status','statusLabel','deadlineAt','headlineBenefit','benefit','summary','description','action','matchCount']),
      requirements: strings(value.requirements),
      matches: (Array.isArray(value.matches) ? value.matches : []).filter(object).map(match => ({personId:text(match.personId), reason:text(match.reason)})).filter(match => match.personId).sort((a,b) => a.personId.localeCompare(b.personId) || a.reason.localeCompare(b.reason)),
      readiness: object(value.readiness) ? {peopleCount:scalar(value.readiness.peopleCount), personIds:strings(value.readiness.personIds), gaps:strings(value.readiness.gaps), facts:(Array.isArray(value.readiness.facts) ? value.readiness.facts : []).filter(object).map(fact => pick(fact, ['label','value'])).sort((a,b) => String(a.label).localeCompare(String(b.label)))} : null
    };
    if (kind === 'drafts') return pick(value, ['personId','personName','channel','body','subject','status']);
    return pick(value, ['kind','status','recipient','deliveredToVolunteers']);
  }

  function index(kind, values) {
    const result = Object.create(null);
    for (const value of values) {
      const id = object(value) ? text(value.id) : '';
      if (!id || own(result, id)) continue;
      const data = content(kind, value);
      result[id] = {id, label:text(value.name || value.title || value.personName), fingerprint:JSON.stringify(data),
        createdAt:timestamp(value.createdAt), data};
    }
    return result;
  }

  function createLedger(options = {}) {
    const key = text(options.key) || KEY;
    const limit = Number.isInteger(options.maxEntries) && options.maxEntries > 0 ? Math.min(options.maxEntries, LIMIT) : LIMIT;
    let ledger = {version:VERSION, since:null, lastObservedAt:null, sequence:0, snapshots:{}, entries:[]};
    let storageAvailable = false;
    const storage = () => typeof options.storage === 'function' ? options.storage() : options.storage;
    try {
      const store = storage();
      storageAvailable = Boolean(store && typeof store.getItem === 'function' && typeof store.setItem === 'function');
      const saved = storageAvailable ? JSON.parse(store.getItem(key) || 'null') : null;
      if (object(saved) && saved.version === VERSION && timestamp(saved.since) && object(saved.snapshots) && Array.isArray(saved.entries)) {
        const snapshots = {};
        for (const kind of ['people','events','opportunities','drafts','activity']) {
          if (!object(saved.snapshots[kind])) continue;
          snapshots[kind] = Object.fromEntries(Object.entries(saved.snapshots[kind]).filter(([id, value]) => id && object(value) && value.id === id && typeof value.fingerprint === 'string' && object(value.data)));
        }
        const entries = saved.entries.filter(entry => object(entry) && timestamp(entry.at) && typeof entry.kind === 'string' && typeof entry.title === 'string' && Number.isSafeInteger(entry.sequence)).slice(-limit);
        ledger = {version:VERSION, since:saved.since, lastObservedAt:timestamp(saved.lastObservedAt), sequence:Math.max(Number.isSafeInteger(saved.sequence) ? saved.sequence : 0, ...entries.map(entry => entry.sequence)), snapshots, entries};
      }
    } catch { storageAvailable = false; }

    function persist() {
      try {
        const store = storage();
        if (!store || typeof store.setItem !== 'function') { storageAvailable = false; return; }
        store.setItem(key, JSON.stringify(ledger));
        storageAvailable = true;
      } catch { storageAvailable = false; }
    }

    function add(kind, records, at, idField, title, extras = {}) {
      if (!records.length) return;
      const sequence = ++ledger.sequence;
      ledger.entries.push({id:`daily-${sequence}`, sequence, kind, at, title, count:records.length,
        [idField]:records.map(record => record.id), labels:records.map(record => record.label).filter(Boolean), ...extras});
    }

    function summary(now, startedNow = false, days = 1) {
      const date = clock(now), day = dayOf(date);
      // Calendar subtraction preserves the local midnight boundary across DST;
      // a rolling 7 * 24 hours would include part of an eighth calendar day.
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (days - 1));
      const entries = ledger.entries.filter(entry => Date.parse(entry.at) >= start.getTime() && Date.parse(entry.at) <= date.getTime()).sort((a,b) => Date.parse(b.at) - Date.parse(a.at) || b.sequence - a.sequence);
      const totals = selected => {
        const count = (kind, field) => new Set(selected.filter(entry => entry.kind === kind).flatMap(entry => Array.isArray(entry[field]) ? entry[field] : [])).size;
        return {addedPeople:count('people-added','personIds'), updatedPeople:count('people-updated','personIds'), addedEvents:count('events-added','eventIds'), newDrafts:count('draft-prepared','draftIds')};
      };
      return clone({since:ledger.since, lastObservedAt:ledger.lastObservedAt, day, startedNow, entries,
        period:{days,startDay:dayOf(start),endDay:day},
        totalToday:totals(entries.filter(entry => dayOf(new Date(entry.at)) === day)), totalPeriod:totals(entries),
        tracked:Object.fromEntries(['people','events','opportunities','drafts'].map(kind => [kind, Object.keys(ledger.snapshots[kind] || {}).length])), storageAvailable});
    }

    function observe(snapshot, now) {
      const date = clock(now), at = date.toISOString();
      if (!object(snapshot)) return summary(date);
      const incoming = {};
      for (const kind of ['people','events','opportunities','drafts','activity']) {
        if (Array.isArray(snapshot[kind])) incoming[kind] = index(kind, snapshot[kind]);
      }
      if (!Object.keys(incoming).length) return summary(date);
      if (!ledger.since) {
        ledger.since = at;
        ledger.lastObservedAt = at;
        ledger.snapshots = incoming;
        persist();
        return summary(date, true);
      }
      for (const [kind, current] of Object.entries(incoming)) {
        const previous = ledger.snapshots[kind];
        const added = Object.values(current).filter(record => !previous || !own(previous, record.id));
        const updated = previous ? Object.values(current).filter(record => own(previous, record.id) && previous[record.id].fingerprint !== record.fingerprint) : [];
        const removed = previous ? Object.values(previous).filter(record => !own(current, record.id)) : [];
        // A collection arriving asynchronously needs its own baseline. Dated
        // assistant actions after tracking began are still attributable.
        if (kind === 'drafts') {
          for (const draft of added) {
            const createdAt = draft.createdAt;
            if (createdAt && (Date.parse(createdAt) < Date.parse(ledger.since) || Date.parse(createdAt) > date.getTime())) continue;
            if (!createdAt && !previous) continue;
            if (ledger.entries.some(entry => entry.kind === 'draft-prepared' && entry.draftIds?.includes(draft.id))) continue;
            add('draft-prepared', [draft], createdAt || at, 'draftIds', `${text(draft.data.channel).toUpperCase() || 'Message'} draft prepared${draft.label ? ` for ${draft.label}` : ''}`, {personIds:strings([draft.data.personId])});
          }
        } else if (kind === 'activity') {
          // The legacy activity feed's relative labels are not timestamps.
          // A confirmed Telegram test is intentionally distinct from outreach.
          for (const activity of added) {
            if (!activity.createdAt || Date.parse(activity.createdAt) < Date.parse(ledger.since) || Date.parse(activity.createdAt) > date.getTime()) continue;
            if (activity.data.kind !== 'telegram_test_preview' || activity.data.status !== 'sent' || activity.data.deliveredToVolunteers !== false) continue;
            if (ledger.entries.some(entry => entry.activityIds?.includes(activity.id))) continue;
            add('telegram-preview-sent', [activity], activity.createdAt, 'activityIds', 'Test preview sent to your Telegram chat');
          }
        } else if (previous) {
          const ids = kind === 'people' ? 'personIds' : kind === 'events' ? 'eventIds' : 'opportunityIds';
          const noun = kind === 'people' ? ['person','people'] : kind === 'events' ? ['event','events'] : ['opportunity','opportunities'];
          const label = records => `${records.length} ${noun[records.length === 1 ? 0 : 1]}`;
          add(`${kind}-added`, added, at, ids, `${label(added)} added`);
          add(`${kind}-updated`, updated, at, ids, `${label(updated)} updated`);
          add(`${kind}-removed`, removed, at, ids, `${label(removed)} removed`);
        }
        ledger.snapshots[kind] = current;
      }
      ledger.lastObservedAt = at;
      ledger.entries = ledger.entries.slice(-limit);
      persist();
      return summary(date);
    }

    return {observe, today:now => summary(now), recent:(days = 7, now) => summary(now, false, Number.isSafeInteger(days) && days > 0 ? Math.min(days, 365) : 7)};
  }

  if (root) root.RootsDaily = createLedger({storage:() => root.localStorage});
  if (typeof module !== 'undefined' && module.exports) module.exports = {createLedger};
})(typeof window !== 'undefined' ? window : null);
