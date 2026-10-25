(() => {
  let api, status = null, version = null, syncTimer = null;
  let writes = Promise.resolve(), activity = {activity: [], drafts: []};
  let insightRequest = null;
  async function request(path, options = {}) {
    const response = await fetch(path, {...options, headers: {...(options.body ? {'Content-Type': 'application/json'} : {}), ...options.headers}});
    const body = await response.json();
    if (!response.ok) {
      const error = new Error(body.error || 'The local assistant could not complete that request.');
      error.status = response.status;
      error.code = body.code;
      throw error;
    }
    return body;
  }
  function snapshot() {
    const state = api.getState();
    return {organization: {name: 'Greenfield Farm', demo: true, scenario: window.ROOTS_DATA?.scenario || null}, people: state.people.map(p => ({...p, ...window.RootsPeople.profileData(p)})), events: state.events, opportunities: window.RootsOpportunities.list(), projects: window.RootsOpportunities.projects(), notices: window.RootsNotices.notices(), workflows: window.RootsNotices.workflows(), saved: state.saved, activity: state.activity, metadata: {illustrative: true, asOf: '2026-10-24'}};
  }
  function reportSync(error) {
    status.syncError = error ? error.message : null;
    window.dispatchEvent(new CustomEvent('roots:connection'));
  }
  function flush() {
    clearTimeout(syncTimer);
    if (!status?.connected || !api) return Promise.resolve();
    // Serialize this browser's snapshots and recover once from an idle version conflict.
    const operation = writes.catch(() => {}).then(async () => {
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const result = await request('/api/state', {method: 'PUT', body: JSON.stringify({state: snapshot(), baseVersion: version})});
            version = result.version;
            reportSync(null);
            return;
          } catch (error) {
            if (error.status !== 409 || attempt) throw error;
            version = (await request('/api/state')).version;
          }
        }
      } catch (error) {
        reportSync(error);
        throw error;
      }
    });
    writes = operation;
    return operation;
  }
  function sync() {
    window.dispatchEvent(new CustomEvent('roots:records-changed'));
    if (!status?.connected || !api) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { flush().catch(() => {}); }, 200);
  }
  async function loadActivity() {
    if (!status?.connected) return;
    activity = await request('/api/activity');
    window.RootsBridge.activity = activity;
    window.dispatchEvent(new CustomEvent('roots:activity'));
    return activity;
  }
  async function init() {
    try {
      status = await request('/api/status');
      window.RootsBridge.status = status;
      version = (await request('/api/state')).version;
      await flush();
      await loadActivity();
      await loadInsights().catch(() => {});
    } catch (error) {
      if (status?.connected) reportSync(error);
      else { status = null; window.RootsBridge.status = null; }
    }
    if (api.getState().view === 'notices') api.render();
    window.dispatchEvent(new CustomEvent('roots:ready'));
  }
  async function loadInsights(force = false) {
    if (!status?.connected) return null;
    if (insightRequest) return insightRequest;
    insightRequest = (async () => {
      try {
        const result = await request(force ? '/api/insights/refresh' : '/api/insights', force ? {method:'POST',body:'{}'} : {});
        window.RootsBridge.insights = result;
        window.RootsBridge.insightError = null;
        window.dispatchEvent(new CustomEvent('roots:insights'));
        return result;
      } catch (error) {
        window.RootsBridge.insightError = error.message;
        window.dispatchEvent(new CustomEvent('roots:insights'));
        throw error;
      } finally { insightRequest = null; }
    })();
    return insightRequest;
  }
  async function chat(message, conversationId, requestId) {
    if (!status?.geminiConfigured) throw new Error('Configure Gemini on the local test server to ask Roots.');
    await flush();
    return request('/api/chat', {method: 'POST', headers:status.testPreview?.csrfToken?{'X-Roots-Test-Token':status.testPreview.csrfToken}:{}, body: JSON.stringify({message, ...(conversationId ? {conversationId} : {}), ...(requestId ? {requestId} : {})})});
  }
  window.addEventListener('focus', () => { loadActivity().catch(() => {}); });
  window.RootsBridge = {configure(callbacks) { api = callbacks; }, init, sync, flush, chat, loadActivity, loadInsights, request, status, activity, insights:null, insightError:null};
})();
