---
name: Roots
description: A deep-green intelligence workspace with connected findings, clear provenance, and conversation beneath.
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
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.6px"
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
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.2px"
  body:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  supporting:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "14px"
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
    padding: "0 0 28px"
  dated-finding:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.insight-row}"
    padding: "22px 0"
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

Roots is a deep-green intelligence workspace. Connected findings explain a possibility, expose the records behind it, and offer a useful next step. One readable column, native disclosures, light text, pale sage actions, self-hosted DM Sans, and restrained dividers keep the interface calm. Conversation follows the findings.

The DARK rendition of the earlier Roots concept remains the palette authority. The latest refinement replaces the rejected uneven two-column composition with a 680px reading column on Overview and Opportunities. Source records remain visible beside their finding; deeper evidence and community patterns expand when requested. Notices retains its dated Notes feed. People starts with insight-led Groups and keeps its existing table under Everyone; individual profiles remain intact.

Implementation authority is the shared shell in `dist/style.css` and `dist/app.js`, the composition in `dist/briefing.css`, and the global theme in `dist/dark.css`, which loads last. `dist/briefing.js` renders Overview, `dist/analytics.js` computes current-record arithmetic, `dist/connections.js` derives community possibilities, and `dist/journal.js` records local observation and check dates. The opportunities styles define people-led possibilities and the source library, while people-groups defines Groups and its Everyone table wrapper. Notices retains the dated Notes feed; supporting conversation and people-detail modules share the dark theme. `dist/neutral.css` is no longer loaded.

## Color and material

The canvas is deep forest green with a darker sidebar, softly lighter dark work surfaces, light ink, muted sage supporting text, and pale sage primary actions. Frontmatter owns the exact values. The production theme sets `color-scheme: dark`; it does not switch to the concept's light rendition.

Selected navigation uses the selected surface and light ink. Primary actions use accent with on-accent text, becoming accent-hover on hover. Forest and deep are compatibility aliases for those pale action colors in the current CSS. Ordinary recommendations sit directly on the canvas with generous space between them. Fine dividers separate collapsed supporting rows; the composer supplies the main raised tonal surface.

Participation uses `#abc395` for repeat visits, `#647b51` for one visit, `#394734` for zero visits, and `#798273` for unknown counts. Interest and event-capacity fills also use `#abc395`. Counts and labels accompany colors. Positive, warning, and avatar treatments use muted dark fills with readable light text.

Focus, caret, selection, and active states use the pale accent. Sheets share the dark canvas with a restrained side shadow and dark backdrop. Avoid introducing white cards or sage feature-card framing into this confirmed Overview composition.

## Typography

Self-hosted DM Sans remains the sole UI family. Overview and Opportunities use left-aligned 28px medium page headings with −0.6px tracking; on phones they use 26px. Recommendation and possibility titles use 18px medium text, 1.45 line height, and −0.2px tracking. Explanatory paragraphs use 14px text at 1.8 line height, with a maximum measure of 72ch. Keep that paragraph size on phones.

Visible source links, actions, review status, and evidence controls use 12px text. Expanded evidence uses 13px; local observation dates remain quiet 11px metadata inside the disclosure. Collapsed supporting rows use 13px labels. The participation figure is 29px with tabular numerals; inline record totals are 11px.

Navigation is 13px, standard buttons 12px. The composer uses 14px text on desktop and 16px on phones. Ask Roots retains a 30px greeting and comfortable conversation text. Source-library lead titles remain 15px with 12px descriptions, increasing to 16px and 13px on phones. Notices titles remain 16px with 13px descriptions and 11px date labels.

Use the hierarchy to establish one clear reading order. Keep body contrast at least 4.5:1 and visible focus on every interactive control. People and detailed record pages retain their practical 12–14px text.

## Navigation and layout

Primary navigation contains **Overview, People, Opportunities, Notices**. Overview keeps the `#briefing` route; `#overview` is an alias. **Ask Roots** and **Calendar** are secondary links. Old Funding links resolve to Opportunities; `#outreach` resolves to Notices.

The desktop sidebar is **174px** and collapses to a **60px** icon rail. Navigation rows are 38px high with dark selected-surface fill and light ink. The wordmark is 27px; the workspace label is hidden. Collapsed labels retain accessible names. The desktop topbar is 52px high without a bottom border.

The shared page container caps at **1184px**. Overview, Opportunities, and People Groups use a single **680px** reading column. People Everyone retains a **1080px** table container. Overview starts with a left-aligned, count-aware heading and review status, followed by two findings. A third connection and Community patterns appear as collapsed rows beneath them. The composer shares the full 680px column below. There is no separate Coming up panel, KPI card row, side column, or date rail in these two surfaces.

Each finding reads from title to paragraph to visible provenance. Its primary action and evidence disclosure share a consistent next-step row. The action uses a restrained dark surface and visible boundary. Findings have 28px separation without enclosing cards. Supporting rows use fine horizontal dividers.

The composer retains a 15px radius, 17px 18px 12px padding, multiline field, context label, and 32px pale send control. Submitting opens the existing Ask Roots conversation, which retains a 720px column. Findings remain available independently of prompts.

Desktop heights up to 760px tighten vertical spacing. Page gutters become 25px up to 1000px. At the 760px phone breakpoint, gutters are 20px, the composer input is 16px and send control 44×44px, finding actions have 44px targets, and four labeled navigation items form the bottom bar. The single reading order remains intact.

Opportunities starts with people-led possibilities: a count and possible outcome, three named profiles with avatars, a link to remaining matches, explanatory copy, and the candidate source. The order selector and Funding & support filter sit above this list. On phones the selector label remains accessible but is visually hidden so the controls fit one row. Its source library uses expandable summaries without individual date columns. People Groups uses the same readable 18px headings and 14px body, with 32px between groups and native disclosures for members and related leads. Notices retains a **900px** dated text feed with a 64px date column, 23px gap, and 24px vertical entry padding. On phones, Notices dates move above each body. Native disclosures expand in place. Charts, feeds, and disclosures must not force horizontal page scrolling.

## Snapshot analytics

Inside the collapsed Community patterns row, inline counts show **People**, **Recorded hours**, and **Opportunity leads**. The first two open contributing people; the third opens Opportunities. Seed totals are **35 people**, **893 recorded hours**, and **11 opportunity leads**. These are illustrative saved-record totals, recomputed when records change.

Community patterns switches between **Participation**, **Interests**, and **Events**. Participation shows a stacked bar for one visit, repeat visits, zero visits, and unknown counts. Clicking a segment or legend opens its people. Its headline percentage is repeat-visit profiles divided by profiles with at least one recorded visit: **27 / 35**, rounded to **77%**, in the seed snapshot. The bar itself represents all profiles, including zero and unknown groups when present. State the denominator clearly.

This is a distribution of accumulated visit counts, not cohort retention, a monthly return rate, or a trend. Do not restore the old hardcoded 42%, month-over-month changes, growth arrows, or invented historical series. Missing values are not zero. Recorded hours sum valid direct profile totals and do not use generated attendance stories or illustrative approved/pending breakdowns.

Interests shows the five largest groups by stated interest. Each bar counts people and opens that group; a person may appear in several groups. The bar scale uses the number of people in the workspace, not a claim that categories sum to 100%. Keep names, counts, and an overlap explanation visible.

The Events tab shows up to three event rows with date, title, time, recorded attendee/capacity values, open places, and a capacity bar. Each opens the event record; Calendar remains in secondary navigation. Missing or invalid capacity gets a plain unknown state. Aggregate counts do not establish any named person's RSVP or attendance.

Every chart needs readable labels, keyboard-operable groups, honest empty states, and a path to its underlying records. Unknown data, invalid values, and a lack of history must remain distinct from poor performance.

## Recommendations, evidence, and freshness

Show two connected findings in one column. Each follows the same sequence: 18px title, readable explanatory paragraph, visible links to contributing people, events, projects, or leads, then a primary action and **Why this surfaced**. An optional third connection follows as a native disclosure. No finding receives feature-card fill.

**Why this surfaced** reveals the suggested next step, evidence, unknowns, source record links, **Discuss this with Roots**, and the local observation date. Referenced links open their underlying records. **How Roots finds these ideas** explains the review source, bounded fact catalog, cadence, and limitations in the page footnotes. Community patterns is another collapsed row with the existing charts and interpretation inside.

Current matches connect first-visit gardeners to a relevant event, service-hour interests to a school-partnership pathway, and supported proposed project roles to people’s stated interests and a candidate support lead. A positive project possibility replaces a duplicate coordination warning for that project. An interest match is not eligibility or a verified skill; a proposed role is not agreement; recorded capacity does not establish individual RSVPs. All seed records remain illustrative.

In the static preview, recommendations use deterministic record matches. The local bridge independently lets Gemini select and connect a bounded derived fact catalog and propose short interpretations. It does not depend on chat or research external sources. Strict fact IDs are validated; factual summaries, numeric evidence, and citations are reconstructed server-side. This establishes reference integrity and output structure, not the correctness of every interpretation.

Raw phone numbers, email addresses, coordinator notes, and chat history are excluded from recommendation synthesis. The workspace totals shown in explanations are available records, not a claim that every record entered the smaller reviewed catalog. Recommendations must not imply an external benefit, eligibility rule, deadline, partnership, or application has been verified.

Recheck after meaningful record changes, after 30 minutes while the app is open, when it becomes visible again, or on manual refresh. Activity-only and version-only saves are not new evidence. Stable fact-based IDs and caching prevent routine checks from becoming invented discoveries or activity.

Local journal dates distinguish first observation, meaningful content change, and a manual check. Overview keeps observation dates inside evidence, and Opportunities shows one actual record-check line above its tabs without per-lead date rails. Notices retains dated entries. A repeat check may advance checked time but must retain unchanged entry dates. These dates describe local record observations or checks, not external discovery or verification.

Generation exposes **pending, reviewing, ready, and failed** states. Keep the previous successful recommendations visible during review or failure, identify stale evidence, and discard results produced against superseded records. Without a successful AI review, show the labeled record-match fallback. Failures retry through explicit refresh or meaningful data change, subject to the retry guard. No dismiss feature or monitoring after app closure is promised.

Keep review status beneath the page heading. Three small dots indicate actual checking or pending/reviewing work; reduced motion leaves them static. Show a genuine checked/reviewed time or an error with **Try again**. Never add artificial delay, idle animation, or discovery badges to unchanged ideas.

## Ask Roots and inline actions

Ask Roots is accessible through secondary navigation, the Overview composer beneath the intelligence, and recommendation disclosures. Submitting the Overview composer hands the prompt into the existing conversation. User messages use a soft green bubble; assistant text sits directly on the page with a small Roots identity. Checking indicators reflect actual requests, and failures expose recovery rather than fabricated replies.

The conversation composer uses the dark surface with a fine boundary and pale sage send control. Nearby text explains connection needs and the lack of email/SMS delivery. The published preview must not imitate a live model connection.

Email and SMS drafts appear inline with recipient, channel, message, **Not sent**, and readiness blockers. Recipient names open records. **Edit message** changes an existing unsent draft; **Copy** copies text; **Refine in chat** prepares a follow-up instruction. None sends outreach. Keep draft revisions available through Notices and never conceal missing permission, contact details, or providers behind a successful-looking status.

## People and opportunities

People opens in **Groups**, with **Interests**, **Participation**, and **Age groups** selectors. The four largest interest groups appear first; Show all reveals the rest. Each group pairs its count with a possible next step and expands into member profile links and related leads. Groups use one 680px reading column and 32px separation, without cards. **Everyone** preserves the full searchable table, All people / Active / First visit filters, and Add volunteer in a container up to 1080px. Individual records still use a 620px sheet. Profile, Activity, and Notes separate preferences and contact facts, illustrative participation history, and recorded context. Stated interests remain distinct from declared skills, and contact preference remains distinct from consent. Confirmed and illustrative service-hour targets require separate source labels. Interest groups can overlap and count each person once per normalized interest. Participation uses total visits with unknown distinct from zero. Age groups use only explicit ageGroup or ageBand text on the person record; the empty demo state is plain explanatory copy, with no inferred ages or needs.

Opportunities defaults to **For your community**. Three people-led possibilities appear initially, with Show three more available. A count and possible outcome lead into three named profile buttons with avatars, a link to all remaining matches, a short explanation, and the candidate source. **Why these people** reveals distinct theme counts, people with closer overlap, any related project, a next step, and a chat action. **Most people** sorts by matching profiles; **Closest match** sorts by people with at least two matching themes, then total reach. **Funding & support** filters support leads without assigning or ranking unverified award values. **All leads**, **Projects**, and **Saved** retain eleven candidate leads and three draft plans. All leads has Everyone, For volunteers, and For the organization filters. The library preserves search, saves, native summaries, detailed sheets, and four-at-a-time results. Check again reviews local saved records and does not search the web. Details expose benefits and matching people first, then collapse additional matches, terms, next steps, budgets, and readiness checks. Teams and budgets are drafts; source links are leads to verify.

Both surfaces use the forest-green system and fine dividers. Standard sheets remain 540px wide, with the People exception above, fill phone width, and retain a sticky close header. Detailed controls stay in these workspaces rather than overcrowding Overview.

## Notices and connection truth

Notices defaults to **Notes**, a dated text feed with expandable **Notes & people**, profile links, review actions, and a Reviewed filter. **Drafts, Workflows, and Delivery** remain additional views. Check records updates the local scope check time, while unchanged findings retain their dates. Workflow rows summarize audience rules, timing, channel, and draft status. Saving a rule does not activate or schedule it. Audience previews do not establish bookings, permission, or deliverability.

SMS and email providers are not configured. Delivery counts describe stored profiles, not verified contact details. A contact preference is not permission. No email/SMS outreach has been sent through these features; connecting Gemini or Telegram does not enable delivery.

The published site is static with browser-local records. The optional local bridge synchronizes a snapshot for Gemini and an explicitly configured Telegram connection. Local and published origins do not automatically share browser storage. Web and Telegram may share records and deliberately saved drafts while their conversation histories remain separate; recommendation synthesis uses neither history.

Connection details distinguish configuration, synchronization, polling, and failure. Credential presence is not a live connection test. Model responses and shared assistant draft creation require the local server; credentials never belong in frontend files or browser storage.

## Interaction quality

Use explicit labels, native disclosures, accessible chart groups and selectors, and keyboard focus return. Preserve expanded evidence during status updates where possible. Prefer restrained sheet transitions and truthful work indicators, with reduced-motion support.

Keep Overview practical: a small number of connected findings with visible provenance, supporting patterns available on demand, and the composer beneath. Preserve the full dark green canvas and one reading order. Opportunities should explain what the community could do with its people and leads, while retaining the underlying library. People Groups should connect shared interests to useful conversations while Everyone retains the complete records. Keep the dated Notices feed consistent with the shared theme. Keep calculations, interpretations, delivery readiness, and unverified program leads clearly distinguishable.
