---
name: Roots
description: A deep-green workspace centered on conversation, with independent recommendations and compact analytics.
colors:
  forest: "#d6e5ca"
  deep: "#e2eed9"
  brand-accent: "#d6e5ca"
  sage: "#344331"
  featured: "#293228"
  featured-line: "#3c473a"
  positive-bg: "#34492d"
  positive-text: "#bdd7a8"
  peach: "#483b30"
  action-bg: "#493b2d"
  action-text: "#e6bd93"
  paper: "#20251f"
  surface: "#2a3129"
  sidebar: "#1b201b"
  soft-surface: "#293228"
  hover-surface: "#303c2e"
  topbar: "#20251f"
  sheet: "#20251f"
  ink: "#e5e9df"
  muted: "#a9b4a6"
  secondary-text: "#a9b4a6"
  recommendation-text: "#a9b4a6"
  line: "#3c473a"
  focus: "#d6e5ca"
  selected: "#344331"
  field-line: "#73836d"
  tag-bg: "#344331"
  tag-text: "#c7d2bf"
  table-heading-text: "#a9b4a6"
  accent: "#d6e5ca"
  accent-hover: "#e2eed9"
  on-accent: "#21351f"
typography:
  display:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "31px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.85px"
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
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.12px"
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
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.8
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
  composer: "15px"
  insight-row: "0px"
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
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
    textColor: "{colors.accent}"
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
    padding: "9px 11px"
    height: "38px"
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
  composer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.composer}"
    padding: "17px 18px 12px"
  recommendation:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.insight-row}"
    padding: "16px 0 14px"
  event-date:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    width: "39px"
    height: "51px"
---

# Design System: Roots

## Direction and authority

**Creative North Star: “What could we make happen?”**

Roots is a deep-green workspace centered on conversation. A prominent composer begins the page, with restrained insight rows and compact community patterns beneath it. Light text, pale sage actions, self-hosted DM Sans, and thin dividers establish a quiet, practical interface.

The visual authority is the DARK rendition of the user's earlier central-chat concept in `roots-quieter-workspace.html`. Its `light-dark()` declarations specify the intended dark palette. The subsequent light broad dashboard was a mistaken reference. Preserve the confirmed dark canvas and centered hierarchy while keeping recommendations independent of chat.

Implementation authority is the shared shell in `dist/style.css` and `dist/app.js`, the composition in `dist/briefing.css`, and the global theme in `dist/dark.css`, which loads last. `dist/briefing.js` renders Overview and `dist/analytics.js` computes current-record arithmetic. `dist/neutral.css` is no longer loaded. The supporting conversation, opportunities, people-detail, and notices modules share the dark theme.

## Color and material

The canvas is deep forest green with a darker sidebar, softly lighter dark work surfaces, light ink, muted sage supporting text, and pale sage primary actions. Frontmatter owns the exact values. The production theme sets `color-scheme: dark`; it does not switch to the concept's light rendition.

Selected navigation uses the selected surface and light ink. Primary actions use accent with on-accent text, becoming accent-hover on hover. Forest and deep are compatibility aliases for those pale action colors in the current CSS. Ordinary recommendations sit directly on the canvas with a bottom divider; the composer supplies the main raised tonal surface.

Participation uses `#abc395` for repeat visits, `#647b51` for one visit, `#394734` for zero visits, and `#798273` for unknown counts. Interest and event-capacity fills also use `#abc395`. Counts and labels accompany colors. Positive, warning, and avatar treatments use muted dark fills with readable light text.

Focus, caret, selection, and active states use the pale accent. Sheets share the dark canvas with a restrained side shadow and dark backdrop. Avoid introducing white cards or sage feature-card framing into this confirmed Overview composition.

## Typography

Self-hosted DM Sans remains the sole UI family. The centered Overview heading is 31px, medium weight, with 1.3 line height and −0.85px tracking. On phones it becomes left-aligned at 27px with −0.65px tracking. The participation figure is 29px with tabular numerals; inline record totals are 11px.

Overview section labels use 13px medium text. Recommendation titles use 15px medium text, 1.5 line height, and −0.12px tracking; summaries use 12px text at 1.8 line height. Phone summaries rise to 13px. Navigation is 13px, standard buttons 12px, and compact actions and review metadata 11px. The prominent composer uses 14px text on desktop and 16px on phones. Ask Roots retains a 30px greeting and comfortable conversation text.

Use the restrained hierarchy to keep the composer prominent and supporting records readable. Keep body contrast at least 4.5:1 and visible focus on every interactive control. Record pages retain practical 12–14px text.

## Navigation and layout

Primary navigation contains **Overview, People, Opportunities, Outreach**. Overview keeps the `#briefing` route; `#overview` is an alias. **Ask Roots** and **Calendar** are secondary links. Old Funding links resolve to Opportunities, and the underlying Notices route is labeled Outreach.

The desktop sidebar is **174px** and collapses to a **60px** icon rail. Navigation rows are 38px high with dark selected-surface fill and light ink. The wordmark is 27px; the workspace label is hidden. Collapsed labels retain accessible names. The desktop topbar is 52px high without a bottom border.

The shared page container caps at **1184px**, with Overview and Ask Roots each centered in a **720px** column. Overview starts with **What could we make happen?** and its prominent composer, followed by **Worth your attention**, two insight rows with an optional third, and **Community patterns**. The latter offers Participation, Interests, and Events tabs and inline record counts. Footnotes hold the review explanation and illustrative-record label. There is no separate Coming up panel or row of KPI cards.

The composer has a 15px radius, 17px 18px 12px padding, a multiline field, context label, and 32px pale send control. Submitting opens the existing Ask Roots conversation. Overview's independent insights remain available without a prompt.

At desktop heights up to 760px, top spacing and row padding tighten. At widths up to 1000px, page gutters become 25px. On phones at 760px and below, the heading aligns left, content uses 20px gutters, the composer input becomes 16px and its send control becomes 44×44px, chart content stacks, and navigation becomes four labeled bottom items with safe-area spacing. Charts, forms, and disclosures must not force horizontal page scrolling.

## Snapshot analytics

Inline counts beneath Community patterns show **People**, **Recorded hours**, and **Opportunity leads**. The first two open contributing people; the third opens Opportunities. Seed totals are **35 people**, **893 recorded hours**, and **11 opportunity leads**. These are illustrative saved-record totals, recomputed when records change.

Community patterns switches between **Participation**, **Interests**, and **Events**. Participation shows a stacked bar for one visit, repeat visits, zero visits, and unknown counts. Clicking a segment or legend opens its people. Its headline percentage is repeat-visit profiles divided by profiles with at least one recorded visit: **27 / 35**, rounded to **77%**, in the seed snapshot. The bar itself represents all profiles, including zero and unknown groups when present. State the denominator clearly.

This is a distribution of accumulated visit counts, not cohort retention, a monthly return rate, or a trend. Do not restore the old hardcoded 42%, month-over-month changes, growth arrows, or invented historical series. Missing values are not zero. Recorded hours sum valid direct profile totals and do not use generated attendance stories or illustrative approved/pending breakdowns.

Interests shows the five largest groups by stated interest. Each bar counts people and opens that group; a person may appear in several groups. The bar scale uses the number of people in the workspace, not a claim that categories sum to 100%. Keep names, counts, and an overlap explanation visible.

The Events tab shows up to three event rows with date, title, time, recorded attendee/capacity values, open places, and a capacity bar. Each opens the event record; Calendar remains in secondary navigation. Missing or invalid capacity gets a plain unknown state. Aggregate counts do not establish any named person's RSVP or attendance.

Every chart needs readable labels, keyboard-operable groups, honest empty states, and a path to its underlying records. Unknown data, invalid values, and a lack of history must remain distinct from poor performance.

## Recommendations, evidence, and freshness

Start with two recommendations, with **One more idea** exposing a third when available. Each is a restrained row directly on the canvas, separated by a fine bottom border and 16px 0 14px padding. A concise title and small review action share the first line, followed by factual supporting copy and an evidence disclosure. No recommendation receives feature-card fill.

**Why this surfaced** reveals the model's suggested next step, evidence, unknowns, source record links, and **Discuss this with Roots**. Referenced source links open their records. **How Roots finds these ideas** explains the review source, bounded fact catalog, cadence, and limitations in the page footnotes.

Current matches connect first-visit gardeners to a relevant event, service-hour interests to a school-partnership lead, and a draft project team to different availability descriptions. An interest match is not eligibility; a proposed role is not agreement; recorded capacity does not establish individual RSVPs. All seed records remain illustrative.

In the static preview, recommendations use deterministic record matches. The local bridge independently lets Gemini select and connect a bounded derived fact catalog and propose short interpretations. It does not depend on chat or research external sources. Strict fact IDs are validated; factual summaries, numeric evidence, and citations are reconstructed server-side. This establishes reference integrity and output structure, not the correctness of every interpretation.

Raw phone numbers, email addresses, coordinator notes, and chat history are excluded from recommendation synthesis. The workspace totals shown in explanations are available records, not a claim that every record entered the smaller reviewed catalog. Recommendations must not imply an external benefit, eligibility rule, deadline, partnership, or application has been verified.

Recheck after meaningful record changes, after 30 minutes while the app is open, when it becomes visible again, or on manual refresh. Activity-only and version-only saves are not new evidence. Stable fact-based IDs and caching prevent routine checks from becoming invented discoveries or activity.

Generation exposes **pending, reviewing, ready, and failed** states. Keep the previous successful recommendations visible during review or failure, identify stale evidence, and discard results produced against superseded records. Without a successful AI review, show the labeled record-match fallback. Failures retry through explicit refresh or meaningful data change, subject to the retry guard. No dismiss feature or monitoring after app closure is promised.

Keep status beside the section heading. Three small dots indicate actual checking or pending/reviewing work; reduced motion leaves them static. Show a genuine checked/reviewed time or an error with **Try again**. Never add artificial delay, idle animation, or discovery badges to unchanged ideas.

## Ask Roots and inline actions

Ask Roots is accessible through secondary navigation, the prominent Overview composer, and recommendation disclosures. Submitting the Overview composer hands the prompt into the existing conversation. User messages use a soft green bubble; assistant text sits directly on the page with a small Roots identity. Checking indicators reflect actual requests, and failures expose recovery rather than fabricated replies.

The conversation composer uses the dark surface with a fine boundary and pale sage send control. Nearby text explains connection needs and the lack of email/SMS delivery. The published preview must not imitate a live model connection.

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

Keep Overview practical: current-record patterns, a small number of useful recommendations, and upcoming events. Preserve the full dark green canvas and centered composer-first hierarchy while making its numbers inspectable and its actions concrete. Keep calculations, interpretations, delivery readiness, and unverified program leads clearly distinguishable.
