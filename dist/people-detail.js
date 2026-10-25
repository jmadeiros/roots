/* Expanded profiles for fictional Roots volunteers. No messages are sent here. */
(() => {
  'use strict';

  const STORAGE_KEY = 'roots-people-details-v1';
  const tabNames = ['Profile', 'Activity', 'Notes'];
  const studentStatuses = ['Not recorded', 'Student', 'Not a student'];
  const DEMO_CONTEXT = 'Fictional demo scenario';
  let api = null;
  let activeId = null;
  let activeTab = 'Profile';
  let profileOpener = null;
  let edits = {};
  const drafts = new Map();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) edits = parsed;
  } catch { /* An unavailable store must not prevent opening a profile. */ }

  const escapeText = value => api.esc(value);
  const currentPerson = () => api?.getState().people.find(person => person.id === activeId);
  const dateLabel = date => new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${date}T12:00:00Z`));
  const numberLabel = value => new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(value);
  const validText = (value, limit = 2000) => typeof value === 'string' ? value.slice(0, limit) : '';

  function storedFor(person) {
    const entry = edits[person.id];
    return entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : {};
  }

  function sampleHistory(person) {
    const id = /^p(\d{2})$/.exec(person.id);
    const index = id ? Number(id[1]) : 0;
    if (!index || index > 35 || !person.visits || !person.hours) return [];
    const descriptions = {
      'Community gardening': 'Garden care and seasonal planting',
      'Service hours': 'Community garden volunteer shift',
      'Climate action': 'Community climate project',
      'Environmental science': 'Garden learning session',
      'Data analysis': 'Community impact reporting',
      'GIS mapping': 'Mapping our growing spaces',
      'Composting': 'Compost care and garden maintenance',
      'Community outreach': 'Community welcome and outreach',
      'Photography': 'Documenting the garden',
      'Native plants': 'Native habitat care',
      'Food recovery': 'Harvest and community food sharing',
      'Environmental education': 'Hands-on garden learning',
      'Youth mentoring': 'Community learning support',
      'Web development': 'Digital volunteer support',
      'Carpentry': 'Garden maintenance and repairs',
      'Cooking': 'Harvest preparation',
      'Ecosystem restoration': 'Habitat care and restoration'
    };
    const recentHours = Math.round((Number(person.hours) / Number(person.visits)) * 10) / 10;
    return Array.from({length: Math.min(Number(person.visits), 3)}, (_, offset) => {
      const date = new Date(Date.UTC(2026, 9, 24 - (index % 4) * 7 - offset * 7));
      return {
        date: date.toISOString().slice(0, 10),
        title: descriptions[person.interests?.[offset % person.interests.length]] || 'Community volunteer shift',
        hours: recentHours,
        approval: offset === 0 && person.visits > 1 ? 'Pending review' : 'Approved',
        illustrative: true
      };
    });
  }

  function profileData(person) {
    const stored = storedFor(person);
    const context = {};
    const personContextSource = {};
    for (const field of ['studentStatus', 'school', 'employer']) {
      const isLocal = Object.prototype.hasOwnProperty.call(stored, field);
      const value = validText(isLocal ? stored[field] : person[field], 160).trim();
      context[field] = field === 'studentStatus' ? (studentStatuses.includes(value) ? value : 'Not recorded') : (value || null);
      const recorded = field === 'studentStatus' ? context[field] !== 'Not recorded' : Boolean(context[field]);
      personContextSource[field] = recorded ? (isLocal ? 'Locally recorded' : person.contextSource === DEMO_CONTEXT ? DEMO_CONTEXT : 'Recorded in profile') : 'Not recorded';
    }
    const contextFields = {
      age: value => Number.isInteger(value) && value >= 0 && value <= 120 ? value : null,
      ageBand: value => validText(value, 40).trim() || null,
      educationLevel: value => ['secondary', 'undergraduate'].includes(value) ? value : null,
      fullTime: value => typeof value === 'boolean' ? value : null,
      weeklyHoursAvailable: value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 168 ? value : null,
      serviceRequirementHours: value => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 1000 ? value : null,
      serviceRequirementDue: value => /^\d{4}-\d{2}-\d{2}$/.test(validText(value, 10)) ? value : null
    };
    for (const [field, normalize] of Object.entries(contextFields)) {
      const isLocal = Object.prototype.hasOwnProperty.call(stored, field);
      if (!isLocal && !Object.prototype.hasOwnProperty.call(person, field)) continue;
      context[field] = normalize(isLocal ? stored[field] : person[field]);
      personContextSource[field] = context[field] === null ? 'Not recorded' : isLocal ? 'Locally recorded' : person.contextSource === DEMO_CONTEXT ? DEMO_CONTEXT : 'Recorded in profile';
    }
    // A cleared or changed student status must not leave a hidden school-based
    // eligibility assertion behind from the demonstration record.
    if (context.studentStatus !== 'Student') {
      for (const field of ['educationLevel', 'fullTime', 'serviceRequirementHours', 'serviceRequirementDue']) {
        if (Object.prototype.hasOwnProperty.call(context, field)) {
          context[field] = null;
          personContextSource[field] = 'Not recorded';
        }
      }
    }
    if (Object.prototype.hasOwnProperty.call(stored, 'age') && context.age === null && !Object.prototype.hasOwnProperty.call(stored, 'ageBand')) {
      context.ageBand = null;
      personContextSource.ageBand = 'Not recorded';
    }
    const activity = sampleHistory(person);
    const pending = activity.find(item => item.approval === 'Pending review')?.hours || 0;
    const scenarioTarget = context.serviceRequirementHours ?? null;
    const sampleTarget = scenarioTarget === null && person.interests?.includes('Service hours') ? 40 : null;
    const hasTarget = Object.prototype.hasOwnProperty.call(stored, 'target');
    const suppliedTarget = stored.target === null ? null : Number(stored.target);
    const target = hasTarget ? (Number.isFinite(suppliedTarget) && suppliedTarget > 0 && suppliedTarget <= 1000 ? suppliedTarget : null) : scenarioTarget ?? sampleTarget;
    if (hasTarget && Object.prototype.hasOwnProperty.call(context, 'serviceRequirementHours')) {
      context.serviceRequirementHours = context.studentStatus === 'Student' ? target : null;
      personContextSource.serviceRequirementHours = context.serviceRequirementHours === null ? 'Not recorded' : 'Locally recorded';
      if (context.serviceRequirementHours === null) {
        context.serviceRequirementDue = null;
        personContextSource.serviceRequirementDue = 'Not recorded';
      }
    }
    return {
      ...person,
      ...context,
      personContextSource,
      availability: validText(stored.availability, 160) || person.availability,
      declaredSkills: Array.isArray(stored.skills) ? stored.skills.filter(skill => typeof skill === 'string').slice(0, 12).map(skill => skill.slice(0, 60)) : [],
      communicationPreference: ['Email', 'SMS', 'Either'].includes(stored.channel) ? stored.channel : 'Not recorded',
      phone: null,
      emailConsentRecorded: false,
      smsConsentRecorded: Boolean(person.consent),
      lastVisit: activity[0]?.date || null,
      lastVisitIsIllustrative: Boolean(activity.length),
      recentActivity: activity,
      serviceHours: {
        recordedTotal: Number(person.hours) || 0,
        approved: Math.max(0, Math.round(((Number(person.hours) || 0) - pending) * 10) / 10),
        pending,
        target,
        targetSource: hasTarget ? 'Locally recorded' : scenarioTarget !== null ? personContextSource.serviceRequirementHours : (sampleTarget ? 'Illustrative target' : 'Not recorded'),
        approvalSource: activity.length ? 'Illustrative breakdown of recorded hours' : 'No approval records'
      },
      notes: validText(stored.notes),
      notesUpdatedAt: validText(stored.notesUpdatedAt, 40) || null,
      preferencesUpdatedAt: validText(stored.preferencesUpdatedAt, 40) || null,
      dataSource: 'Fictional demo profile; additional history and approval states are illustrative.'
    };
  }

  function matchesFor(person, profile) {
    const programmes = window.RootsOpportunities?.list?.() || [];
    const routePriority = opportunity => profile.educationLevel === 'secondary' && opportunity.matchKind === 'school-service'
      || profile.educationLevel === 'undergraduate' && opportunity.matchKind === 'college' ? 0 : 1;
    return programmes.flatMap(opportunity => {
      const match = opportunity.matches?.find(value => value.personId === person.id);
      return match ? [{opportunity, reason:match.reason}] : [];
    }).sort((a, b) => routePriority(a.opportunity) - routePriority(b.opportunity)
      || (a.opportunity.priority ?? 100) - (b.opportunity.priority ?? 100)).slice(0, 2);
  }

  function preferenceForm(person) {
    const profile = profileData(person);
    const draft = drafts.get(person.id)?.preferences || {
      availability: profile.availability,
      skills: profile.declaredSkills.join(', '),
      channel: profile.communicationPreference,
      target: ['Locally recorded', 'Recorded in profile', DEMO_CONTEXT].includes(profile.serviceHours.targetSource) ? (profile.serviceHours.target ?? '') : '',
      studentStatus: profile.studentStatus,
      school: profile.school || '',
      employer: profile.employer || ''
    };
    return `<details class="people-edit" id="people-edit-preferences"><summary>People context & preferences ${api.icon('chevron-down')}</summary>
      <form id="people-preferences-form" class="people-edit-form">
        <div class="form-field"><label for="people-declared-skills">Declared skills</label><input id="people-declared-skills" name="skills" value="${escapeText(draft.skills)}" maxlength="600" placeholder="e.g. Gardening, photography"><p class="hint">Add skills the volunteer has shared, separated by commas. Interests are kept separately.</p></div>
        <div class="form-field"><label for="people-availability">Availability</label><input id="people-availability" name="availability" value="${escapeText(draft.availability)}" maxlength="160" required></div>
        <div class="form-row"><div class="form-field"><label for="people-preferred-channel">Preferred contact method</label><select id="people-preferred-channel" name="channel">${['Not recorded', 'Email', 'SMS', 'Either'].map(channel => `<option${draft.channel === channel ? ' selected' : ''}>${channel}</option>`).join('')}</select></div><div class="form-field"><label for="people-hour-target">Service-hour target</label><input id="people-hour-target" name="target" type="number" min="1" max="1000" step="1" value="${escapeText(draft.target)}" placeholder="Not recorded"><p class="hint">${profile.serviceHours.targetSource === DEMO_CONTEXT ? 'Demo goal. Replace it with a confirmed requirement.' : 'Optional. Add a confirmed target.'}</p></div></div>
        <p class="hint">Student and employer details are optional. Record only what this person has shared.</p>
        <div class="form-field"><label for="people-student-status">Student status</label><select id="people-student-status" name="studentStatus">${studentStatuses.map(status => `<option${draft.studentStatus === status ? ' selected' : ''}>${status}</option>`).join('')}</select></div>
        <div class="form-row"><div class="form-field"><label for="people-school">School / college (optional)</label><input id="people-school" name="school" value="${escapeText(draft.school)}" maxlength="160" placeholder="Not recorded"></div><div class="form-field"><label for="people-employer">Employer (optional)</label><input id="people-employer" name="employer" value="${escapeText(draft.employer)}" maxlength="160" placeholder="Not recorded"></div></div>
        <p class="people-form-note">A contact preference does not grant permission to send messages.</p>
        <button class="button primary" type="submit">Save preferences ${api.icon('check')}</button>
      </form></details>`;
  }

  function participationContext(profile) {
    const facts = [
      ['Age', profile.age === undefined || profile.age === null ? null : `${profile.age} · ${profile.ageBand || 'Age range not recorded'}`],
      ['Education', profile.educationLevel ? `${profile.fullTime ? 'Full-time ' : ''}${profile.educationLevel === 'secondary' ? 'secondary-school student' : 'undergraduate'}` : null],
      ['Weekly capacity', profile.weeklyHoursAvailable === undefined || profile.weeklyHoursAvailable === null ? null : `${numberLabel(profile.weeklyHoursAvailable)} hours`],
      ['School service goal', profile.serviceRequirementHours ? `${numberLabel(profile.serviceRequirementHours)} hours${profile.serviceRequirementDue ? ` by ${dateLabel(profile.serviceRequirementDue)}` : ''}` : null]
    ].filter(([, value]) => value !== null);
    if (!facts.length) return '';
    const isDemo = Object.values(profile.personContextSource).includes(DEMO_CONTEXT);
    return `<div class="people-field-group"><div class="people-section-heading"><h3>Participation context</h3>${isDemo ? '<span class="people-example-label">Demo context</span>' : ''}</div><dl class="people-facts">${facts.map(([label, value]) => `<div><dt>${escapeText(label)}</dt><dd>${escapeText(value)}</dd></div>`).join('')}</dl>${isDemo ? '<p class="people-caption">Age, education and capacity are fictional scenario details for exploring program fit. They are not verified facts about a real person.</p>' : ''}</div>`;
  }

  function profilePanel(person) {
    const profile = profileData(person);
    const matches = matchesFor(person, profile);
    const project = api.getState().project;
    const projectSkills = String(project?.skills || '').toLowerCase();
    const sharedProjectInterests = person.interests.filter(interest => projectSkills.includes(interest.toLowerCase()));
    return `<section class="people-section"><div class="people-section-heading"><h3>Contact & communication</h3></div>
      <dl class="people-facts"><div><dt>Email</dt><dd>${escapeText(person.email)}</dd></div><div><dt>Phone</dt><dd class="people-unrecorded">Not recorded</dd></div><div><dt>Contact preference</dt><dd>${escapeText(profile.communicationPreference)}</dd></div><div><dt>SMS permission</dt><dd><span class="people-consent ${person.consent ? 'is-recorded' : ''}">${api.icon(person.consent ? 'check' : 'info')}${person.consent ? 'Recorded in demo' : 'Not recorded'}</span></dd></div></dl>
      <p class="people-caption">Email permission is not recorded. ${person.consent ? 'A phone number is still needed for SMS.' : 'SMS outreach stays excluded until permission is recorded.'}</p>
    </section>
    <section class="people-section"><h3>What they bring</h3><div class="people-field-group"><span class="people-field-label">Interests</span><div class="tags">${person.interests.map(interest => `<span class="tag">${escapeText(interest)}</span>`).join('')}</div></div>
      <div class="people-field-group"><span class="people-field-label">Declared skills</span>${profile.declaredSkills.length ? `<div class="tags">${profile.declaredSkills.map(skill => `<span class="tag">${escapeText(skill)}</span>`).join('')}</div>` : '<p class="people-unrecorded">Skills haven’t been recorded yet.</p>'}</div>
      <div class="people-availability">${api.icon('clock')}<div><span class="people-field-label">Usually available</span><p>${escapeText(profile.availability)}</p></div></div>
      <dl class="people-facts"><div><dt>Student status</dt><dd>${escapeText(profile.studentStatus)}</dd></div><div><dt>School / college</dt><dd>${escapeText(profile.school || 'Not recorded')}</dd></div><div><dt>Employer</dt><dd>${escapeText(profile.employer || 'Not recorded')}</dd></div></dl>
      ${participationContext(profile)}
      ${preferenceForm(person)}
    </section>
    <section class="people-section"><div class="people-section-heading"><h3>Service hours</h3><span class="people-example-label">Example tracking</span></div>
      <div class="people-hours"><div><strong>${numberLabel(profile.serviceHours.approved)}<small> h</small></strong><span>Approved</span></div><div><strong>${numberLabel(profile.serviceHours.pending)}<small> h</small></strong><span>Pending review</span></div><div><strong>${profile.serviceHours.target === null ? '—' : numberLabel(profile.serviceHours.target)}${profile.serviceHours.target === null ? '' : '<small> h</small>'}</strong><span>${profile.serviceHours.targetSource === 'Illustrative target' ? 'Example target' : 'Target'}</span></div></div>
      <p class="people-caption">The approval split is illustrative and adds up to the ${numberLabel(person.hours)} hours in this profile. ${profile.serviceHours.targetSource === DEMO_CONTEXT ? 'The school service goal belongs to the fictional demo scenario; recorded hours are not automatically approved toward it.' : profile.serviceHours.targetSource === 'Illustrative target' ? 'The 40-hour target is an example, not a school requirement.' : profile.serviceHours.target === null ? 'No service-hour target has been recorded.' : profile.serviceHours.targetSource === 'Recorded in profile' ? 'The target is recorded in this profile.' : 'The target was saved locally for this profile.'}</p>
    </section>
    <section class="people-section"><div class="people-section-heading"><h3>Programme routes</h3><span class="people-example-label">Recorded context</span></div>
      ${matches.length ? `<div class="people-matches">${matches.map(({opportunity, reason}) => `<button class="people-match" data-people-action="opportunity" data-opportunity-id="${escapeText(opportunity.id)}"><span><strong>${escapeText(opportunity.title)}</strong><small>${escapeText(reason)}</small></span>${api.icon('arrow')}</button>`).join('')}</div><p class="people-caption">These routes use the same criteria and profile context as Opportunities. Review programme requirements before making a commitment.</p>` : '<p class="people-unrecorded">No programme route matches this profile’s recorded context yet.</p>'}
      ${project ? `<div class="people-project"><span class="people-field-label">Your project plan</span><strong>${escapeText(project.title)}</strong><p>${sharedProjectInterests.length ? `Their interest in ${escapeText(sharedProjectInterests.map(interest => interest.toLowerCase()).join(' and '))} could contribute to this plan.` : 'Review the project’s roles and availability with this volunteer before assigning them.'}</p><button class="text-button" data-action="project">Review project plan ${api.icon('arrow')}</button></div>` : '<p class="people-project-empty">No project placement recorded.</p>'}
    </section>`;
  }

  function activityPanel(person) {
    const profile = profileData(person);
    return `<section class="people-section people-section-first"><div class="people-section-heading"><h3>Recent visits</h3><span class="people-example-label">Illustrative history</span></div>
      ${profile.recentActivity.length ? `<p class="people-section-intro">A sample of ${person.name.split(' ')[0] ? escapeText(person.name.split(' ')[0]) + '’s' : 'their'} ${person.visits} recorded ${person.visits === 1 ? 'visit' : 'visits'}. These examples show how an attendance record would look.</p><ol class="people-history">${profile.recentActivity.map(item => `<li><span class="people-history-mark">${api.icon(item.approval === 'Approved' ? 'check' : 'clock')}</span><div><time datetime="${item.date}">${dateLabel(item.date)}</time><strong>${escapeText(item.title)}</strong><p>${numberLabel(item.hours)} service hours <span>·</span> ${escapeText(item.approval)}</p></div></li>`).join('')}</ol><p class="people-caption">Sample visit dates and approval states are not imported attendance records. The profile’s total hours and visits remain unchanged.</p>` : '<div class="people-empty"><span class="people-empty-icon">' + api.icon('calendar') + '</span><h4>No visit history yet</h4><p>Completed visits will appear here once attendance is recorded.</p></div>'}
    </section><section class="people-section"><h3>Outreach history</h3><div class="people-outreach-empty">${api.icon('message')}<div><strong>Delivery history isn’t connected</strong><p>Draft a personal invitation, then review the recipient and message before sending.</p></div></div><button class="button quiet" data-people-action="draft">Draft a message ${api.icon('arrow')}</button></section>`;
  }

  function notesPanel(person) {
    const profile = profileData(person);
    const draft = drafts.get(person.id)?.notes ?? profile.notes;
    const updatedDate = profile.notesUpdatedAt ? new Date(profile.notesUpdatedAt) : null;
    const savedLabel = updatedDate && !Number.isNaN(updatedDate.getTime()) ? `Saved ${new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}).format(updatedDate)}` : 'No notes saved yet';
    return `<section class="people-section people-section-first"><h3>A little context for next time</h3><p class="people-section-intro">Keep practical details the volunteer has shared, such as a role they enjoy or a follow-up you’ve agreed on.</p><form id="people-notes-form"><div class="form-field"><label for="people-notes">Coordinator notes</label><textarea id="people-notes" name="notes" maxlength="2000" placeholder="e.g. Would like to try the native planting team next time.">${escapeText(draft)}</textarea><div class="people-note-meta"><span>${escapeText(savedLabel)}</span><span id="people-note-count">${draft.length} / 2,000</span></div></div><div class="people-notes-actions"><button class="button primary" type="submit">Save notes ${api.icon('check')}</button><span>Stored locally</span></div></form></section>`;
  }

  function renderPanel() {
    const person = currentPerson();
    const panel = document.querySelector('[data-people-panel]');
    if (!person || !panel) return;
    panel.id = 'people-profile-content';
    panel.setAttribute('aria-labelledby', `people-tab-${activeTab.toLowerCase()}`);
    panel.innerHTML = activeTab === 'Profile' ? profilePanel(person) : activeTab === 'Activity' ? activityPanel(person) : notesPanel(person);
    document.querySelectorAll('[data-people-tab]').forEach(button => {
      const selected = button.dataset.peopleTab === activeTab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function open(id) {
    const person = api?.getState().people.find(item => item.id === id);
    if (!person) return;
    profileOpener = document.activeElement;
    activeId = id;
    activeTab = 'Profile';
    const profile = profileData(person);
    api.openDialog('Volunteer profile', `<div class="people-detail"><header class="people-profile-header">${api.avatar(person, 'people-profile-avatar')}<div><h2 id="dialog-title">${escapeText(person.name)}</h2><div class="people-profile-status"><span class="badge ${person.visits === 1 ? 'orange' : 'green'}">${escapeText(person.status)}</span><span>Volunteer</span></div></div></header>
      <div class="people-contribution"><div><strong>${numberLabel(person.hours)} <small>hours</small></strong><span>Total contribution</span></div><div><strong>${person.visits} <small>${person.visits === 1 ? 'visit' : 'visits'}</small></strong><span>Recorded visits</span></div><div class="people-last-visit"><strong>${profile.lastVisit ? dateLabel(profile.lastVisit).replace(', 2026', '') : 'Not recorded'}</strong><span>${profile.lastVisit ? 'Last visit · sample' : 'Last visit'}</span></div></div>
      <div class="people-profile-actions"><button class="button primary" data-people-action="draft">${api.icon('message')} Draft a message</button><span>Fictional demo profile</span></div>
      <div class="people-tabs" role="tablist" aria-label="Volunteer profile sections">${tabNames.map(tab => `<button id="people-tab-${tab.toLowerCase()}" role="tab" aria-selected="${tab === activeTab}" aria-controls="people-profile-content" tabindex="${tab === activeTab ? 0 : -1}" data-people-tab="${tab}">${tab}</button>`).join('')}</div><div class="people-tab-panel" data-people-panel role="tabpanel" tabindex="0"></div></div>`);
    renderPanel();
  }

  function saveEntry(id, values) {
    edits[id] = {...storedFor({id}), ...values};
    if (window.RootsBridge?.sync) window.RootsBridge.sync();
    else window.dispatchEvent(new CustomEvent('roots:records-changed'));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
      return true;
    } catch {
      api.toast('Browser storage is unavailable. Changes last for this visit.');
      return false;
    }
  }

  function captureDraft(form) {
    if (!activeId) return;
    const draft = drafts.get(activeId) || {};
    if (form.id === 'people-notes-form') draft.notes = form.elements.notes.value;
    if (form.id === 'people-preferences-form') {
      const fields = new FormData(form);
      draft.preferences = Object.fromEntries(fields.entries());
    }
    drafts.set(activeId, draft);
  }

  document.addEventListener('click', event => {
    if (!api) return;
    const tab = event.target.closest('[data-people-tab]');
    if (tab) {
      activeTab = tab.dataset.peopleTab;
      renderPanel();
      tab.focus();
      return;
    }
    const button = event.target.closest('[data-people-action]');
    if (!button) return;
    if (button.dataset.peopleAction === 'draft') api.draftMessage(activeId);
    if (button.dataset.peopleAction === 'opportunity') api.showOpportunity(button.dataset.opportunityId);
  });

  document.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-people-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabNames.indexOf(tab.dataset.peopleTab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabNames.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabNames.length) % tabNames.length;
    activeTab = tabNames[next];
    renderPanel();
    document.querySelector(`[data-people-tab="${activeTab}"]`)?.focus();
  });

  document.addEventListener('close', event => {
    if (event.target.id !== 'detail-dialog' || !event.target.querySelector('.people-detail') || profileOpener?.isConnected) return;
    const button = [...document.querySelectorAll('[data-action="person"]')].find(item => item.dataset.id === activeId);
    if (button) queueMicrotask(() => button.focus());
  }, true);

  document.addEventListener('input', event => {
    const form = event.target.closest('#people-notes-form, #people-preferences-form');
    if (!form) return;
    captureDraft(form);
    if (event.target.id === 'people-notes') document.getElementById('people-note-count').textContent = `${event.target.value.length} / 2,000`;
  });
  document.addEventListener('change', event => {
    const form = event.target.closest('#people-preferences-form');
    if (form) captureDraft(form);
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!api || !['people-notes-form', 'people-preferences-form'].includes(form.id)) return;
    event.preventDefault();
    const person = currentPerson();
    if (!person || !form.reportValidity()) return;
    if (form.id === 'people-notes-form') {
      const saved = saveEntry(person.id, {notes: form.elements.notes.value.trim(), notesUpdatedAt: new Date().toISOString()});
      const draft = drafts.get(person.id) || {};
      delete draft.notes;
      drafts.set(person.id, draft);
      renderPanel();
      document.querySelector('#people-notes-form button[type="submit"]')?.focus();
      if (saved) api.toast('Notes saved for ' + person.name.split(' ')[0]);
    } else {
      const fields = new FormData(form);
      const availability = String(fields.get('availability')).trim();
      if (!availability) {
        form.elements.availability.setCustomValidity('Enter the availability the volunteer has shared.');
        form.elements.availability.reportValidity();
        return;
      }
      const skills = [...new Set(String(fields.get('skills')).split(',').map(skill => skill.trim().slice(0, 60)).filter(Boolean))].slice(0, 12);
      const target = fields.get('target') ? Number(fields.get('target')) : null;
      const studentStatus = studentStatuses.includes(fields.get('studentStatus')) ? fields.get('studentStatus') : 'Not recorded';
      const school = validText(fields.get('school'), 160).trim() || null;
      const employer = validText(fields.get('employer'), 160).trim() || null;
      const previous = profileData(person);
      const changedContext = {};
      for (const [field, value] of Object.entries({studentStatus, school, employer})) {
        if (previous[field] !== value) changedContext[field] = value;
      }
      const previousTarget = ['Locally recorded', 'Recorded in profile', DEMO_CONTEXT].includes(previous.serviceHours.targetSource) ? previous.serviceHours.target : null;
      if (previousTarget !== target) changedContext.target = target;
      const saved = saveEntry(person.id, {skills, availability, channel: String(fields.get('channel')), ...changedContext, preferencesUpdatedAt: new Date().toISOString()});
      const draft = drafts.get(person.id) || {};
      delete draft.preferences;
      drafts.set(person.id, draft);
      api.render();
      renderPanel();
      document.querySelector('#people-edit-preferences summary')?.focus();
      if (saved) api.toast('Preferences saved for ' + person.name.split(' ')[0]);
    }
  });

  window.RootsPeople = {configure(nextApi) { api = nextApi; }, open, profileData};
})();
