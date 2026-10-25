---
name: Roots
description: A deep-green intelligence workspace with connected findings, funded programmes and partnerships, and inspectable people and capacity.
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
  overview-heading:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.6px"
  overview-finding:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.2px"
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
    padding: "10px 13px"
    height: "43px"
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
    padding: "0 0 26px"
  dated-finding:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.insight-row}"
    padding: "22px 0"
  overview-shell:
    width: "1020px"
  sidebar-shell:
    backgroundColor: "{colors.sidebar}"
    width: "204px"
  message-workbench:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  people-initial:
    rounded: "{rounded.circle}"
    width: "40px"
    height: "40px"
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

Roots is a deep-green intelligence workspace. Connected findings and practical proposals expose the records behind them and offer a useful next step. Overview now pairs visible analytics on the left with two dated findings on the right, beneath a greeting and observed daily changes. Conversation follows both columns. People Groups and Opportunities retain narrative beside tightly overlapping initials and evidence. Native disclosures, light text, pale sage actions, self-hosted DM Sans, and restrained dividers keep the interface calm.

The DARK rendition of the earlier Roots concept remains the palette authority. The approved layout expands Overview to 1020px and the desktop sidebar to 204px. People Groups and Opportunities retain open paired rows in 1000px containers: narrative on the left, initials and recorded evidence on the right, stacked on mobile. People begins with Ways to take part; Opportunities begins with open funding and funded host programmes. Deeper evidence and member lists expand when requested. Notices retains its dated Notes feed; Everyone keeps the searchable table. Profiles add optional context the person has shared.

Implementation authority is the shared shell in `dist/style.css` and `dist/app.js`, the composition in `dist/briefing.css`, and the global theme in `dist/dark.css`, which loads last. `dist/briefing.js` renders Overview, `dist/analytics.js` computes current-record arithmetic, `dist/connections.js` derives Overview possibilities, `dist/programs.js` stores researched terms, `dist/program-fit.js` evaluates programme criteria, `dist/journal.js` records local finding observation and check dates, and `dist/daily.js` maintains the separate local change ledger. The opportunities styles define programme rows and the source library, while people-groups defines Groups and its Everyone table wrapper. Notices retains the dated Notes feed; supporting conversation and people-detail modules share the dark theme. `dist/neutral.css` is no longer loaded.

## Color and material

The canvas is deep forest green with a darker sidebar, softly lighter dark work surfaces, light ink, muted sage supporting text, and pale sage primary actions. Frontmatter owns the exact values. The production theme sets `color-scheme: dark`; it does not switch to the concept's light rendition.

Selected navigation uses the selected surface and light ink. Primary actions use accent with on-accent text, becoming accent-hover on hover. Forest and deep are compatibility aliases for those pale action colors in the current CSS. Ordinary recommendations sit directly on the canvas with generous space between them. Fine dividers separate collapsed supporting rows; the composer supplies the main raised tonal surface.

Participation uses `#abc395` for repeat visits, `#647b51` for one visit, `#394734` for zero visits, and `#798273` for unknown counts. Interest and event-capacity fills also use `#abc395`. Counts and labels accompany colors. Positive, warning, and avatar treatments use muted dark fills with readable light text.

Focus, caret, selection, and active states use the pale accent. Sheets share the dark canvas with a restrained side shadow and dark backdrop. Avoid introducing white cards or sage feature-card framing into this confirmed Overview composition.

## Typography

Self-hosted DM Sans remains the sole UI family. Overview uses a 30px medium greeting with 1.3 line height and −0.6px tracking, reduced to 27px on phones. Opportunities and People Groups retain left-aligned 28px medium page headings, reduced to 26px on phones. Overview findings use 19px medium titles with 1.45 line height and −0.2px tracking; People group titles retain 18px. Daily section titles use 16px medium text. Opportunity programme titles use 20px medium text, 1.45 line height, and −0.3px tracking. Explanatory paragraphs retain 14px text and a measure up to 72ch; Overview findings use 1.75 line height, while People and programme descriptions retain 1.8. Keep that paragraph size on phones.

Visible source links, actions, review status, and evidence controls use 12px text. Expanded evidence uses 13px; local observation dates appear as quiet 11px metadata directly below each Overview finding title, with the fuller timestamp repeated inside its disclosure. Collapsed supporting rows use 13px labels. The Overview participation figure is 30px with tabular numerals; inline record totals are 11px. Its compact denominator note is 10px; retain the explicit wording rather than implying retention.

Primary navigation is 14px on desktop and 12px on phones; secondary navigation is 13px. Standard buttons remain 12px. The composer uses 14px text on desktop and 16px on phones. Ask Roots retains a 30px greeting and comfortable conversation text. Source-library lead titles remain 15px with 12px descriptions, increasing to 16px and 13px on phones. Notices titles remain 16px with 13px descriptions and 11px date labels.

Use the hierarchy to establish one clear reading order. Keep body contrast at least 4.5:1 and visible focus on every interactive control. People and detailed record pages retain their practical 12–14px text.

## Navigation and layout

Primary navigation contains **Overview, People, Opportunities, Notices**. Overview keeps the `#briefing` route; `#overview` is an alias. **Ask Roots** and **Calendar** are secondary links. Old Funding links resolve to Opportunities; `#outreach` resolves to Notices.

The desktop sidebar is **204px** and collapses to a **60px** icon rail. Navigation rows are 43px high with 10px 13px padding, 19px icons, dark selected-surface fill and light ink. The wordmark is 29px; the workspace label is hidden. Collapsed labels retain accessible names. The desktop topbar remains 52px high without a bottom border.

The shared page container caps at **1184px**. Overview is **1020px** wide, with a local-time greeting and date, observed changes for Today / Last 7 days, then an analytics-left/findings-right grid. The grid uses `minmax(240px,.85fr) minmax(0,1.7fr)` with a 48px gap. At desktop widths up to 1050px it uses `minmax(190px,.8fr) minmax(0,1.5fr)` with a 28px gap. Two open dated findings and an optional third disclosure occupy the right column. Conversation spans the page below both columns. People Groups and Opportunities remain **1000px**, People Everyone **1080px**, Ask Roots **720px**, and Notices **900px**. These separate surfaces retain their existing open rows and practical evidence hierarchy.

Each Overview finding reads from title to visible Noted/Updated date, explanation, connected records, then action and evidence disclosure. The action uses a restrained dark surface and visible boundary. The first finding has 26px bottom padding; later findings add a fine top divider and 24px top padding. The next-step row uses an automatic action column and remaining evidence width with a 14px gap. No feature-card fill is added.

The full-width conversation section begins 34px below the two-column grid with a 24px top inset and fine divider. Its composer retains a 15px radius, 17px 18px 12px padding, multiline field, context label and 32px pale send control, separated from the section heading by 14px. Invitation and student-service suggestions follow. Submitting opens the existing 720px Ask Roots conversation. Findings remain available independently of prompts.

Page gutters become 25px at desktop widths up to 1000px. At the 760px phone breakpoint, gutters are 20px and the Overview stacks greeting and changes, findings, analytics, then conversation. The greeting is 27px; its date follows beneath. Chart controls, period controls and finding actions have 44px minimum heights, the composer input is 16px and its send control 44×44px. Four labeled navigation items use 54px rows in the bottom bar. Review status moves from right-aligned page footnotes to a left-aligned mobile footer; preserve the existing safe-area allowance.

Opportunities uses four initial programme rows in the existing 1000px paired layout. On the left: programme name, actual benefit, status, short fit explanation, next step and Requirements & sources. On the right: people with clear roles, clickable initials, capacity facts and remaining gaps. Category controls are All routes, Grants, Funded placements and School partnerships. The programme sheet distinguishes who receives money or support and links official sources. Microsoft uses the same catalogue structure. People Groups pairs school or undergraduate pathways with corresponding service-hour or capacity figures. Avatar controls use 44px boxes around 40px initials, with −12px sibling overlap and a 2px paper-colored ring. The +N control has the same 44px circle, a 4px paper-colored boundary and selected-surface fill, opening the full member list. Preserve accessible names and focus/hover stacking above adjacent initials. Rows stack on mobile; the source library retains expandable summaries. Notices remains a 900px dated feed, and charts, feeds and disclosures must not force horizontal page scrolling.

## Snapshot analytics

The visible left analytics rail begins with Community at a glance and inline **People**, **Recorded hours**, and **Opportunity leads** counts. The first two open contributing people; the third opens Opportunities. Seed totals are **35 people**, **893 recorded hours**, and **seven programme and local partnership routes**. Totals are recomputed from saved records.

Participation is always visible in the analytics rail. It shows a stacked bar for one visit, repeat visits, zero visits, and unknown counts. Clicking a segment or legend opens its people. Its headline percentage is repeat-visit profiles divided by profiles with at least one recorded visit: **27 / 35**, rounded to **77%**, in the seed snapshot. The bar represents all profiles, including zero and unknown groups when present. **Interests** and **Events** switch the lower chart area; they do not hide Participation.

This is a distribution of accumulated visit counts, not cohort retention, a monthly return rate, or a trend. Do not restore the old hardcoded 42%, month-over-month changes, growth arrows, or invented historical series. Missing values are not zero. Recorded hours sum valid direct profile totals and do not use generated attendance stories or illustrative approved/pending breakdowns.

Interests shows the five largest groups by stated interest. Each bar counts people and opens that group; a person may appear in several groups. The bar scale uses the number of people in the workspace, not a claim that categories sum to 100%. Keep names, counts, and an overlap explanation visible.

The Events tab shows up to three event rows with date, title, time, recorded attendee/capacity values, open places, and a capacity bar. Each opens the event record; Calendar remains in secondary navigation. Missing or invalid capacity gets a plain unknown state. Aggregate counts do not establish any named person's RSVP or attendance.

Every chart needs readable labels, keyboard-operable groups, honest empty states, and a path to its underlying records. Unknown data, invalid values, and a lack of history must remain distinct from poor performance.

The Today / Last 7 days row is an observation ledger, not a historical analytics series. Existing records establish its starting baseline; only later observed saved changes appear. Today starts at local midnight, and Last 7 days includes today plus six previous local calendar days. Show three entries with See all when needed, an honest empty state, and the browser tracking start date. A recorded assistant draft and an owner Telegram demo receipt remain distinct from a message sent to a volunteer. Repeated observations do not create changes, and late-arriving collections get their own baseline.

## Recommendations, evidence, and freshness

Show two connected findings in the right column. Each follows the same sequence: 19px title, visible Noted/Updated date, readable explanation, links to contributing people, events, projects or leads, then a primary action and **Why this surfaced**. An optional third connection follows as a native disclosure. No finding receives feature-card fill.

**Why this surfaced** reveals the suggested next step, evidence, unknowns, source record links, **Discuss this with Roots**, and the local observation date. Referenced links open their underlying records. **How Roots finds these ideas** explains the review source, bounded fact catalog, cadence, and limitations in the page footnotes. Community patterns are visible alongside the findings; only detailed evidence and the optional third connection remain disclosures.

Current matches connect first-visit gardeners to a relevant event, service-hour interests to a school-partnership pathway, and supported proposed project roles to people’s stated interests and a candidate support lead. A positive project possibility replaces a duplicate coordination warning for that project. An interest match is not eligibility or a verified skill; a proposed role is not agreement; recorded capacity does not establish individual RSVPs. Seed people and project records remain illustrative; six programme or policy references have dated official-source research, and the school route remains a local proposal.

In the static preview, recommendations use deterministic record matches. The local bridge independently lets Gemini select and connect a bounded derived fact catalog and propose short interpretations. It does not depend on chat or research external sources. Strict fact IDs are validated; factual summaries, numeric evidence, and citations are reconstructed server-side. This establishes reference integrity and output structure, not the correctness of every interpretation.

Raw phone numbers, email addresses, coordinator notes, and chat history are excluded from recommendation synthesis. The workspace totals shown in explanations are available records, not a claim that every record entered the smaller reviewed catalog. Keep researched programme terms distinct from record-based recommendations and fictional community context. A source check establishes published terms at that date, not organizational or participant eligibility, attendance, available funding or a secured partnership.

Recheck after meaningful record changes, after 30 minutes while the app is open, when it becomes visible again, or on manual refresh. Activity-only and version-only saves are not new evidence. Stable fact-based IDs and caching prevent routine checks from becoming invented discoveries or activity.

Local journal dates distinguish first observation, meaningful content change, and a manual check. Overview shows Noted/Updated dates beneath finding titles and the fuller local timestamp inside evidence. Opportunities retains its community-fit check line and separately dated programme research, without per-lead date rails. Notices retains dated entries. A repeated check may advance checked time but preserves unchanged finding dates. The separate daily ledger records observed record changes. Neither kind of local timestamp establishes external discovery or verification.

Generation exposes **pending, reviewing, ready, and failed** states. Keep the previous successful recommendations visible during review or failure, identify stale evidence, and discard results produced against superseded records. Without a successful AI review, show the labeled record-match fallback. Failures retry through explicit refresh or meaningful data change, subject to the retry guard. No dismiss feature or monitoring after app closure is promised.

Keep independent review status in the Overview footnotes beside How Roots finds these ideas. Three small dots indicate actual checking or pending/reviewing work; reduced motion leaves them static. Show a genuine checked/reviewed time or an error with **Try again**. Never add artificial delay, idle animation, or discovery badges to unchanged ideas.

## Ask Roots and inline actions

Ask Roots is accessible through secondary navigation, the Overview composer beneath the intelligence, and recommendation disclosures. Submitting the Overview composer hands the prompt into the existing conversation. User messages use a soft green bubble; assistant text sits directly on the page with a small Roots identity. Checking indicators reflect actual requests, and failures expose recovery rather than fabricated replies.

The conversation composer uses the dark surface with a fine boundary and pale sage send control. Nearby text explains connection needs and the lack of email/SMS delivery. The published preview must not imitate a live model connection.

Email and SMS drafts appear in an inline **People → Message → Review** workbench. The dark surface retains its 14px radius and fine field border. Header padding remains 21px 24px 18px; stage sections use 22px 24px 24px. Numbered steps have 44px controls, 25px circles, muted inactive states and pale accent for `aria-current="step"`. People identifies intended recipients and keeps profile, permission and contact details visible. Message provides per-person editing, character count and Save changes; unsaved selected edits block Review. Review places individual messages and their **Not sent** SMS/email status above **Your demo inbox on Telegram** and the pale primary **Send to demo inbox** action. Real delivery requirements sit below in a collapsed **Before sending to real recipients** disclosure; they do not block the owner-only demo. Copy and Refine in chat remain available. On phones sections retain 18px 16px 20px padding, editors/selects use 16px text, and actions retain 44px heights. Long demo-button text may wrap within the available width.

The labeled browser-only sample demonstrates the same sequence with templates from one-visit profiles; it cannot send a demo and never imitates a live response. The connected local workspace can send one to ten selected, saved drafts only to the owner’s separate Roots Demo Inbox on Telegram, each labeled with its intended recipient. A current explicit natural-language send request can also authorize this same owner-only action from conversation; a draft-only request does not. Saved Notices drafts use **Review demo** to create or reuse personalized server drafts and enter Review without sending. Keep the primary action unavailable for a sample, missing connection, sync failure, missing session token, invalid selection or unsaved selected edits. Display actual sending/sent/partial/failed receipts; retain request identity across reload and reconcile uncertain receipts without automatic resend. Conversation recovery uses **Check request result** with the original request identity; it must not silently create a new send. A rejected pre-dispatch authorization may refresh the token, but another explicit user request is required. Real SMS/email remains unsent throughout. The operational Roots Assistant is `@roots_community_josh_bot`, with ordinary-language chat after Start and no `/roots` prefix. Outgoing examples use a separately configured Roots Demo Inbox bot; both chats remain owner-only. The connection panel has a named section and independent link for each bot. Receipts link the actual delivery bot, including historical receipts; missing inbox configuration does not fall back to the assistant bot. A privately hosted static site still has no live bridge or outgoing-message route.

## People and opportunities

People defaults to Groups and Ways to take part, beginning with school students who have service goals and undergraduates who could explore a funded pathway. Open rows show clickable profile clusters, cohort counts and useful capacity or service-hour figures. Interests, Participation, Age groups and Everyone remain available; the full list keeps search, filters, Add volunteer and profiles. Gardening still means the eight of 35 people who named that interest. Fictional demo context is labeled in groups and profiles. Direct context and local overrides retain per-field provenance; explicit clears remain unknown and saved preferences or notes survive. Optional student status, school, employer and hour-target edits remain available. Interest tags do not establish student status or program eligibility. The 35 existing fictional people retain their original visit and recorded-hour totals. An explicitly labeled California nonprofit demo scenario adds ages and study/capacity fields: 12 full-time undergraduates at UC Davis or Sacramento State, eight secondary students with a fictional 40-hour goal each (320 hours to plan), two named supervisors and two planned fellow places. These assumptions are demonstration data, not verified facts about real people, provider eligibility, approved school hours or confirmed attendance. The 40-hour figure is not a universal school rule.

Opportunities defaults to For your community with four open paired rows, then Show more. Seven routes replace the generic participation proposals: CalAgPlate, the Climate Action Event Microgrant, College Corps, California Climate Action Corps, a local school service partnership, Microsoft employee matching and the upcoming Urban Agriculture grant round. Open funding comes first, followed by funded placements, the school pathway, employee giving and the watchlist. All routes, Grants, Funded placements and School partnerships filter the catalogue. All leads, Projects and Saved retain search, saves, requirements sheets and three illustrative project plans. Each programme gives its benefit recipient, status, next step, contributing people, capacity facts and gaps. Requirements & sources opens the published rules and source links. Microsoft is one of the seven catalogue records, not a separately appended row. `RootsProgramFit` compares explicit study level, campus, full-time enrollment, school service requirements, employer connections and host capacity with saved provider rules. Interests do not affect the default ordering. CalAgPlate can be considered around 20 demo students; College Corps has 12 undergraduate connections, not 12 accepted fellows. Two planned fellow places meet the statewide College Corps baseline, but Sacramento State requires three and reopens its host application in March 2027. Climate Action Corps uses the two named supervisors and planned incoming roles, not the students as assumed eligible fellows. The event microgrant compares the known 35-person invitation pool with published turnout tiers: a possible 25-person/$500 route and 15 more people to reach the 50-person tier. Pool size is not confirmed turnout; reimbursement, eligible costs and remaining funds still need approval.

Both surfaces use the forest-green system and fine dividers. Standard sheets remain 540px wide, with the People exception above, fill phone width, and retain a sticky close header. Detailed controls stay in these workspaces rather than overcrowding Overview.

Programme terms were researched from official sources on 24 October 2026. Their source-check date is separate from browser-local observation and fit-check timestamps. Recheck fit recalculates against current community records; it does not browse, refresh terms or run automatic external searches. Published deadlines become a passed-deadline label after their date. Upcoming or campus-specific windows remain explicitly qualified. The local school route has no external-source verification date. Each researched programme sheet links its official sources. Label funds to an organization, student benefits, incoming fellow capacity and employee-requested donations distinctly. Never treat a grant’s statewide allocation or an employee policy cap as projected income. Microsoft is a normal catalogue item with no invented employee matches. School service is proposed local outreach, with no official universal hours rule.

## Notices and connection truth

Notices defaults to **Notes**, a dated text feed with expandable **Notes & people**, profile links, review actions, and a Reviewed filter. **Drafts, Workflows, and Delivery** remain additional views. Check records updates the local scope check time, while unchanged findings retain their dates. Workflow rows summarize audience rules, timing, channel, and draft status. Saving a rule does not activate or schedule it. Audience previews do not establish bookings, permission, or deliverability.

SMS and email providers are not configured. In demo mode, every dispatched message goes only to the owner’s separate Roots Demo Inbox on Telegram and names its intended recipient. Delivery status must distinguish that demo receipt from an unsent SMS/email draft. Contact coverage and permission checks describe future real-recipient delivery; a contact preference is not permission. Drafting, editing, copying and saving workflow settings do not automatically send.

The published site is static with browser-local records. The optional local bridge synchronizes a snapshot for Gemini and an explicitly configured Telegram connection. Local and published origins do not automatically share browser storage. Web and Telegram may share records and deliberately saved drafts while their conversation histories remain separate; recommendation synthesis uses neither history.

Connection details distinguish configuration, synchronization, polling, and failure. Credential presence is not a live connection test. Model responses and shared assistant draft creation require the local server; credentials never belong in frontend files or browser storage.

## Interaction quality

Use explicit labels, native disclosures, accessible chart groups and selectors, and keyboard focus return. Preserve expanded evidence during status updates where possible. Prefer restrained sheet transitions and truthful work indicators, with reduced-motion support.

Keep Overview practical: actual observed changes, visible analytics on the left, a small number of dated connected findings on the right, and conversation below. Preserve the dark-green world and mobile findings → analytics → chat order. Opportunities continues to lead with a named programme and the community circumstances that make it worth pursuing, retaining requirements and sources. People Groups exposes education pathways, service goals and useful capacity while Everyone retains complete records. Keep calculations, interpretation, owner-only Telegram demo delivery, real-recipient readiness and unverified programme leads clearly distinguishable. This documentation records source behavior; it does not establish screenshot QA or live connection-test results.
