# Roots

A deep-green workspace for nonprofit coordinators, with a readable intelligence briefing, possibilities connected to people and projects, dated notices, and an Ask Roots composer beneath the findings. The interface uses HTML, CSS, and JavaScript with self-hosted DM Sans and no build dependencies. An optional Python bridge connects the local workspace to Gemini and supports a private Telegram test.

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

- **Overview:** two connected findings in one reading column, with a short explanation, visible links to the contributing people, events, or opportunities, and a concrete next step. **Why this surfaced** expands the evidence. A third connection and **Community patterns** stay collapsed until needed; Participation, Interests, Events, and inline totals still open their underlying records. The composer follows the findings and opens Ask Roots. Analytics and AI review stay independent of chat.
- **People:** **Groups** opens with shared interests and possible next steps, with Participation and Age groups views alongside. Expand a group to see its people and related leads. Interests starts with the four largest groups and can show all. **Everyone** preserves the searchable table, existing filters, Add volunteer, and richer profiles with Profile, Activity, and Notes views, stated interests, declared skills and preferences, service-hour targets, and illustrative attendance.
- **Opportunities:** **For your community** leads with the people who might benefit or take part, using a count and possible outcome, named profile links, and **Why these people**. **Most people** ranks by matching profiles; **Closest match** prioritizes profiles with at least two matching themes. **Funding & support** filters potential support routes without ranking unverified monetary values. Three possibilities appear initially, with three more on request. **All leads**, **Projects**, and **Saved** retain the library of 11 candidate leads and three project drafts, with audience filters, search, saves, detailed sheets, and four-at-a-time results.
- **Notices:** a default **Notes** feed with dated findings, expandable **Notes & people**, source profiles, review actions, and a Reviewed filter. **Drafts**, **Workflows**, and **Delivery** remain available for unsent messages, rules, and delivery prerequisites.
- **Secondary tools:** Ask Roots provides conversation and editable inline email/SMS drafts with Edit, Copy, and Refine actions. Calendar provides event details and date-sorted event creation. Assistant connection details remain available within Ask Roots.
- Responsive sidebar/bottom navigation, reduced-motion support, keyboard focus, and accessible form labels.

The primary destinations are **Overview, People, Opportunities, and Notices**. The dark rendition of the earlier Roots concept remains the palette reference: deep-green canvas `#20251f`, darker sidebar `#1b201b`, surface `#2a3129`, light text `#e5e9df`, and pale sage actions `#d6e5ca`. A 174px desktop sidebar collapses to 60px. Overview, Opportunities, and People Groups use a single 680px reading column. People Everyone retains a 1080px table container. The Overview composer shares that width below the findings; Ask Roots retains a 720px conversation column. Notices keeps its 900px dated feed, while the shared page container remains 1184px. Overview keeps the `#briefing` route; `#overview` is an alias, old Funding links resolve to Opportunities, and old `#outreach` links resolve to Notices. `dark.css` loads after the component styles and sets the shared theme. The earlier neutral stylesheet is no longer loaded.

## Data and delivery boundaries

Seed people, events, metrics, participation histories, assessments, project teams, and budgets are illustrative. Opportunity names and source links are research leads; no benefit, eligibility, deadline, award, or partnership is confirmed by this demo. Matches use stated interests rather than inferred demographics.

Overview analytics use the current saved records. The seed snapshot has **35 people, 893 recorded hours, 8 people with one visit, and 27 with repeat visits**. Inline counts beneath Community patterns show people, recorded hours, and opportunity leads. The participation percentage is repeat visitors divided by profiles with at least one recorded visit—77% in the seed snapshot—not a cohort retention rate or a monthly trend. Interest bars count people and can overlap. Charts and totals open the contributing records; unknown visit counts and missing hours remain distinguishable from zero. Event capacity describes recorded aggregate places, not confirmed individual RSVPs. No historical growth figures or trend arrows are inferred.

The published site is a static demo. Its records and changes remain in that browser and origin. Core state uses `roots-demo-v1`; profile details use `roots-people-details-v1`; notices, drafts, and workflow settings use `roots-notices-v1`; the conversation ID, recent messages, and composer text use `roots-conversation-v1`. Sidebar collapse is stored as `roots-sidebar-collapsed`; local observation and check dates use `roots-review-journal-v1`. The published site and local test do not automatically share browser storage.

`RootsConnections` ranks candidate leads using distinct matching people and distinct stated-interest themes. Most people sorts by profile count; Closest match first sorts by the number of profiles matching at least two themes, then by total matching people. A person can appear in several possibilities. Funding & support includes grants, fellowships, explicit funded partnerships, in-kind benefits, and employer benefits; current funding amounts are unverified and not used for ranking. It also derives provisional project connections for the Overview. No connection establishes skills, agreement, eligibility, or secured support. The opportunity page shows one actual record-check timestamp; individual lead date rails are not displayed.

`RootsPeopleGroups` groups stated interests, recorded visit counts, or explicitly supplied age ranges. Interest groups sort by count then label, and people can belong to several. Participation separates one, repeat, zero, and unknown visits; it is not recent attendance or retention. Age groups use only explicit `ageGroup` or `ageBand` text on the person record, with no age inference; the demo has none recorded. The complete table remains under Everyone.

`RootsJournal` records local observations separately for Overview, Notices, and Opportunities. An entry retains its first-noted date; meaningful tracked content or record-match changes advance its updated date. Unchanged entries retain both dates. A manual check updates that scope’s checked time without making unchanged entries look newly discovered. These browser-local dates describe record observations, not external discovery, publication dates, verification, or background web research. External research is not implemented.

The static briefing shows deterministic record matches. With the local Gemini bridge, a background review selects and connects a bounded catalog of those facts and writes short interpretations and suggested next steps. It runs independently of chat. The catalog includes positive project possibilities that connect actual profiles, supported proposed roles, a project, and any linked support lead. A corresponding availability-coordination warning is suppressed when that project possibility already covers the team. Service-hour findings identify the school-partnership pathway when it is present. The server validates the selected fact IDs and reconstructs factual summaries, numeric evidence, and source references from the catalog. This checks provenance and structure, not whether every model interpretation is sound. It does not research external sources or verify opportunity terms. Raw phone numbers, email addresses, coordinator notes, and chat history are not included in briefing review.

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
