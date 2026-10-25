---
name: Roots
description: A forest-green Overview dashboard with current-record analytics and independent recommendations.
colors:
  forest: "#234c3c"
  deep: "#193d30"
  brand-accent: "#234c3c"
  sage: "#e8eddf"
  featured: "#e8eddf"
  featured-line: "#dbe4cf"
  positive-bg: "#d8e5c6"
  positive-text: "#496134"
  peach: "#f9ebdf"
  action-bg: "#f7ebdf"
  action-text: "#87522c"
  paper: "#f7f8f3"
  surface: "#fff"
  sidebar: "#eff2e9"
  soft-surface: "#edf2e7"
  hover-surface: "#e6eddf"
  topbar: "#f7f8f3"
  sheet: "#fbfcf8"
  ink: "#23392f"
  muted: "#596d5f"
  secondary-text: "#596d5f"
  recommendation-text: "#53684f"
  line: "#dfe5da"
  focus: "#587842"
  selected: "#234c3c"
  field-line: "#cbd6c3"
  tag-bg: "#f1f3ed"
  tag-text: "#59694b"
  table-heading-text: "#596d5f"
typography:
  display:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.8px"
  headline:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "30px"
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
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.4px"
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
  action:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
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
  navigation: "7px"
  compact-card: "10px"
  preview: "12px"
  card: "14px"
  composer: "12px"
  insight-card: "13px"
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
    backgroundColor: "{colors.forest}"
    textColor: "{colors.surface}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
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
    padding: "10px 12px"
    height: "42px"
  navigation-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.surface}"
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
    rounded: "{rounded.preview}"
    padding: "16px 19px"
  recommendation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.insight-card}"
    padding: "23px"
  recommendation-featured:
    backgroundColor: "{colors.featured}"
    textColor: "{colors.ink}"
    rounded: "{rounded.insight-card}"
    padding: "23px"
  event-date:
    backgroundColor: "{colors.soft-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    width: "39px"
    height: "51px"
---

# Design System: Roots

## Direction and authority

**Creative North Star: “Good things are taking root.”**

Roots opens on an Overview dashboard that combines current community analytics, useful recommendations, and upcoming events. Dark forest navigation and primary actions, sage featured cards, white analytical surfaces, warm paper, and self-hosted DM Sans restore the original Roots identity.

The user's latest direction prefers the original darker green style and asks for a better presentation of insights and analytics on the first page. The original Overview screenshot and forest-green dashboard composition are the visual reference. This supersedes the narrow Today and conversation-first layouts. Preserve a useful dashboard hierarchy while keeping cards compact and supporting details accessible on demand.

Implementation authority is the shared shell in `dist/style.css` and `dist/app.js`, plus the Overview overrides in `dist/briefing.css`. `dist/briefing.js` renders Overview, and `dist/analytics.js` computes current-record arithmetic. `dist/neutral.css` is no longer loaded. The `conversation`, `opportunities`, `people-detail`, and `notices` modules provide the supporting workspaces.

## Color and material

- **Forest `#234c3c`** carries selected navigation with white text, primary actions, key chart segments, and the wordmark. **Deep `#193d30`** is the stronger hover state. These dark anchors establish the identity.
- **Paper `#f7f8f3`** is the page ground, **Ink `#23392f`** carries text, and **Muted `#596d5f`** carries supporting copy.
- **Sage `#e8eddf`** highlights the first recommendation. Its border is `#dbe4cf`; later recommendations and analytics cards are white.
- **Sidebar `#eff2e9`**, **Soft Surface `#edf2e7`**, **Hover `#e6eddf`**, **Line `#dfe5da`**, and **Field Line `#cbd6c3`** create a restrained surface hierarchy.
- Participation uses forest for repeat visits, `#b4c992` for one visit, `#e4e8de` for zero visits, and `#a7ada6` for unknown counts. Labels and counts accompany color. Interest bars use `#658952`; event capacity uses `#8ea86d`.
- Warm amber remains available for actual prerequisites or warnings. Muted avatar colors identify people without becoming extra dashboard categories.

Do not flatten selected navigation and primary actions into pale green or charcoal. Ordinary surfaces stay flat, with fine borders and restrained corners. Sheets retain a modest side shadow and backdrop. Focus, caret, selection, hover, and active states remain consistent with the forest palette.

## Typography

Self-hosted DM Sans remains the sole UI family. The Overview heading is 30px, medium weight, with a 1.3 line height and −0.8px tracking. It steps to 28px on smaller desktops and 26px on phones. Metric values use 34px tabular numbers; metric labels are 12px and explanatory text is 11px.

Section headings use 16px semibold. Recommendation titles use 20px medium, with the featured title at 22px; both are 20px on phones. Supporting recommendation copy is 13px with a 1.8 line height. Navigation is 13px, actions are 12px, and compact review metadata is 11px. Ask Roots uses a 30px greeting and comfortable conversation text. Text entry reaches 16px on phones to avoid browser zoom.

Use hierarchy and spacing to make the dashboard scannable. Keep body contrast at least 4.5:1 and visible focus on every interactive control. Record pages retain practical 12–14px text.

## Navigation and layout

Primary navigation contains **Overview, People, Opportunities, Outreach**. Overview keeps the `#briefing` route; `#overview` is an alias. **Ask Roots** and **Calendar** are secondary links. Old Funding links resolve to Opportunities, and the underlying Notices route is labeled Outreach.

The desktop sidebar is **200px** wide, reduces to **180px** between 761px and 1100px, and collapses to a **60px** icon rail. Navigation rows are 42px high with solid forest selection and white text. The wordmark is 29px, and the workspace label and profile remain compact. Hidden labels retain accessible names. The desktop topbar is 56px high with a fine bottom divider.

The page container is capped at **1184px**, including 32px side padding. A familiar heading and **Current records** scope label sit above three compact metric cards. Below them, recommendations occupy the wider left column and analytics the right, using a **1.65:1** grid with a **25px** gap and a 300px minimum right column.

The left column has **Worth your attention**, compact independent review status, two recommendation cards with an optional third, a review explanation disclosure, and a small Ask Roots composer. The right column holds **Community patterns** above **Coming up**. The Overview remains independent of chat messages and is not a centered conversation landing page.

Between 761px and 900px the recommendations stack above a two-card analytics row. On phones all sections stack, the three metrics remain compact across the top, and navigation becomes four labeled bottom items with safe-area spacing. The main phone gutters are 19px. Charts, forms, and disclosures must not force horizontal page scrolling.

Ask Roots remains a separate conversation, with a 700px reading column and its own transcript and inline actions. The Overview composer is a compact entry point: white surface, 12px radius, 12–13px padding, a small sprout, and forest send control. It grows for text and uses a larger input on phones; it does not determine the dashboard's height or composition.

## Snapshot analytics

The three top metrics are **People**, **Recorded hours**, and **Opportunity leads**. The first two open the contributing people; the third opens Opportunities. Current seed totals are **35 people**, **893 recorded hours**, and **11 opportunity leads**. The people card also identifies **8 people with one recorded visit**. These are illustrative saved-record totals, recomputed when records change.

Community patterns switches between **Participation** and **Interests**. Participation shows a stacked bar for one visit, repeat visits, zero visits, and unknown counts. Clicking a segment or legend opens its people. Its headline percentage is repeat-visit profiles divided by profiles with at least one recorded visit: **27 / 35**, rounded to **77%**, in the seed snapshot. The bar itself represents all profiles, including zero and unknown groups when present. State the denominator clearly.

This is a distribution of accumulated visit counts, not cohort retention, a monthly return rate, or a trend. Do not restore the old hardcoded 42%, month-over-month changes, growth arrows, or invented historical series. Missing values are not zero. Recorded hours sum valid direct profile totals and do not use generated attendance stories or illustrative approved/pending breakdowns.

Interests shows the five largest groups by stated interest. Each bar counts people and opens that group; a person may appear in several groups. The bar scale uses the number of people in the workspace, not a claim that categories sum to 100%. Keep names, counts, and an overlap explanation visible.

Coming up shows three date-sorted event rows with date, title, time, recorded attendee/capacity values, open places, and a capacity bar. Each opens the event record; View all opens Calendar. Missing or invalid capacity gets a plain unknown state. Aggregate counts do not establish any named person's RSVP or attendance.

Every chart needs readable labels, keyboard-operable groups, honest empty states, and a path to its underlying records. Unknown data, invalid values, and a lack of history must remain distinct from poor performance.

## Recommendations, evidence, and freshness

Start with two recommendations, with **One more idea** exposing a third when available. The first card uses sage and a forest primary action; the second uses white and a quieter action. Cards have a 13px radius and 23px padding. Each contains a concise title, one factual explanation, referenced people when available, and a direct review action.

**Why this surfaced** reveals the model's suggested next step, evidence, unknowns, source record links, and **Discuss this with Roots**. Referenced avatars open their profiles. **How Roots finds these ideas** explains the review source, bounded fact catalog, cadence, and limitations below the recommendations.

Current matches connect first-visit gardeners to a relevant event, service-hour interests to a school-partnership lead, and a draft project team to different availability descriptions. An interest match is not eligibility; a proposed role is not agreement; recorded capacity does not establish individual RSVPs. All seed records remain illustrative.

In the static preview, recommendations use deterministic record matches. The local bridge independently lets Gemini select and connect a bounded derived fact catalog and propose short interpretations. It does not depend on chat or research external sources. Strict fact IDs are validated; factual summaries, numeric evidence, and citations are reconstructed server-side. This establishes reference integrity and output structure, not the correctness of every interpretation.

Raw phone numbers, email addresses, coordinator notes, and chat history are excluded from recommendation synthesis. The workspace totals shown in explanations are available records, not a claim that every record entered the smaller reviewed catalog. Recommendations must not imply an external benefit, eligibility rule, deadline, partnership, or application has been verified.

Recheck after meaningful record changes, after 30 minutes while the app is open, when it becomes visible again, or on manual refresh. Activity-only and version-only saves are not new evidence. Stable fact-based IDs and caching prevent routine checks from becoming invented discoveries or activity.

Generation exposes **pending, reviewing, ready, and failed** states. Keep the previous successful recommendations visible during review or failure, identify stale evidence, and discard results produced against superseded records. Without a successful AI review, show the labeled record-match fallback. Failures retry through explicit refresh or meaningful data change, subject to the retry guard. No dismiss feature or monitoring after app closure is promised.

Keep status beside the section heading. Three small dots indicate actual checking or pending/reviewing work; reduced motion leaves them static. Show a genuine checked/reviewed time or an error with **Try again**. Never add artificial delay, idle animation, or discovery badges to unchanged ideas.

## Ask Roots and inline actions

Ask Roots is separate from the Overview and accessible through secondary navigation, its compact composer, and recommendation disclosures. User messages use a soft green bubble; assistant text sits directly on the page with a small Roots identity. Checking indicators reflect actual requests, and failures expose recovery rather than fabricated replies.

The conversation composer remains a white field with a fine boundary and forest send control. Nearby text explains connection needs and the lack of email/SMS delivery. The published preview must not imitate a live model connection.

Email and SMS drafts appear inline with recipient, channel, message, **Not sent**, and readiness blockers. Recipient names open records. **Edit message** changes an existing unsent draft; **Copy** copies text; **Refine in chat** prepares a follow-up instruction. None sends outreach. Keep draft revisions available through Outreach and never conceal missing permission, contact details, or providers behind a successful-looking status.

## People and opportunities

People remains a searchable table with individual records in a 620px sheet. Profile, Activity, and Notes separate preferences and contact facts, illustrative participation history, and recorded context. Stated interests remain distinct from declared skills, and contact preference remains distinct from consent. Confirmed and illustrative service-hour targets require separate source labels.

Opportunities uses For volunteers, For organization, Projects, and Saved views. Eleven candidate leads and three draft plans appear in compact searchable rows, six results at a time. Details expose benefits and matching people first, then collapse additional matches, terms, next steps, budgets, and readiness checks. Teams and budgets are drafts; source links are leads to verify.

Both surfaces use the forest-green system and fine dividers. Standard sheets remain 540px wide, with the People exception above, fill phone width, and retain a sticky close header. Detailed controls stay in these workspaces rather than overcrowding Overview.

## Outreach and connection truth

Outreach has **Drafts, Workflows, and Delivery** views. Workflow rows summarize audience rules, timing, channel, and draft status. Saving a rule does not activate or schedule it. Audience previews do not establish bookings, permission, or deliverability.

SMS and email providers are not configured. Delivery counts describe stored profiles, not verified contact details. A contact preference is not permission. No email/SMS outreach has been sent through these features; connecting Gemini or Telegram does not enable delivery.

The published site is static with browser-local records. The optional local bridge synchronizes a snapshot for Gemini and an explicitly configured Telegram connection. Local and published origins do not automatically share browser storage. Web and Telegram may share records and deliberately saved drafts while their conversation histories remain separate; recommendation synthesis uses neither history.

Connection details distinguish configuration, synchronization, polling, and failure. Credential presence is not a live connection test. Model responses and shared assistant draft creation require the local server; credentials never belong in frontend files or browser storage.

## Interaction quality

Use explicit labels, native disclosures, accessible chart groups and selectors, and keyboard focus return. Preserve expanded evidence during status updates where possible. Prefer restrained sheet transitions and truthful work indicators, with reduced-motion support.

Keep Overview practical: current-record patterns, a small number of useful recommendations, and upcoming events. Preserve the darker forest identity and original dashboard hierarchy while making its numbers inspectable and its actions concrete. Keep calculations, interpretations, delivery readiness, and unverified program leads clearly distinguishable.
