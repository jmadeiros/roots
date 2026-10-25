(() => {
  'use strict';
  const key = 'roots-review-journal-v1';
  let journal = {};
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) journal = saved;
  } catch {}
  const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  // Dates describe local record observations, never external discovery or verification.
  function review(scope, items, {force = false} = {}) {
    const previous = journal[scope] || {}, now = new Date().toISOString();
    const entries = Object.create(null);
    let changed = !validDate(previous.checkedAt);
    for (const item of items) {
      const signature = JSON.stringify(item.content), old = previous.entries?.[item.id];
      const exists = old && validDate(old.notedAt) && validDate(old.updatedAt);
      const same = exists && old.signature === signature;
      entries[item.id] = {notedAt: exists ? old.notedAt : now, updatedAt: same ? old.updatedAt : now, signature};
      if (!same) changed = true;
    }
    if (Object.keys(previous.entries || {}).some(id => !Object.hasOwn(entries, id))) changed = true;
    const result = {checkedAt: force || changed ? now : previous.checkedAt, entries};
    journal[scope] = result;
    if (force || changed) try { localStorage.setItem(key, JSON.stringify(journal)); } catch {}
    return result;
  }
  function formatDate(value) {
    return validDate(value) ? new Date(value).toLocaleDateString('en-GB', {day:'numeric', month:'short', ...(new Date(value).getFullYear() !== new Date().getFullYear() ? {year:'numeric'} : {})}) : 'Not checked';
  }
  function formatStamp(value) {
    return validDate(value) ? `${formatDate(value)}, ${new Date(value).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}` : 'Not checked';
  }
  window.RootsJournal = {review, formatDate, formatStamp};
})();
