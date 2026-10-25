---
name: Roots
description: A quiet conversation workspace with useful community insights and actions.
colors:
  charcoal: "#343632"
  forest: "#343632"
  deep: "#242622"
  brand-accent: "#5b7153"
  sage: "#eeede7"
  featured: "#f4f3ef"
  featured-line: "#e2e0d9"
  positive-bg: "#edf1e9"
  positive-text: "#4b6142"
  peach: "#f2e9df"
  action-bg: "#f5ece1"
  action-text: "#81562e"
  paper: "#faf9f6"
  surface: "#fff"
  sidebar: "#f2f1ed"
  topbar: "#faf9f6"
  sheet: "#faf9f6"
  ink: "#343632"
  muted: "#6c6a63"
  secondary-text: "#6c6a63"
  recommendation-text: "#6c6a63"
  line: "#e2e0d9"
  focus: "#343632"
  selected: "#e6e4dd"
  field-line: "#cbc8be"
  tag-bg: "#f4f3ef"
  tag-text: "#6c6a63"
  table-heading-text: "#6c6a63"
typography:
  display:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "34px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-1.1px"
  headline:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "31px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-1px"
  title:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.3px"
  recommendation-title:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.45px"
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
  navigation: "8px"
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
    backgroundColor: "{colors.charcoal}"
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
    padding: "0 15px"
    height: "47px"
  navigation-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
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

**Creative North Star: “A useful conversation, with your community in view.”**

Roots is a quiet conversation workspace for nonprofit coordinators. Warm neutral paper, charcoal text, open space, and fine dividers support reading and acting. A small green sprout keeps the identity present without tinting the whole product.

The user selected the conversation-first concept, then asked for less green and stronger intelligence/insights. This supersedes the earlier dashboard composition, forest primary actions, sage feature panels, and four-destination navigation. The previous visual reference still informs DM Sans, restrained corners, clear copy, and approachable record details. Do not restore the old dashboard hierarchy merely because older styles or screenshots retain it.

Implementation authority is the shared shell in `dist/style.css` and `dist/app.js`, the neutral overrides in `dist/neutral.css`, and the conversation surface in `dist/conversation.js` and `dist/conversation.css`. `opportunities`, `people-detail`, and `notices` remain the scoped modules for deeper work. The neutral stylesheet overrides the older botanical palette across those surfaces.

## Color and material

- **Paper `#faf9f6`** is the page and sheet ground; **white** is reserved for fields and contained work such as message drafts.
- **Charcoal `#343632`** carries text and primary actions. **Deep `#242622`** is the stronger hover state.
- **Muted `#6c6a63`** carries secondary copy. **Line `#e2e0d9`** separates rows and surfaces; **Field Line `#cbc8be`** gives inputs a clearer boundary.
- **Sidebar `#f2f1ed`**, **Soft Surface `#f4f3ef`**, **Hover `#eeede7`**, and **Selected `#e6e4dd`** establish a quiet neutral hierarchy.
- **Brand Accent `#5b7153`** belongs to the sprout, wordmark dot, and similarly small identity cues. Green status text may remain when it conveys an actual positive state, paired with a label.
- Warm amber status styling uses `#f5ece1` with `#81562e`. Avatar accents remain muted identifiers rather than navigation or action colors.

The legacy CSS variable `--forest` now resolves to charcoal, and `--sage` resolves to a neutral hover surface. These names are compatibility aliases, not permission to add dominant green treatments. Use the neutral token values when extending the product.

Selection uses `#dedbd1`; the scrollbar thumb uses `#c4c1b7`. Carets, checkbox accents, and keyboard focus use charcoal. Ordinary surfaces stay flat. Sheets use a restrained side shadow and a neutral backdrop without decorative blur.

## Typography

Self-hosted DM Sans remains the sole UI family, with regular, medium, semibold, and bold weights available. Use medium weight for the conversation greeting, insight titles, and primary section labels; stronger weight should identify something worth scanning rather than decorate the page.

The initial Chat greeting is 34px with a 1.2 line height and −1.1px tracking, stepping to 30px and then 29px at smaller widths. Conversation text is 14px with generous line spacing. Insight titles are 14px and explanations are 12px; both compact after the conversation starts. The composer uses 14px text on desktop and 16px on phones to preserve comfortable entry without browser zoom. Existing record pages retain their practical 12–14px text hierarchy.

Functional metadata, evidence controls, readiness notes, and navigation should remain readable at the established 11px floor. Air comes from fewer visible controls and better spacing, not smaller type. Keep body contrast at least 4.5:1 and maintain visible focus on every interactive control.

## Navigation and layout

Primary navigation contains **Chat, People, Opportunities**. Drafts, Workflows, and Calendar are secondary tools, accessible from the sidebar and the Chat utility controls. Connection details open from the quiet status control above the conversation. Old Overview links resolve to Chat; old Funding links resolve to Opportunities. Notices and event routes remain available as supporting views.

The shared desktop shell keeps its fixed sidebar and responsive page container, but Chat has its own centered reading layout. Its workspace is capped at 1050px and the conversation column at 720px. The column contains a short greeting, two compact insight rows with an optional third, the transcript, and a composer at the bottom. It does not show the old metric strip, recommendation-card grid, or event rail.

The composer is sticky near the bottom of the viewport and remains part of the reading column. On phones it sits above the 67px bottom navigation and safe-area inset. The three navigation labels remain visible. Inputs and draft controls stack as needed; tables retain horizontal overflow inside their own wrappers rather than widening the page.

Before the first message, the greeting and insights establish what Roots knows and what the coordinator can do. Once messages exist, the greeting disappears, insights contract to concise titles and expandable evidence, and conversation receives the space. On phones the active-conversation state shows at most two insight rows. This is a density change, not a second dashboard.

## Insights and freshness

“Worth a thought” initially shows two useful observations supported by current records; “One more suggestion” reveals the third when available. Each row has a concrete title, a short explanation, and a “Why this surfaced” disclosure. That disclosure contains evidence, explicit unknowns, and links to the relevant person, event, opportunity, or project. Clicking a title places a suggested question in the composer; the user remains able to edit it before asking.

Current examples connect first-visit gardeners to an event with remaining capacity, service-hour interests to a school-partnership lead, and a suggested project team to its different recorded availability. All source records are illustrative. An interest match does not prove eligibility, an aggregate attendance count does not identify individual RSVPs, and a proposed role does not mean somebody has agreed to it.

Insights recheck when record content changes, every 30 minutes while the app is open, when the page becomes visible again, or through manual refresh. Browser record checks provide a static-demo fallback; the local bridge supplies cached insights with stable IDs when available. The UI shows a checked time and evidence scope. It must not convert repeated checks into invented discoveries, fake activity, or a new-looking stream of unchanged ideas. There is no insight-dismiss control in this version.

A failed server refresh preserves the available evidence and exposes the failure. Empty records produce an honest empty state. Checking stops with the app; this surface does not promise background monitoring after closure.

## Conversation and inline actions

User messages use a soft neutral bubble aligned to the right. Assistant text sits directly on the page, identified by a small Roots label and sprout. Keep answers readable and actions concrete. A concise checking state is appropriate during an actual request; failures expose a retry or conversation-recovery action instead of fabricating a reply.

The composer is a white field with a fine neutral border, restrained 15px radius, and a charcoal send control. Its height grows with the text within a bounded range. The nearby note states whether a local assistant is needed and that SMS/email delivery is not connected. A missing assistant connection opens connection guidance; the static preview does not pretend to answer with a live model.

An email or SMS draft appears inline as an action card. It shows channel, recipient, message, **Not sent**, and explicit readiness blockers. Recipient names open their records. **Edit message** changes the existing unsent backend draft; **Copy** copies text; **Refine in chat** prepares a follow-up instruction. Save and cancel controls replace the action row during editing. None of these actions delivers outreach.

Keep drafts and draft revisions visible in context and available through the deeper Drafts tool. Phone numbers, consent, provider connection, and other missing delivery prerequisites must not be hidden behind a successful-looking status. Do not add a Send action while delivery is unavailable.

## People and opportunities

People remains a searchable table with individual records in a 620px sheet. Profile, Activity, and Notes tabs separate preferences and contact facts, illustrative participation history, and locally recorded context. Stated interests remain distinct from declared skills. Contact preference remains distinct from permission. A local service-hour target and an illustrative target require different source labels. Unfinished notes and preferences remain in memory when moving between profile tabs; explicit saves persist them.

Opportunities uses For volunteers, For organization, Projects, and Saved views. Eleven candidate leads and three draft project plans appear in compact searchable rows, six results at a time. A separate save action makes bookmarking clear. Details reveal benefits and a few matching people first, then collapse additional matches, terms, next steps, budgets, and readiness checks. Teams and budgets are drafts; source links are leads to verify, not confirmed offers.

Both surfaces share neutral fields, fine dividers, charcoal actions, and the established focus behavior. The standard sheet remains 540px wide, with the People exception above; all sheets fill phone width and retain a sticky close header. Avoid moving their detailed controls into the Chat landing state.

## Secondary tools and connection truth

Notices retains reviewable recommendations, unsent drafts, workflow configuration, and connection support. Workflow rows summarize trigger, timing, channel, and draft status. Saving a rule does not activate it. Audience previews do not establish actual bookings or send permission, and automatic outreach remains unavailable.

The published site is a static preview with browser-local records. The local bridge synchronizes a snapshot of those records for Gemini and an explicitly configured Telegram connection. These are separate origins and do not share browser storage automatically. A private Telegram request and a web question may use the same local snapshot, but the published site has no hosted assistant connection by default.

The connection surface reports configuration, synchronization, polling, and failure states plainly. Credential presence alone is not a live connection test. Model-generated answers and draft creation require the local server; credentials never belong in the frontend. No fabricated answers or simulated delivery statuses should fill a disconnected state.

## Interaction quality

Use explicit button labels, native disclosure controls, accessible tab semantics, and keyboard focus return. Keep text selection, caret, scrollbars, hover, and active states consistent with the neutral material. Motion stays restrained: the existing sheet transition and an actual pending-request indicator are enough. Respect reduced-motion preferences.

Preserve the useful underlying records while keeping the first screen quiet. Do not restore metric cards as the main entry point, turn every insight into a colored tile, add a primary navigation destination for every capability, or confuse a refresh with new evidence. The product should make it easy to ask, understand, inspect, and act without concealing what remains unverified.
