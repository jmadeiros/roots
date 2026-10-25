---
name: Roots
description: A simple green Today page with useful ideas, evidence on demand, and a separate conversation.
colors:
  charcoal: "#343632"
  forest: "#294b36"
  deep: "#203b2a"
  brand-accent: "#52764a"
  sage: "#e7eddf"
  featured: "#f3f5ed"
  featured-line: "#e0e5d8"
  positive-bg: "#edf1e9"
  positive-text: "#4b6142"
  peach: "#f2e9df"
  action-bg: "#f5ece1"
  action-text: "#81562e"
  paper: "#fafaf6"
  surface: "#fff"
  sidebar: "#f0f2eb"
  topbar: "#fafaf6"
  sheet: "#fafaf6"
  ink: "#293a30"
  muted: "#667060"
  secondary-text: "#667060"
  recommendation-text: "#667060"
  line: "#e0e5d8"
  focus: "#293a30"
  selected: "#e3ead9"
  field-line: "#cbd5c2"
  tag-bg: "#f3f5ed"
  tag-text: "#667060"
  table-heading-text: "#667060"
typography:
  display:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.8px"
  headline:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.6px"
  title:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.3px"
  recommendation-title:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.2px"
  body:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  supporting:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  tag: "4px"
  badge: "5px"
  control: "6px"
  field-shell: "7px"
  navigation: "6px"
  compact-card: "10px"
  preview: "12px"
  card: "14px"
  composer: "15px"
  circle: "50%"
spacing:
  micro: "5px"
  tight: "8px"
  small: "12px"
  pair: "16px"
  medium: "20px"
  card: "25px"
  column: "28px"
  section: "32px"
  gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
    width: "100%"
  navigation:
    textColor: "{colors.muted}"
    rounded: "{rounded.navigation}"
    padding: "8px 10px"
    height: "36px"
  navigation-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.forest}"
  badge-positive:
    backgroundColor: "{colors.positive-bg}"
    textColor: "{colors.positive-text}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "4px 7px"
  badge-action:
    backgroundColor: "{colors.action-bg}"
    textColor: "{colors.action-text}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "4px 7px"
  metric:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "21px 23px 18px"
  recommendation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  recommendation-featured:
    backgroundColor: "{colors.featured}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  event-date:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field-shell}"
    width: "44px"
    height: "51px"
---

# Design System: Roots

## Direction and authority

**Creative North Star: “Two things worth a look.”**

Roots opens on Today, a simple current briefing for nonprofit coordinators. A short heading, compact freshness line, two plain ideas, and a roomy composer form the first screen. Warm paper, dark green text and actions, restrained sage surfaces, open space, and fine dividers preserve the original green concept.

The user preferred the first green “Roots Quieter Workspace” concept and rejected the expanded production briefing. That concept's simple, effective composition is the visual authority. More capability should emerge through useful ideas, actions, and opened detail. Retain independent AI review beneath the surface. Neither the later large status treatment nor the older full metrics dashboard is the restoration target.

Implementation authority is the shared shell in `dist/style.css` and `dist/app.js`, the existing neutral and conversation styles, and the final overrides in `dist/briefing.css`. The independent front page lives in `dist/briefing.js`; Ask Roots lives in `dist/conversation.js`. The briefing stylesheet supplies the current palette and shell dimensions, overriding earlier neutral token values. `opportunities`, `people-detail`, and `notices` remain scoped modules for deeper work.

## Color and material

- **Paper `#fafaf6`** is the page ground; **white** defines fields and contained work such as message drafts.
- **Ink `#293a30`** carries primary text, general primary buttons, and the text of outlined idea actions. **Forest `#294b36`** carries active navigation, discussion links, and composer send controls. **Deep `#203b2a`** is the stronger hover state.
- **Muted `#667060`**, **Line `#e0e5d8`**, and **Field Line `#cbd5c2`** give secondary content and controls a clear hierarchy.
- **Sidebar `#f0f2eb`**, **Soft Surface `#f3f5ed`**, **Hover `#e9eee1`**, **Selected `#e3ead9`**, and **Sage `#e7eddf`** introduce restrained green material without turning every section into a colored card.
- **Brand Accent `#52764a`** supports the identity and the small checking indicator. Opened evidence uses Soft Surface; the Today composer and outlined actions use the fine Line boundary.
- Warm amber status styling remains available for an actual warning or prerequisite. Avatar accents identify people without competing with navigation.

The `--forest` and `--sage` variables now resolve to green again. Do not apply the previous neutral-only interpretation to new work. Ordinary surfaces stay flat; sheets retain a restrained side shadow and backdrop. Carets, focus, selection, hover, and active states should read as part of the same green-and-paper system.

## Typography

Self-hosted DM Sans remains the sole UI family. Use medium weight for page greetings and briefing titles; stronger weight should identify information worth scanning rather than decorate the page.

The desktop Today heading is 28px with a 1.25 line height and −0.8px tracking, stepping to 26px on phones. Idea titles are 17px with a 1.4 line height and −0.2px tracking. Each visible explanation is 13px with a 1.8 line height. Desktop navigation is 13px, outlined actions are 12px, and freshness and disclosure controls are 11px. Ask Roots uses a 28px greeting and the existing comfortable conversation text. Composer input reaches 16px on phones to avoid browser zoom.

Air comes from fewer visible controls and better spacing, not shrinking reading text. Keep body contrast at least 4.5:1 and maintain visible focus on every interactive control. Existing record pages retain their practical 12–14px text hierarchy.

## Navigation and layout

Primary navigation contains **Today, People, Opportunities, Outreach**. Today keeps the `#briefing` route. **Ask Roots** and **Calendar** are secondary links. Assistant connection details open within Ask Roots. Old Overview links resolve to Today; old Funding links resolve to Opportunities. The underlying Notices route is labeled Outreach in the interface.

The desktop sidebar is **170px** wide and collapses to a **56px** icon rail. Use small 36px navigation rows, the 26px Roots wordmark, and a compact profile. Hide labels when collapsed while preserving accessible names. The topbar is 49px high, with the workspace name presented quietly. Keep this shared shell in the original green palette.

Today has a centered **590px maximum reading column**. Its heading reads “Two things worth a look.”, adapting to one idea or an empty state. A compact freshness line sits directly below. Two plain idea blocks follow, with a third available on demand, then a quiet explanation disclosure. The content area grows to keep the roomy composer toward the bottom; long content still scrolls normally. Opening Ask Roots does not shrink, replace, or determine the briefing.

The Today composer uses a **48px textarea**, **15px padding**, **15px corner radius**, and a 31px forest send button. Leave 32px above it on desktop. Its placeholder invites the coordinator to ask Roots or take an idea further. Preserve this comfortable input area rather than reducing it to a shallow toolbar.

Ask Roots retains a separate 660px conversation column within a 920px workspace. Its transcript and inline actions have their own layout and a route back to Today. Record pages may use the broader shared container. Tables scroll within their own wrappers rather than widening the page.

On phones the sidebar becomes a four-item bottom navigation with visible labels and safe-area spacing. The briefing uses the available width with 20px side gutters. The desktop collapse control is hidden. Forms, draft controls, and evidence wrap without forcing horizontal scrolling.

## Today, evidence, and freshness

Start with two useful ideas; **One more idea** reveals the third when available. Each block has a concrete title, one short factual paragraph, and a simple outlined action with an adjacent **Why this?** disclosure. Use 22px vertical spacing, fine dividers, and a 34px minimum desktop action height. The disclosure contains the model's **Suggested next step**, evidence, unknowns, source links, and **Discuss this with Roots**. Keep the extra interpretation inside the disclosure rather than repeating it as another visible paragraph.

Below the ideas, **How Roots finds these ideas** explains the review source, available records, cadence, and limitations. This replaces the expanded status panel and visible coverage strip. The first screen should read as a useful pair of ideas, not a description of the machinery producing them.

Current record matches connect first-visit gardeners to an event with remaining capacity, service-hour interests to a school-partnership lead, and a draft project team to different recorded availability. All source records are illustrative. An interest match does not establish eligibility; aggregate attendance does not identify individual RSVPs; a suggested role does not mean someone has accepted it.

In a static preview, the briefing uses deterministic record matches. With the local bridge, an independent Gemini review selects and combines a bounded derived fact catalog and proposes short interpretations. It does not depend on conversation or research external sources. Strict fact IDs are validated; summaries, numeric evidence, and source references are reconstructed server-side from the catalog. Validation establishes reference integrity and output structure, not the truth of every interpretation. Keep model suggestions distinguishable from record facts.

Record totals belong in **How Roots finds these ideas**. They describe available records, not a claim that every record was reviewed; Gemini receives a bounded derived fact catalog. Raw phone numbers, email addresses, coordinator notes, and chat history are excluded from briefing synthesis. A model response must not imply that an external benefit, eligibility rule, deadline, partnership, or application has been verified.

Check after meaningful record changes, after 30 minutes while the app is open, when it becomes visible again, or on manual refresh. Activity-only or version-only saves do not count as new evidence. Cached results use IDs derived from selected facts. Rechecking must not create fabricated discoveries, novelty indicators, or activity.

Generation exposes **pending, reviewing, ready, and failed** states. Pending/reviewing means real queued or running work. Keep the previous successful briefing visible during a review or a failure; label older retained evidence when stale. If no successful review exists, show the record-match fallback with its source stated. Discard a result generated against superseded records and review the latest snapshot. Failures retry on explicit refresh or a meaningful record change, with the server's retry guard. There is no dismiss feature or promised continuous monitoring after the app closes.

Use three small dots within the freshness line during actual checking or pending/reviewing work. The line then returns to its checked/reviewed time, or explains a failure and offers **Try again**. Do not add an artificial delay, large animated mark, scan bar, or idle animation. Under reduced motion, leave the dots static. Empty records and failed reviews need clear text and a useful retry or next step.

## Ask Roots and inline actions

Ask Roots is a separate conversation, available from the secondary navigation, briefing composer, and evidence disclosures. User messages use a pale green bubble; assistant text sits directly on the page with a small Roots label and sprout. A concise checking state belongs to an actual request. Failures expose recovery rather than a fabricated answer.

The separate Ask Roots composer has a fine green boundary, an 11px radius, and a forest send control. Input grows within a bounded range. Nearby text explains whether a local assistant is needed and that email/SMS delivery is unavailable. The larger 15px-radius Today composer remains distinct. The published static preview must not pretend to answer with a live model.

An email or SMS draft appears inline with channel, recipient, message, **Not sent**, and explicit readiness blockers. Recipient names open their records. **Edit message** changes the existing unsent backend draft; **Copy** copies text; **Refine in chat** prepares a follow-up instruction. Editing exposes save and cancel controls. None of these actions delivers outreach.

Keep draft revisions available in Outreach as well as conversation. Missing phone details, permission, and provider connections must not disappear behind successful-looking statuses. Do not add a Send action while delivery is unavailable.

## People and opportunities

People remains a searchable table with individual records in a 620px sheet. Profile, Activity, and Notes separate preferences and contact facts, illustrative participation history, and locally recorded context. Stated interests remain distinct from declared skills; contact preference remains distinct from consent. Confirmed and illustrative service-hour targets require different source labels. Explicit saves persist edits.

Opportunities uses For volunteers, For organization, Projects, and Saved views. Eleven candidate leads and three draft project plans appear in compact searchable rows, six results at a time. A separate save action makes bookmarking clear. Details show benefits and matching people first, then collapse additional matches, terms, next steps, budgets, and readiness checks. Teams and budgets are drafts; source links are leads to verify, not confirmed offers.

Both surfaces use the current paper, green, and fine-divider system. The standard sheet remains 540px wide, with the People exception above; sheets fill phone width and retain a sticky close header. Keep these detailed controls out of the briefing's initial view.

## Outreach and connection truth

Outreach has **Drafts, Workflows, and Delivery** views. Workflow rows summarize audience rules, timing, channel, and draft status. Saving a rule does not activate or schedule it. Audience previews do not establish actual bookings, consent, or deliverability.

Delivery clearly says that SMS and email providers are not configured. Its coverage counts describe stored profiles, not verified contact details. A contact preference is not permission. No email/SMS outreach has been sent through these features, and connecting Gemini or Telegram does not enable delivery.

The published site is a static preview with browser-local records. The optional local bridge synchronizes a snapshot for Gemini and an explicitly configured Telegram connection. The published and local origins do not share browser storage automatically. Web and Telegram can use the same local records and deliberately saved drafts, while conversation histories remain separate. Briefing synthesis does not consume either history.

Connection details should distinguish configuration, synchronization, polling, and failures. Credential presence alone is not a live connection test. Model responses and shared assistant draft creation require the local server; credentials never belong in frontend files or browser storage. No simulated delivery status should fill a disconnected state.

## Interaction quality

Use explicit button labels, native disclosures, accessible tab semantics, and keyboard focus return. Preserve expanded evidence during status updates where possible. Use restrained sheet transitions and only truthful pending-work indicators, with reduced-motion support.

Preserve the original green concept's simple composition while making each idea more useful. Put additional intelligence and controls inside actions, disclosures, and records. Keep the backend's factual checks and review states without turning them into extra front-page furniture. The interface should make it easy to understand, inspect, ask, and prepare an action without concealing what remains unverified.
