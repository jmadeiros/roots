# Roots
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Buildless HTML, CSS, and JavaScript for the published static demonstration. An optional Python standard-library bridge serves the same dashboard locally, stores synchronized snapshots and assistant drafts in SQLite, and connects to Gemini. Private Telegram polling is available when explicitly configured and started.

## Users
Nonprofit coordinators managing volunteers, environmental projects and opportunities.

## Product Purpose
Connect volunteer engagement to useful benefits, learning, partnerships, and mission-aligned project support. The supplied reference prioritizes concrete actions and outcomes over CRM administration. Preserve the simpler original Roots interface while making the underlying people and opportunity information more useful.

## Capabilities and Constraints
The four primary destinations are Overview, People, Opportunities, and Notices. Overview retains its original composition and width, with 35 seed volunteers, an illustrative 42% return rate, 11 opportunity leads, suggested next steps, and upcoming events. Events remain reachable from Overview.

People preserves the searchable table and expands individual profiles with Profile, Activity, and Notes views. Stated interests and declared skills remain distinct. Coordinators can record availability, a preferred contact channel, a confirmed service-hour target, and notes. Seed history and approved/pending-hour breakdowns are illustrative and labeled accordingly. Contact preferences do not grant messaging consent.

Opportunities has For volunteers, For organization, Projects, and Saved views. Eleven candidate leads cover benefits, training, funded placements, partnerships, and project support. Three project drafts suggest people and roles, budgets, funding routes, and readiness checks. Searchable compact rows lead to details with collapsed requirements and next steps. Interest matching does not establish eligibility. Official program links are references to check, not evidence of a secured benefit or open application.

Notices holds recommendations to review, unsent outreach drafts, workflow configuration, and the assistant test. Workflow rules record an audience trigger, delay, channel, and message. Audience previews are illustrative; automatic delivery is unavailable. SMS draft audiences exclude people without recorded permission. Email consent, delivery details, and trustworthy timing records still need verification before future activation.

The published static demo has no assistant backend and no email/SMS delivery. Browser-local records are separate by origin. The local bridge receives browser snapshots and gives Gemini constrained access to relevant demo records and draft creation; assistant drafts and activity return through Notices. It does not turn the published site into a connected service, reconcile multiple browsers, deliver outreach, or apply for funding. Telegram needs an explicit bot/allowed-user setup and polling test; configuration alone is not a verified connection.

## Brand Commitments
Roots name, sprout mark, self-hosted DM Sans, warm paper, forest actions, green positive indicators, and restrained nonprofit operations styling from the user's shared reference. Keep the original application width and overview structure. New detail belongs in focused sheets and collapsible sections rather than an expanded wall of content.

## Evidence on Hand
Exact source brief: ../reference.txt. The user prefers this implementation's original visual style and requested richer People details, compact Opportunities with projects, a Notices area, workflow settings, and a dashboard-linked Telegram/Gemini experiment. The related prototype supplied content ideas, not replacement style authority. All seed people, events, metrics, histories, assessments, project teams, and budgets are fictional or illustrative. Official program links are supplied references, not verification of eligibility or open applications.

## Product Principles
Make next steps concrete. Explain why a person or project may fit and what remains unconfirmed. Distinguish volunteer benefits, funded capacity, and organization grants. Capture participation preferences from the person rather than inferring them. Preserve useful overview context while revealing detail on demand. Keep drafts visibly unsent, workflow activation separate from configuration, and server credentials out of the frontend.
