/* Current-record arithmetic only. No history, date inference, or retention claims. */
((root) => {
  'use strict';

  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const idOf = value => typeof value?.id === 'string' && value.id.trim() ? value.id : null;
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const hoursValue = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
  const share = (numerator, denominator) => denominator > 0 ? numerator / denominator : null;
  const addId = (target, value) => { const id = idOf(value); if (id) target.push(id); };
  const sum = values => {
    const total = values.reduce((acc, value) => acc + value, 0);
    return Number.isFinite(total) && total <= Number.MAX_SAFE_INTEGER ? total : null;
  };

  function records(values) {
    const rows = [], seen = new Set();
    let invalid = 0, duplicates = 0, withoutId = 0;
    for (const value of Array.isArray(values) ? values : []) {
      if (!record(value)) { invalid++; continue; }
      const id = idOf(value);
      if (id && seen.has(id)) { duplicates++; continue; }
      if (id) seen.add(id); else withoutId++;
      rows.push(value);
    }
    return {rows, invalid, duplicates, withoutId};
  }

  function compute(state, profileData) {
    state = record(state) ? state : {};
    const people = records(state.people), events = records(state.events);
    const visits = {first:0, repeat:0, zero:0, unknown:0, known:0, participantCount:0, repeatShare:null, ids:{first:[], repeat:[], zero:[], unknown:[]}};
    const hours = {total:null, known:0, unknown:0, coverage:null, ids:{known:[], unknown:[]}, overflowed:false};
    const interest = {top:[], known:0, unknown:0, empty:0, coverage:null};
    const labels = new Map(), hourValues = [];
    const quality = {invalidPeople:people.invalid, duplicatePeople:people.duplicates, peopleWithoutId:people.withoutId, invalidEvents:events.invalid, duplicateEvents:events.duplicates, eventsWithoutId:events.withoutId, profileErrors:0};

    for (const original of people.rows) {
      let person = original;
      if (typeof profileData === 'function') {
        try {
          // The adapter may supplement direct fields; illustrative service-hour
          // breakdowns and generated activity are deliberately never consulted.
          const supplied = profileData({...original, ...(Array.isArray(original.interests) ? {interests:[...original.interests]} : {})});
          if (record(supplied)) person = {...original, ...supplied};
          else quality.profileErrors++;
        } catch { quality.profileErrors++; }
      }
      const visitGroup = !count(person.visits) ? 'unknown' : person.visits === 0 ? 'zero' : person.visits === 1 ? 'first' : 'repeat';
      visits[visitGroup]++;
      addId(visits.ids[visitGroup], original);
      const hasHours = hoursValue(person.hours);
      const hoursGroup = hasHours ? 'known' : 'unknown';
      hours[hoursGroup]++;
      addId(hours.ids[hoursGroup], original);
      if (hasHours) hourValues.push(person.hours);

      const values = person.interests;
      const valid = Array.isArray(values) ? values.filter(value => typeof value === 'string' && value.trim()).map(value => value.trim().replace(/\s+/g, ' ')) : [];
      if (!Array.isArray(values) || (values.length > 0 && valid.length === 0)) { interest.unknown++; continue; }
      interest.known++;
      if (valid.length === 0) interest.empty++;
      const unique = new Map(valid.map(name => [name.toLowerCase(), name]));
      for (const [key, name] of unique) {
        if (!labels.has(key)) labels.set(key, {name, count:0, personIds:[], key});
        const item = labels.get(key);
        item.count++;
        addId(item.personIds, original);
      }
    }

    visits.known = visits.first + visits.repeat + visits.zero;
    visits.participantCount = visits.first + visits.repeat;
    // A mix of recorded visits, not a longitudinal return/retention rate.
    visits.repeatShare = share(visits.repeat, visits.participantCount);
    hours.total = hours.known ? sum(hourValues) : null;
    hours.overflowed = hours.known > 0 && hours.total === null;
    hours.coverage = share(hours.known, people.rows.length);
    interest.coverage = share(interest.known, people.rows.length);
    interest.top = [...labels.values()].sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).slice(0, 5).map(({key, ...item}) => item);

    const capacity = {total:events.rows.length, valid:0, unknown:0, capacity:null, attendees:null, openPlaces:null, fillRate:null, coverage:null, ids:{valid:[], unknown:[]}, overflowed:false};
    const capacities = [], attendees = [];
    for (const event of events.rows) {
      const valid = count(event.capacity) && count(event.attendees) && event.attendees <= event.capacity;
      const group = valid ? 'valid' : 'unknown';
      capacity[group]++;
      addId(capacity.ids[group], event);
      if (valid) { capacities.push(event.capacity); attendees.push(event.attendees); }
    }
    if (capacity.valid) {
      capacity.capacity = sum(capacities);
      capacity.attendees = sum(attendees);
      capacity.overflowed = capacity.capacity === null || capacity.attendees === null;
      if (!capacity.overflowed) {
        capacity.openPlaces = capacity.capacity - capacity.attendees;
        capacity.fillRate = share(capacity.attendees, capacity.capacity);
      }
    }
    capacity.coverage = share(capacity.valid, events.rows.length);
    return {people:{total:people.rows.length, ids:people.rows.map(idOf).filter(Boolean)}, visits, hours, events:capacity, interests:interest, quality};
  }

  const api = {compute};
  if (root) root.RootsAnalytics = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : null);
