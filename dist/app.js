import { renderView, opportunities, people } from './views.js';

const initial = { saved: [], filter: 'all', search: '', peopleSearch: '', goal: 'earn', checks: {}, buildChecks: {}, rsvp: false, invite: false, expandedPerson: null, projectName: 'Neighborhood regeneration skills series', employees: 6, hours: 3 };
let stored = {};
try { stored = JSON.parse(localStorage.getItem('roots-demo-v1') || '{}'); } catch {}
const state = { ...structuredClone(initial), ...stored, search: '', peopleSearch: '', filter: 'all', invite: false, expandedPerson: null };
if (!Array.isArray(state.saved)) state.saved = [];
if (!state.checks || typeof state.checks !== 'object') state.checks = {};
if (!state.buildChecks || typeof state.buildChecks !== 'object') state.buildChecks = {};
let menuOpen = false;
let current = { mode: 'workspace', page: 'opportunities' };
let toastTimeout;
let projectDraft = state.projectName;
let dialogTrigger = null;
function focusKey(element) {
  if (!element) return null;
  if (element.id) return { id:element.id };
  if (element.dataset?.action) return { action:element.dataset.action, item:element.dataset.id };
  if (element.tagName === 'A') return { href:element.getAttribute('href') };
  return null;
}
function restoreFocus(key) {
  if (!key) return;
  const target = key.id ? document.getElementById(key.id) : key.action ? app.querySelector(`[data-action="${CSS.escape(key.action)}"]${key.item ? `[data-id="${CSS.escape(key.item)}"]` : ''}`) : app.querySelector(`a[href="${CSS.escape(key.href)}"]`);
  target?.focus({preventScroll:true});
}
function closeMenu() { menuOpen = false; render(); app.querySelector('.mobile-menu')?.focus({preventScroll:true}); }

const app = document.querySelector('#app');
const dialog = document.querySelector('#detail-dialog');
const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const paths = {
  sprout: '<path d="M12 21v-9m0 4C5 16 3 12 4 8c5-1 8 2 8 6m0-4c0-5 3-7 8-7 1 5-2 9-8 9M7 21h10"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  heart: '<path d="M20.3 5.8a4.8 4.8 0 0 0-6.8 0L12 7.3l-1.5-1.5a4.8 4.8 0 0 0-6.8 6.8L12 21l8.3-8.4a4.8 4.8 0 0 0 0-6.8Z"/>',
  check: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 10 2 2 5-5m-7 9h8"/>',
  overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-3-5"/>',
  funding: '<path d="m3 8 9-5 9 5H3Zm2 2v8m7-8v8m7-8v8M3 21h18"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-12 4h1m4 0h1"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 1 1 5.8 1c-.9 1.2-2.9 1.2-2.9 3m0 4h.01"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  bookmark: '<path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4V4Z"/>',
  external: '<path d="M14 3h7v7m0-7L11 13m-1-8H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>'
};
const icon = name => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sprout}</svg>`;
const navs = {
  workspace: [['opportunities','Opportunities','compass'],['project','Project plan','folder'],['volunteers','For volunteers','heart'],['build','Build plan','check']],
  dashboard: [['overview','Overview','overview'],['people','People','people'],['funding','Funding','funding'],['events','Events','calendar']]
};

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const mode = parts[0] === 'dashboard' ? 'dashboard' : 'workspace';
  const page = navs[mode].some(n => n[0] === parts[1]) ? parts[1] : navs[mode][0][0];
  return { mode, page };
}

function persist() {
  try { localStorage.setItem('roots-demo-v1', JSON.stringify(state)); } catch {}
}

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 4200);
}

function render(focusId) {
  const active = document.activeElement;
  const rememberedFocus = app.contains(active) ? focusKey(active) : null;
  const focus = focusId ? document.getElementById(focusId) : null;
  const caret = focus && ['text','search'].includes(focus.type) ? focus.selectionStart : null;
  current = route();
  const { mode, page } = current;
  const pageName = navs[mode].find(n => n[0] === page)[1];
  document.title = `${pageName} · Roots`;
  app.innerHTML = `<div class="app-shell${menuOpen ? ' menu-open' : ''}">
    <button class="mobile-overlay" data-action="close-menu" aria-label="Close navigation"></button>
    <aside class="sidebar" id="sidebar" aria-label="Main navigation"${window.matchMedia('(max-width:700px)').matches && !menuOpen ? ' inert' : ''}>
      <a class="brand" href="#/${mode}/${navs[mode][0][0]}" aria-label="Roots home"><span class="brand-mark">${icon('sprout')}</span><span class="brand-word">roots</span></a>
      <p class="org-name">East Bay Permaculture Guild</p>
      <nav class="view-switch" aria-label="Choose interface"><a href="#/workspace/opportunities" aria-current="${mode === 'workspace'}">Workspace</a><a href="#/dashboard/overview" aria-current="${mode === 'dashboard'}">Dashboard</a></nav>
      <div class="nav-label">${mode === 'workspace' ? 'Your workspace' : 'Your community'}</div>
      <nav class="nav-list" aria-label="${mode === 'workspace' ? 'Workspace' : 'Dashboard'} sections">${navs[mode].map(([id,label,glyph]) => `<a class="nav-link" href="#/${mode}/${id}"${id === page ? ' aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span>${id === 'opportunities' ? `<span class="nav-count">${opportunities.length}</span>` : ''}</a>`).join('')}</nav>
      <div class="sidebar-note"><div class="note-sprout">${icon('sprout')}</div><p>A little support.<br>A lot of possibility.</p></div>
      <div class="sidebar-bottom"><span class="profile-initials">EG</span><div class="profile-text">Guild workspace<small>Community, growing together</small></div></div>
    </aside>
    <div class="app-main"${menuOpen && window.matchMedia('(max-width:700px)').matches ? ' inert' : ''}>
      <header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-menu" data-action="menu" aria-label="Open navigation" aria-controls="sidebar" aria-expanded="${menuOpen}">${icon('menu')}</button><span class="parent-crumb">${mode === 'workspace' ? 'Workspace' : 'Community'}</span><span class="slash">/</span><strong>${pageName}</strong></div><div class="topbar-right"><span class="demo-label"><i class="demo-dot"></i>Interactive concept</span><button class="icon-button" aria-label="About this concept" data-action="help">${icon('help')}</button></div></header>
      <main class="page" id="main" tabindex="-1"><div class="page-content">${renderView(mode, page, {...state, projectDraft})}</div><footer class="page-footer"><span>${icon('sprout')} Illustrative people & project. Program eligibility is conditional.</span><span class="footer-right">Research snapshot · Oct 24, 2026</span></footer></main>
    </div>
  </div>`;
  if (!focusId) restoreFocus(rememberedFocus);
  if (focusId) {
    const next = document.getElementById(focusId);
    next?.focus({ preventScroll: true });
    if (caret !== null && next?.setSelectionRange) next.setSelectionRange(caret, caret);
  }
}

function openDialog(html) { const wasOpen = dialog.open; if (!wasOpen) dialogTrigger = focusKey(document.activeElement); dialog.innerHTML = html; if (!wasOpen) dialog.showModal(); else dialog.querySelector('[data-action=save-opportunity]')?.focus(); }
function dialogTop(title, tag = '') { return `<div class="dialog-header"><div>${tag ? `<span class="status warm">${esc(tag)}</span>` : ''}<h2 id="detail-title">${esc(title)}</h2></div><button class="icon-button" data-action="close-dialog" aria-label="Close details">${icon('close')}</button></div>`; }
function openOpportunity(id) {
  const item = opportunities.find(op => op.id === id);
  if (!item) return;
  const detail = Array.isArray(item.detail) ? `<ul>${item.detail.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : `<p>${esc(item.detail || item.description)}</p>`;
  openDialog(`${dialogTop(item.name,item.status)}<div class="dialog-body"><div class="amount">${esc(item.amount)}</div><p>${esc(item.description)}</p>${detail}<p class="small-note">This is a research snapshot. Confirm current terms with the provider before making a commitment.</p></div><div class="dialog-footer"><button class="btn btn-primary" data-action="save-opportunity" data-id="${esc(id)}">${icon('bookmark')}${state.saved.includes(id) ? 'Remove from saved' : 'Save opportunity'}</button><a class="btn" href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">Official criteria ${icon('external')}</a></div>`);
}

function handleAction(event) {
  if (event.target.closest('.skip-link')) { event.preventDefault(); document.querySelector('#main')?.focus(); return; }
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled) return;
  const { action, id } = control.dataset;
  switch (action) {
    case 'menu': menuOpen = true; render(); app.querySelector('.nav-link[aria-current=page]')?.focus(); break;
    case 'close-menu': closeMenu(); break;
    case 'close-dialog': dialog.close(); restoreFocus(dialogTrigger); break;
    case 'help':
      openDialog(`${dialogTop('A community workspace, taking shape')}<div class="help-copy"><p>Roots connects opportunities, community projects, and people. Switch between <strong>Workspace</strong> and <strong>Dashboard</strong> to explore both interface concepts.</p><p>The people, metrics, and project are illustrative. The benefit examples come from the supplied October 24 research snapshot; eligibility and availability still need confirmation.</p><p>Saved opportunities, project edits, and checklists stay in this browser. Invitations are previews. No applications, messages, or registrations are sent.</p></div><div class="dialog-footer"><button class="btn btn-primary" data-action="close-dialog">Got it</button><button class="btn btn-text" data-action="reset">Reset demo changes</button></div>`); break;
    case 'opportunity': openOpportunity(id); break;
    case 'save-opportunity': {
      const wasSaved = state.saved.includes(id);
      state.saved = wasSaved ? state.saved.filter(x => x !== id) : [...state.saved, id];
      persist(); render();
      if (dialog.open) openOpportunity(id);
      notify(wasSaved ? 'Opportunity removed from saved.' : 'Opportunity saved to your project plan.');
      break;
    }
    case 'plan': if(dialog.open) dialog.close(); location.hash = '#/workspace/project'; break;
    case 'filter': state.filter = id; render(); break;
    case 'goal': state.goal = id; render(); break;
    case 'invite': state.invite = !state.invite; render(); break;
    case 'person': state.expandedPerson = state.expandedPerson === id ? null : id; render(); break;
    case 'event-rsvp': state.rsvp = !state.rsvp; persist(); render(); notify(state.rsvp ? 'Interest noted in this demo. No RSVP was sent.' : 'Demo interest removed.'); break;
    case 'check': state.checks[id] = control.checked; persist(); render(); break;
    case 'build-check': state.buildChecks[id] = control.checked; persist(); render(); break;
    case 'save-project': {
      const input = document.getElementById('project-name');
      const value = input?.value.trim();
      if (!value) { input?.setCustomValidity('Add a project name before saving.'); input?.reportValidity(); break; }
      state.projectName = value.slice(0,140); projectDraft = state.projectName; persist(); render(); notify('Project name saved in this browser.'); break;
    }
    case 'reset': Object.keys(state).forEach(k => delete state[k]); Object.assign(state, structuredClone(initial)); projectDraft = state.projectName; persist(); dialog.close(); render(); notify('Demo restored to its starting point.'); break;
    case 'clear-search': state.search = ''; state.peopleSearch = ''; render(); break;
  }
}

document.addEventListener('click', handleAction);
document.addEventListener('input', event => {
  const input = event.target;
  if (input.id === 'opportunity-search') { state.search = input.value; render(input.id); }
  if (input.id === 'people-search') { state.peopleSearch = input.value; render(input.id); }
  if (input.id === 'project-name') { input.setCustomValidity(''); projectDraft = input.value; }
  if (input.id === 'employees' || input.id === 'hours') {
    const value = Number(input.value);
    const max = 1000;
    if (!Number.isFinite(value) || value < 0 || value > max || (input.id === 'employees' && !Number.isInteger(value))) { input.setCustomValidity(`Enter a number from 0 to ${max}.`); input.reportValidity(); const output = document.querySelector('#match-total'); if(output) output.textContent = '—'; return; }
    input.setCustomValidity(''); state[input.id] = value; persist();
    const output = document.querySelector('#match-total');
    if (output) output.textContent = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:2 }).format(state.employees * state.hours * 25);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuOpen) { closeMenu(); return; }
  if (event.key === 'Tab' && menuOpen) {
    const controls = [...app.querySelectorAll('.sidebar a, .sidebar button')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
dialog.addEventListener('close', () => restoreFocus(dialogTrigger));
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
window.addEventListener('hashchange', () => { menuOpen = false; render(); window.scrollTo({ top:0, behavior:'instant' }); document.querySelector('#main')?.focus({preventScroll:true}); });
render();

window.matchMedia('(max-width:700px)').addEventListener('change', () => { menuOpen = false; render(); });
