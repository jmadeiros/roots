# Roots
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Buildless HTML, CSS, and JavaScript for the published static demonstration. An optional Python standard-library bridge serves the same dashboard locally, stores synchronized snapshots and assistant drafts in SQLite, and connects to Gemini. Private Telegram polling is available when explicitly configured and started.

## Users
Nonprofit coordinators managing volunteers, environmental projects and opportunities.

## Product Purpose
Connect volunteer engagement to useful benefits, learning, partnerships, and mission-aligned project support. The selected product model is conversation-first: a quiet place to ask for help, see a few evidence-led insights, and review a useful next action. Keep people and opportunity records easy to inspect without making the home screen a dense operations dashboard.

## Capabilities and Constraints
The three primary destinations are Chat, People, and Opportunities. Chat replaces the metric-heavy Overview as the front page, with two compact insights and a “One more suggestion” control, conversation, inline action drafts, and a composer at the bottom. Deeper notices, drafts, workflows, event information, and connection settings remain available through secondary controls. The seed dataset contains 35 volunteers, 11 candidate opportunity leads, and three project drafts.

Insights cite the records behind their reasoning and make missing information explicit. Recheck them when the data changes or every 30 minutes while the app is open, with a manual refresh available. A check is not a new discovery: unchanged inputs must not generate fresh-looking ideas, new-discovery timestamps, or activity. Show the record check time and evidence scope; cached server insights retain stable IDs. There is no dismiss feature in this version. This is an in-app check, not a background service that runs after the app closes. Once conversation begins, insights become more compact so the exchange has room to develop.

People preserves the searchable table and expands individual profiles with Profile, Activity, and Notes views. Stated interests and declared skills remain distinct. Coordinators can record availability, a preferred contact channel, a confirmed service-hour target, and notes. Seed history and approved/pending-hour breakdowns are illustrative and labeled accordingly. Contact preferences do not grant messaging consent.

Opportunities has For volunteers, For organization, Projects, and Saved views. Eleven candidate leads cover benefits, training, funded placements, partnerships, and project support. Three project drafts suggest people and roles, budgets, funding routes, and readiness checks. Searchable compact rows lead to details with collapsed requirements and next steps. Interest matching does not establish eligibility. Official program links are references to check, not evidence of a secured benefit or open application.

Notices and workflows remain supporting tools rather than primary destinations. Conversation can surface an inline action draft with its recipient, unsent state, and delivery-readiness blockers. Edit message saves changes to the unsent backend draft; Copy places its text on the clipboard; Refine in chat prepares a follow-up request. None delivers the message. Workflow rules record an audience trigger, delay, channel, and message. Audience previews are illustrative; automatic delivery is unavailable. SMS draft audiences exclude people without recorded permission. Email consent, delivery details, and trustworthy timing records still need verification before future activation.

The published static demo has no assistant backend and no email/SMS delivery. Its record-based insights and draft preparation must be distinguished from live model responses. Browser-local records are separate by origin. The local bridge receives browser snapshots and gives Gemini constrained access to relevant demo records and draft creation; assistant drafts and activity return through the interface. It does not turn the published site into a connected service, reconcile multiple browsers, deliver outreach, or apply for funding. Telegram shares the local assistant when a bot, allowed user, and polling are configured; configuration alone is not a verified connection. Both web and Telegram must keep outbound email/SMS drafts visibly unsent.

## Brand Commitments
Roots name, small sprout accent, self-hosted DM Sans, warm neutral surfaces, charcoal text and primary actions, generous open space, and restrained fine dividers. Green is a small brand accent rather than the dominant navigation, surface, or action color. The user's selected conversation-first direction supersedes the previous requirement to preserve the Overview composition and its green-heavy palette. Detail belongs in records, focused sheets, collapsible sections, or contextual action drafts.

## Evidence on Hand
Original source brief: ../reference.txt. The user retained the simpler Roots direction over the related prototype, then selected the conversation-first concept and asked for less green, more air, and visible intelligence/insights. Richer People details, compact Opportunities with projects, notices, workflow settings, and the dashboard-linked Telegram/Gemini experiment remain useful supporting capabilities. All seed people, events, metrics, histories, assessments, project teams, and budgets are fictional or illustrative. Official program links are supplied references, not verification of eligibility or open applications.

## Product Principles
Make the next useful action easy to ask for and review. Proactively surface a small number of supported insights without requiring the coordinator to invent a prompt. Explain why a person or project may fit and what remains unconfirmed. Distinguish volunteer benefits, funded capacity, and organization grants. Capture participation preferences from the person rather than inferring them. Let conversation open durable records and concrete actions. Keep drafts visibly unsent, insight checks separate from new findings, workflow activation separate from configuration, and server credentials out of the frontend.
