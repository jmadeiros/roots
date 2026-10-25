/* People groups use recorded interests, participation and explicitly shared age ranges. */
((root) => {
  'use strict';

  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  const validCount = value => Number.isSafeInteger(value) && value >= 0;
  const groupOrder = (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'en');
  const thoughts = {
    'community gardening':'A regular garden session could give this shared interest a place to grow.',
    'service hours':'Ask what experience or hours people need before shaping a recurring service pathway.',
    'composting':'A practical composting session could bring this group together around a shared project.',
    'community outreach':'Ask whether people would like to help welcome volunteers or tell the community’s story.',
    'native plants':'A planting or habitat session could turn this shared interest into something practical.',
    'data analysis':'A clearly scoped reporting task could offer a useful place to apply this interest.',
    'environmental education':'Ask what people would like to learn or share in a community learning session.',
    'food recovery':'A regular harvest or food-sharing session could give this interest a common purpose.'
  };

  function records(values) {
    const result = new Map();
    for (const value of Array.isArray(values) ? values : []) {
      if (!isRecord(value) || !text(value.id) || result.has(value.id)) continue;
      result.set(value.id, value);
    }
    return result;
  }

  function interestLabels(values) {
    const result = new Map();
    for (const value of Array.isArray(values) ? values : []) {
      const label = text(value);
      if (label && !result.has(label.toLowerCase())) result.set(label.toLowerCase(), label);
    }
    return result;
  }

  function compute(state, leads, profileAdapter) {
    const people = [], interestGroups = new Map(), ageGroups = new Map();
    const participation = [
      {id:'participation-one', label:'One recorded visit', nextThought:'Ask what would make another visit useful or enjoyable; the total alone does not tell us when someone last attended.'},
      {id:'participation-repeat', label:'More than one visit', nextThought:'Ask what people would like to do next, before suggesting a new role or a larger commitment.'},
      {id:'participation-zero', label:'No recorded visits', nextThought:'A simple conversation about interests and availability could help shape a first invitation.'},
      {id:'participation-unknown', label:'Visits not recorded', nextThought:'Check the attendance record before making assumptions about participation.'}
    ].map(group => ({...group, count:0, personIds:[], opportunityIds:[]}));
    const coverage = {people:0, interests:0, visits:0, ageGroups:0};
    for (const [id, original] of records(isRecord(state) ? state.people : null)) {
      let profile = original;
      if (typeof profileAdapter === 'function') {
        try {
          const supplied = profileAdapter({...original, ...(Array.isArray(original.interests) ? {interests:[...original.interests]} : {})});
          if (isRecord(supplied)) profile = {...original, ...supplied};
        } catch { /* Keep the direct record when profile enrichment is unavailable. */ }
      }
      const interests = interestLabels(profile.interests);
      // Demographic groups must come from an explicit source record, never
      // profile enrichment, illustrative history or another inferred field.
      const ageGroup = text(original.ageGroup) || text(original.ageBand);
      const visits = profile.visits;
      people.push({id, name:text(original.name) || 'Unnamed person', interests:[...interests.values()], visits});
      coverage.people++;
      if (interests.size) coverage.interests++;
      if (validCount(visits)) coverage.visits++;
      if (ageGroup) coverage.ageGroups++;
      for (const [key, label] of interests) {
        if (!interestGroups.has(key)) interestGroups.set(key, {id:`interest-${encodeURIComponent(key)}`, label, count:0, personIds:[], opportunityIds:[], nextThought:thoughts[key] || `Ask what people would like to do with their shared interest in ${label.toLowerCase()}.`});
        const group = interestGroups.get(key);
        group.count++; group.personIds.push(id);
      }
      const visitGroup = participation[!validCount(visits) ? 3 : visits === 0 ? 2 : visits === 1 ? 0 : 1];
      visitGroup.count++; visitGroup.personIds.push(id);
      if (ageGroup) {
        const key = ageGroup.toLowerCase();
        if (!ageGroups.has(key)) ageGroups.set(key, {id:`age-${encodeURIComponent(key)}`, label:ageGroup, count:0, personIds:[], opportunityIds:[], nextThought:'Ask people what would make participation work for them; a shared age range does not imply shared needs.'});
        const group = ageGroups.get(key);
        group.count++; group.personIds.push(id);
      }
    }
    const relatedLeads = [];
    for (const [id, lead] of records(leads)) {
      if (!text(lead.title)) continue;
      relatedLeads.push({id, title:text(lead.title)});
      for (const key of interestLabels(lead.interests).keys()) {
        if (interestGroups.has(key)) interestGroups.get(key).opportunityIds.push(id);
      }
    }
    return {
      people, leads:relatedLeads, coverage,
      interests:[...interestGroups.values()].sort(groupOrder),
      participation:participation.filter(group => group.count),
      ageGroups:[...ageGroups.values()].sort(groupOrder)
    };
  }

  let api = null, bound = false;
  const view = {tab:'groups', grouping:'interests', all:false, expanded:new Set()};
  const groupingNames = [['interests','Interests'], ['participation','Participation'], ['ageGroups','Age groups']];
  const e = value => api.esc(value);

  function groupMarkup(group, result) {
    const members = group.personIds.map(id => result.people.find(person => person.id === id)).filter(Boolean);
    const leads = group.opportunityIds.map(id => result.leads.find(lead => lead.id === id)).filter(Boolean);
    const count = `${group.count} ${group.count === 1 ? 'person' : 'people'}`;
    const description = view.grouping === 'interests' ? `${count} ${group.count === 1 ? 'lists' : 'list'} this interest.` : view.grouping === 'ageGroups' ? `${count} ${group.count === 1 ? 'has' : 'have'} this age range recorded.` : `${count} in the current records.`;
    return `<article class="people-group"><h2>${e(group.label)}</h2><p class="people-group-thought"><span>${e(description)}</span> ${e(group.nextThought)}</p><details class="people-group-details" data-people-group-id="${e(group.id)}"${view.expanded.has(group.id) ? ' open' : ''}><summary>See ${e(count)}${leads.length ? ' and related leads' : ''}${api.icon('chevron-down')}</summary><div class="people-group-expanded"><ul class="people-group-members">${members.map(person => `<li><button type="button" data-people-group-person="${e(person.id)}"><span>${e(person.name)}</span>${api.icon('arrow')}</button></li>`).join('')}</ul>${leads.length ? `<section class="people-group-leads"><h3>Related leads</h3><p>Connected by stated interest; current program terms need checking.</p><ul>${leads.map(lead => `<li><button type="button" data-people-group-lead="${e(lead.id)}"><span>${e(lead.title)}</span>${api.icon('arrow')}</button></li>`).join('')}</ul></section>` : ''}</div></details></article>`;
  }

  function groupsMarkup(result) {
    const groups = result[view.grouping];
    const visible = view.grouping === 'interests' && !view.all ? groups.slice(0, 4) : groups;
    let content = visible.map(group => groupMarkup(group, result)).join('');
    if (!groups.length) {
      content = view.grouping === 'ageGroups'
        ? '<p class="people-groups-empty">Age groups aren’t recorded yet. This view will use age ranges people choose to share.</p>'
        : view.grouping === 'interests'
          ? '<p class="people-groups-empty">There are no stated interests to group yet. Shared interests will appear here as people add them.</p>'
          : '<p class="people-groups-empty">Add people to start exploring participation.</p>';
    }
    const note = view.grouping === 'interests'
      ? `Groups use stated interests, so a person can appear in more than one. ${result.coverage.people - result.coverage.interests ? `${result.coverage.people - result.coverage.interests} ${result.coverage.people - result.coverage.interests === 1 ? 'person has' : 'people have'} no interests recorded. ` : ''}Fictional demo records.`
      : view.grouping === 'participation'
        ? 'These are total recorded visits, not a measure of recent attendance or retention. Fictional demo records.'
        : `Only explicitly recorded age ranges appear here.${groups.length && result.coverage.people > result.coverage.ageGroups ? ` ${result.coverage.people - result.coverage.ageGroups} ${result.coverage.people - result.coverage.ageGroups === 1 ? 'person has' : 'people have'} no age range recorded.` : ''}`;
    return `<div class="people-grouping-controls" role="group" aria-label="Group people by">${groupingNames.map(([id,label]) => `<button type="button" id="people-grouping-${id}" data-people-grouping="${id}" aria-pressed="${view.grouping === id}">${label}</button>`).join('')}</div><div class="people-group-list">${content}</div>${view.grouping === 'interests' && groups.length > 4 ? `<button type="button" class="people-groups-more" data-people-groups-all aria-expanded="${view.all}">${view.all ? 'Show fewer groups' : `Show all ${groups.length} groups`}</button>` : ''}<p class="people-groups-note">${e(note)}</p>`;
  }

  function render(renderEveryone) {
    const result = compute(api.getState(), root.RootsOpportunities?.list?.() || [], root.RootsPeople?.profileData);
    const everyone = view.tab === 'everyone';
    return `<section class="people-intelligence${everyone ? ' people-everyone' : ''}">${api.head('People', 'Find the people behind the possibilities.')}<div class="people-view-tabs" role="tablist" aria-label="People view">${[['groups','Groups'],['everyone','Everyone']].map(([id,label]) => `<button type="button" role="tab" id="people-view-${id}" data-people-view="${id}" aria-selected="${view.tab === id}" aria-controls="people-view-panel" tabindex="${view.tab === id ? '0' : '-1'}">${label}</button>`).join('')}</div><div id="people-view-panel" role="tabpanel" aria-labelledby="people-view-${view.tab}" tabindex="0">${everyone ? `<div class="people-everyone-actions"><button class="button" data-action="add-person">${api.icon('plus')} Add volunteer</button></div>${renderEveryone()}` : groupsMarkup(result)}</div></section>`;
  }

  function selectTab(tab) {
    if (!['groups','everyone'].includes(tab)) return;
    view.tab = tab;
    api.render();
    document.getElementById(`people-view-${tab}`)?.focus();
  }

  function configure(nextApi) {
    api = nextApi;
    if (bound || typeof document === 'undefined') return;
    bound = true;
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-people-view],[data-people-grouping],[data-people-groups-all],[data-people-group-person],[data-people-group-lead]');
      if (!button || !api) return;
      if (button.hasAttribute('data-people-view')) selectTab(button.dataset.peopleView);
      else if (button.hasAttribute('data-people-grouping')) {
        if (!groupingNames.some(([id]) => id === button.dataset.peopleGrouping)) return;
        view.grouping = button.dataset.peopleGrouping;
        api.render();
        document.getElementById(`people-grouping-${view.grouping}`)?.focus();
      } else if (button.hasAttribute('data-people-groups-all')) {
        view.all = !view.all;
        api.render();
        document.querySelector('[data-people-groups-all]')?.focus();
      } else if (button.hasAttribute('data-people-group-person')) api.showPerson(button.dataset.peopleGroupPerson);
      else if (button.hasAttribute('data-people-group-lead')) api.showOpportunity(button.dataset.peopleGroupLead);
    });
    document.addEventListener('toggle', event => {
      if (!event.target.isConnected || !event.target.matches?.('.people-group-details')) return;
      const id = event.target.dataset.peopleGroupId;
      if (event.target.open) view.expanded.add(id); else view.expanded.delete(id);
    }, true);
    document.addEventListener('keydown', event => {
      if (!event.target.matches?.('[data-people-view]') || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      selectTab(event.key === 'Home' ? 'groups' : event.key === 'End' ? 'everyone' : view.tab === 'groups' ? 'everyone' : 'groups');
    });
  }

  const exported = {compute, configure, render};
  if (root) root.RootsPeopleGroups = exported;
  if (typeof module !== 'undefined' && module.exports) module.exports = exported;
})(typeof window !== 'undefined' ? window : null);
