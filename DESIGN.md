---
name: Roots
description: A current community briefing with source-backed suggestions and a separate conversation.
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
    fontSize: "29px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.75px"
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
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.3px"
  body:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  supporting:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "12px"
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

**Creative North Star: “Your community, right now.”**

Roots opens on a current briefing for nonprofit coordinators. Warm paper, dark green text and actions, restrained sage surfaces, open space, and fine dividers make the information calm and readable. The sprout and green palette remain part of the product identity.

The user's latest selection is Briefing plus chat: restore green, keep the sidebar small, and let insights change with new information independently of conversation. This supersedes the earlier neutral conversation-first direction and its shrinking insight rows. Keep the quieter composition; do not restore the old metric-heavy Overview.

Implementation authority is the shared shell in `dist/style.css` and `dist/app.js`, the existing neutral and conversation styles, and the final overrides in `dist/briefing.css`. The independent front page lives in `dist/briefing.js`; Ask Roots lives in `dist/conversation.js`. The briefing stylesheet supplies the current palette and shell dimensions, overriding earlier neutral token values. `opportunities`, `people-detail`, and `notices` remain scoped modules for deeper work.

## Color and material

- **Paper `#fafaf6`** is the page ground; **white** defines fields and contained work such as message drafts.
- **Ink `#293a30`** carries primary text and general primary buttons. **Forest `#294b36`** carries active navigation, briefing actions, and composer send controls. **Deep `#203b2a`** is the stronger hover state.
- **Muted `#667060`**, **Line `#e0e5d8`**, and **Field Line `#cbd5c2`** give secondary content and controls a clear hierarchy.
- **Sidebar `#f0f2eb`**, **Soft Surface `#f3f5ed`**, **Hover `#e9eee1`**, **Selected `#e3ead9`**, and **Sage `#e7eddf`** introduce restrained green material without turning every section into a colored card.
- **Brand Accent `#52764a`** supports the identity. Evidence disclosures use a pale `#f0f3e9` surface; the composer boundary is `#ced8c3`.
- Warm amber status styling remains available for an actual warning or prerequisite. Avatar accents identify people without competing with navigation.

The `--forest` and `--sage` variables now resolve to green again. Do not apply the previous neutral-only interpretation to new work. Ordinary surfaces stay flat; sheets retain a restrained side shadow and backdrop. Carets, focus, selection, hover, and active states should read as part of the same green-and-paper system.

## Typography

Self-hosted DM Sans remains the sole UI family. Use medium weight for page greetings and briefing titles; stronger weight should identify information worth scanning rather than decorate the page.

The desktop briefing heading is 29px with a 1.25 line height and −0.75px tracking, stepping to 27px on short desktop screens and 26px on phones. Briefing titles are 18px with a 1.45 line height; explanations and suggested next steps are 12px with generous spacing. Desktop navigation is 12px, and briefing metadata and evidence controls are 11px. Ask Roots uses a 28px greeting and the existing comfortable conversation text. Composer input reaches 16px on phones to avoid browser zoom.

Air comes from fewer visible controls and better spacing, not shrinking reading text. Keep body contrast at least 4.5:1 and maintain visible focus on every interactive control. Existing record pages retain their practical 12–14px text hierarchy.

## Navigation and layout

Primary navigation contains **Briefing, People, Opportunities, Outreach**. **Ask Roots** and **Calendar** are secondary links. Assistant connection details open within Ask Roots. Old Overview links resolve to Briefing; old Funding links resolve to Opportunities. The underlying Notices route is labeled Outreach in the interface.

The desktop sidebar is **178px** wide and collapses to a **56px** icon rail. Use small 36px navigation rows, a simple workspace label, and a compact profile. Hide labels when collapsed while preserving accessible names. The topbar is 49px high and visually quiet. This replaces the earlier bulky sidebar treatment.

The briefing has a centered **660px maximum reading column**. It contains a short heading, actual review status, coverage and an explanation disclosure, two suggestions with an optional third, a calendar link, and a bottom composer. The composer is pushed toward the bottom by the column layout, while long content still scrolls normally. It opens the separate conversation; the briefing does not shrink, disappear, or change its density because messages exist.

Ask Roots also uses a 660px conversation column, within a 920px workspace. Its transcript and inline actions have their own layout and a clear route back to Briefing. Record pages may use the broader shared container. Tables scroll within their own wrappers rather than widening the page.

On phones the sidebar becomes a four-item bottom navigation with visible labels and safe-area spacing. The briefing uses the available width with 20px side gutters. The desktop collapse control is hidden. Forms, draft controls, and evidence wrap without forcing horizontal scrolling.

## Briefing, evidence, and freshness

Start with two useful connections; **One more connection** reveals the third when available. Each row has a concrete title, a short factual summary, an optional **Possible next step** interpretation, a direct review action, and an **Evidence and things to check** disclosure. The disclosure links source people, events, opportunities, and projects, names unknowns, and offers **Discuss this with Roots**. Keep evidence accessible without expanding the whole page.

Current record matches connect first-visit gardeners to an event with remaining capacity, service-hour interests to a school-partnership lead, and a draft project team to different recorded availability. All source records are illustrative. An interest match does not establish eligibility; aggregate attendance does not identify individual RSVPs; a suggested role does not mean someone has accepted it.

In a static preview, the briefing uses deterministic record matches. With the local bridge, an independent Gemini review selects and combines a bounded derived fact catalog and proposes short interpretations. It does not depend on conversation or research external sources. Strict fact IDs are validated; summaries, numeric evidence, and source references are reconstructed server-side from the catalog. Validation establishes reference integrity and output structure, not the truth of every interpretation. Keep model suggestions distinguishable from record facts.

The coverage line describes available records; its explanation must distinguish those totals from the smaller reviewed fact catalog. Raw phone numbers, email addresses, coordinator notes, and chat history are excluded from briefing synthesis. A model response must not imply that an external benefit, eligibility rule, deadline, partnership, or application has been verified.

Check after meaningful record changes, after 30 minutes while the app is open, when it becomes visible again, or on manual refresh. Activity-only or version-only saves do not count as new evidence. Cached results use IDs derived from selected facts. Rechecking must not create fabricated discoveries, novelty indicators, or activity.

Generation exposes **pending, reviewing, ready, and failed** states. Pending/reviewing means real queued or running work. Keep the previous successful briefing visible during a review or a failure; label older retained evidence when stale. If no successful review exists, show the record-match fallback with its source stated. Discard a result generated against superseded records and review the latest snapshot. Failures retry on explicit refresh or a meaningful record change, with the server's retry guard. There is no dismiss feature or promised continuous monitoring after the app closes.

Animate the connection mark and scan indicator only during actual pending/reviewing work. Do not add an artificial thinking delay, animate an idle briefing, or use motion to imply a discovery. Under reduced motion, stop the repeating animation and retain a static status cue. Empty records and failed reviews need clear text and a useful retry or next step.

## Ask Roots and inline actions

Ask Roots is a separate conversation, available from the secondary navigation, briefing composer, and evidence disclosures. User messages use a pale green bubble; assistant text sits directly on the page with a small Roots label and sprout. A concise checking state belongs to an actual request. Failures expose recovery rather than a fabricated answer.

The white composer has a fine green boundary, an 11px radius, and a forest send control. Input grows within a bounded range. Nearby text explains whether a local assistant is needed and that email/SMS delivery is unavailable. The published static preview must not pretend to answer with a live model.

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

Preserve the useful underlying records while keeping the briefing quiet. Do not restore metric cards as the entry point, turn every insight into a colored tile, expand the sidebar for every capability, or confuse a refresh with new evidence. The interface should make it easy to understand, inspect, ask, and prepare an action without concealing what remains unverified.
