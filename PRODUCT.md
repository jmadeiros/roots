# Roots
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Buildless HTML, CSS, and JavaScript for the published static demonstration. An optional Python standard-library bridge serves the same dashboard locally, stores synchronized snapshots and assistant drafts in SQLite, and connects to Gemini. Private Telegram polling is available when explicitly configured and started.

## Users
Nonprofit coordinators managing volunteers, environmental projects and opportunities.

## Product Purpose
Connect volunteer engagement to useful benefits, learning, partnerships, and mission-aligned project support. The selected product model is Briefing plus chat: a current view of the community with a few useful connections and clear next actions, alongside a separate place to ask for help. Keep people and opportunity records easy to inspect without making the home screen a dense operations dashboard.

## Capabilities and Constraints
The four primary destinations are Briefing, People, Opportunities, and Outreach. Briefing is the front page, with two compact suggestions, a “One more connection” control, review status, evidence, and direct actions. Its bottom composer opens the separate Ask Roots conversation; chatting does not collapse, replace, or determine the briefing. Ask Roots and Calendar are secondary destinations. The compact desktop sidebar is 178px wide and collapses to 56px; the briefing reading column is capped at 660px. The seed dataset contains 35 volunteers, 11 candidate opportunity leads, and three project drafts.

The briefing cites the records behind each suggestion and makes missing information explicit. In the static demo, suggestions are deterministic record matches. With the local bridge, Gemini independently selects and connects a bounded catalog of derived facts and proposes concise interpretations and next steps. It does not use chat history or conduct external research. The server validates strict fact IDs and rebuilds factual summaries, numeric evidence, and citations from the catalog. Model interpretation still requires judgment; reference validation does not prove a suggestion is correct. Raw contact details and coordinator notes are excluded from this review.

Recheck after meaningful record changes, every 30 minutes while the app is open, when it becomes visible, or on manual refresh. Generation has pending, reviewing, ready, and failed states. Keep the previous successful briefing visible during review or failure, identify retained stale evidence, and discard results generated against superseded data. A failed attempt retries through explicit refresh or meaningful data change rather than an endless loop. Motion belongs only to actual pending/reviewing work, with no artificial delay and a reduced-motion alternative. A check is not a discovery: unchanged inputs must not generate invented findings, fresh-looking activity, or novelty badges. Show review time and scope; cached IDs are derived from selected facts. There is no dismiss feature or promised monitoring after the app closes.

People preserves the searchable table and expands individual profiles with Profile, Activity, and Notes views. Stated interests and declared skills remain distinct. Coordinators can record availability, a preferred contact channel, a confirmed service-hour target, and notes. Seed history and approved/pending-hour breakdowns are illustrative and labeled accordingly. Contact preferences do not grant messaging consent.

Opportunities has For volunteers, For organization, Projects, and Saved views. Eleven candidate leads cover benefits, training, funded placements, partnerships, and project support. Three project drafts suggest people and roles, budgets, funding routes, and readiness checks. Searchable compact rows lead to details with collapsed requirements and next steps. Interest matching does not establish eligibility. Official program links are references to check, not evidence of a secured benefit or open application.

Outreach is a primary destination with Drafts, Workflows, and Delivery views. Ask Roots can also surface an inline action draft with its recipient, unsent state, and delivery-readiness blockers. Edit message saves changes to the unsent backend draft; Copy places its text on the clipboard; Refine in chat prepares a follow-up request. None delivers the message. Workflow rules record an audience trigger, delay, channel, and message for review; saving does not activate or schedule them. SMS draft audiences exclude people without recorded permission. Delivery reports missing providers and stored contact/permission coverage, not verified deliverability. No outreach has been sent. Email consent, delivery details, and trustworthy timing records still need verification before future activation.

The published static demo has no assistant backend and no email/SMS delivery. Its record-based insights and draft preparation must be distinguished from live model responses. Browser-local records are separate by origin. The local bridge receives browser snapshots and gives Gemini constrained access to relevant demo records and draft creation; assistant drafts and activity return through the interface. It does not turn the published site into a connected service, reconcile multiple browsers, deliver outreach, or apply for funding. Telegram shares the local assistant when a bot, allowed user, and polling are configured; configuration alone is not a verified connection. Both web and Telegram must keep outbound email/SMS drafts visibly unsent.

## Brand Commitments
Roots name, sprout identity, self-hosted DM Sans, warm paper, dark green text and actions, restrained sage surfaces, generous open space, and fine dividers. The user's latest Briefing plus chat direction restores green while retaining the quieter layout and a much smaller sidebar. It supersedes the prior neutral conversation-first direction and its shrinking insights. Detail belongs in records, focused sheets, collapsible sections, or contextual action drafts; the front page is not a return to metric cards and a dense dashboard.

## Evidence on Hand
Original source brief: ../reference.txt. The user retained the simpler Roots direction over the related prototype, explored conversation-first, and then selected Briefing plus chat: they prefer green, want a current briefing that changes with new information independently of chat, and want People, Opportunities, and outreach within a compact sidebar. Richer People details, compact Opportunities with projects, reviewable drafts, workflow settings, and the dashboard-linked Telegram/Gemini experiment remain in scope. All seed people, events, metrics, histories, assessments, project teams, and budgets are fictional or illustrative. Official program links are supplied references, not verification of eligibility or open applications.

## Product Principles
Make the next useful action easy to see, ask about, and review. Surface a small number of supported connections without requiring the coordinator to invent a prompt. Keep the briefing independent of conversation history and distinguish source facts from model interpretation. Explain why a person or project may fit and what remains unconfirmed. Distinguish volunteer benefits, funded capacity, and organization grants. Capture participation preferences from the person rather than inferring them. Let conversation open durable records and concrete actions. Keep drafts visibly unsent, checks separate from new findings, workflow activation separate from configuration, and server credentials out of the frontend.
