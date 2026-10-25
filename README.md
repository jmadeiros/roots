# Roots

A forest-green workspace for nonprofit coordinators: an Overview dashboard with current-record analytics, useful recommendations, and upcoming events, plus a separate conversation when needed. The interface uses HTML, CSS, and JavaScript with self-hosted DM Sans and no build dependencies. An optional Python bridge connects the local workspace to Gemini and supports a private Telegram test.

## Run Roots

For the dashboard and optional assistant bridge:

```sh
python3 server/bridge.py
```

Open **http://127.0.0.1:4175**. See [the local assistant guide](server/README.md) for Gemini settings, Telegram setup, and the API contract. Credentials belong in server-side environment settings, never in `dist/` or browser storage. Configured credentials do not by themselves confirm a working connection.

For a frontend-only preview:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open **http://127.0.0.1:4173**. This mode has the same limits as the published static demo: it does not provide the assistant API.

## Included

- **Overview:** three compact snapshot metrics, two recommendation cards with an optional third, and a right-hand column for Community patterns and Coming up. The first recommendation uses a sage surface and forest action; **Why this surfaced** reveals evidence and suggested next steps. Participation and Interests charts open their underlying people. Event rows show recorded capacity. A compact composer opens Ask Roots; analytics and AI review stay independent of chat.
- **People:** the existing searchable table and richer profiles with Profile, Activity, and Notes views; stated interests, editable declared skills and preferences, service-hour targets, illustrative attendance, and opportunity suggestions.
- **Opportunities:** 11 candidate leads across volunteer benefits and organization support, plus three project drafts. Compact rows, search, saved items, and collapsed detail sections keep the page manageable. Project plans include suggested teams, budgets, and readiness checks.
- **Outreach:** Drafts, Workflows, and Delivery views for reviewing unsent messages, configuring rules, and inspecting missing delivery prerequisites.
- **Secondary tools:** Ask Roots provides conversation and editable inline email/SMS drafts with Edit, Copy, and Refine actions. Calendar provides event details and date-sorted event creation. Assistant connection details remain available within Ask Roots.
- Responsive sidebar/bottom navigation, reduced-motion support, keyboard focus, and accessible form labels.

The primary destinations are **Overview, People, Opportunities, and Outreach**. The original darker Roots dashboard supplies the visual direction: forest `#234c3c` selected navigation and primary actions, warm paper, sage feature cards, and self-hosted DM Sans. The desktop sidebar is 200px wide, reduces to 180px on smaller desktops, and collapses to 60px. The page container is capped at 1184px, with recommendations and analytics in a responsive two-column layout. Ask Roots retains a separate 700px conversation column. Overview keeps the `#briefing` route; `#overview` remains an alias and old Funding links resolve to Opportunities. The earlier neutral stylesheet is no longer loaded.

## Data and delivery boundaries

Seed people, events, metrics, participation histories, assessments, project teams, and budgets are illustrative. Opportunity names and source links are research leads; no benefit, eligibility, deadline, award, or partnership is confirmed by this demo. Matches use stated interests rather than inferred demographics.

Overview analytics use the current saved records. The seed snapshot has **35 people, 893 recorded hours, 8 people with one visit, and 27 with repeat visits**. The three top metrics are people, recorded hours, and opportunity leads. The participation percentage is repeat visitors divided by profiles with at least one recorded visit—77% in the seed snapshot—not a cohort retention rate or a monthly trend. Interest bars count people and can overlap. Charts and totals open the contributing records; unknown visit counts and missing hours remain distinguishable from zero. Event capacity describes recorded aggregate places, not confirmed individual RSVPs. No historical growth figures or trend arrows are inferred.

The published site is a static demo. Its records and changes remain in that browser and origin. Core state uses `roots-demo-v1`; profile details use `roots-people-details-v1`; notices, drafts, and workflow settings use `roots-notices-v1`; the conversation ID, recent messages, and composer text use `roots-conversation-v1`. Sidebar collapse is stored as `roots-sidebar-collapsed`. The published site and local test do not automatically share browser storage.

The static briefing shows deterministic record matches. With the local Gemini bridge, a background review selects and connects a bounded catalog of those facts and writes short interpretations and suggested next steps. It runs independently of chat. The server validates the selected fact IDs and reconstructs factual summaries, numeric evidence, and source references from the catalog. This checks provenance and structure, not whether every model interpretation is sound. It does not research external sources or verify opportunity terms. Raw phone numbers, email addresses, coordinator notes, and chat history are not included in briefing review.

The open app checks after meaningful record changes, after 30 minutes, when it becomes visible again, or on manual refresh. Briefing generation reports `pending`, `reviewing`, `ready`, or `failed`. Existing suggestions remain visible while a new review runs or fails; retained older evidence is marked stale when appropriate. A failed review retries on explicit refresh or meaningful data change, with a short retry guard. Three small dots in the freshness line indicate actual checking work, with no artificial delay and no animation under reduced motion. Stable fact-based IDs and caching prevent repeated checks from becoming fabricated discoveries or activity. The interface does not promise monitoring after the app closes.

When served by the local bridge, the browser synchronizes snapshots to the local SQLite store. The assistant reads that snapshot, and questions wait for a successful sync. Assistant-created drafts and activity return to the interface. This is not a bidirectional multi-user database: snapshots do not import remote records into the browser, and the most recently synchronized browser supplies the current dashboard data. Open the intended local workspace and let it sync before asking Telegram about its records.

The server retains up to six completed conversation exchanges, within a 48,000-character limit, so a follow-up can refer to an earlier answer or draft. Context expires after 24 hours without a successful exchange. Browser context belongs to its session cookie; Telegram has separate context for the allowed user. Shared workspace records and deliberately saved drafts can appear across both channels, while private conversation history stays separate. See [the assistant guide](server/README.md) for retention, isolation, and recovery details.

Email and SMS delivery are **not connected**. Nothing has been sent through these outreach features. Drafts stay unsent, with readiness blockers such as missing phone details, channel-specific consent, or delivery integration shown explicitly. Editing updates the shared unsent draft; copying text and refining it in chat do not send it. Workflow settings save the audience rule, timing, channel, and message for review; previews do not schedule or send anything. SMS previews exclude people without recorded permission. The Delivery view reports stored contact and permission coverage, not verified deliverability. A contact preference is not consent, and email permission, delivery details, and event/first-visit timestamps must be verified before any future activation. An assistant or Telegram connection does not enable email/SMS delivery.

Gemini is available only through a configured local server. Telegram requires its own bot configuration, an allowed user, and explicitly enabled polling; the UI does not imply an existing bot is connected. See [the assistant guide](server/README.md) for the setup and test procedure.

## Verification

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'bridge_test.py' -v
node --test tests/*.test.cjs
```

These tests cover the local API, conversation context, insight evidence and caching, safe draft editing, Telegram handling, and browser synchronization using test providers. Passing them is not proof of a live Gemini or Telegram connection.

Frontend source is in `dist/`; bridge source is in `server/`. [DESIGN.md](DESIGN.md) documents the visual system, and [PRODUCT.md](PRODUCT.md) records scope and demo constraints.
