# Roots

A deep-green workspace for nonprofit coordinators, with a readable intelligence briefing, funded programmes and partnerships matched to community capacity, dated notices, and an Ask Roots composer beneath the findings. The interface uses HTML, CSS, and JavaScript with self-hosted DM Sans and no build dependencies. An optional Python bridge connects the local workspace to Gemini and supports a private Telegram test.

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
- **People:** Groups begins with school service goals and undergraduate pathways, using labeled fictional education and capacity context. Clickable avatar clusters sit beside cohort counts, service goals and available hours. Interests, Participation, Age groups and Everyone remain available; optional profile edits preserve provenance and local overrides.
- **Opportunities:** Seven researched programmes or local routes, led by open grants and funded placements. Four rows initially pair a named programme, actual benefit, source status and next step with the people and capacity behind its fit. Requirements & sources reveals rules, gaps and official links. All leads, Projects and Saved preserve the catalogue and three draft plans.
- **Notices:** a default **Notes** feed with dated findings, expandable **Notes & people**, source profiles, review actions, and a Reviewed filter. **Drafts**, **Workflows**, and **Delivery** remain available for unsent messages, rules, and delivery prerequisites.
- **Secondary tools:** Ask Roots provides conversation and editable inline email/SMS drafts with Edit, Copy, and Refine actions. Calendar provides event details and date-sorted event creation. Assistant connection details remain available within Ask Roots.
- Responsive sidebar/bottom navigation, reduced-motion support, keyboard focus, and accessible form labels.

The primary destinations are **Overview, People, Opportunities, and Notices**. The dark rendition of the earlier Roots concept remains the palette reference: deep-green canvas `#20251f`, darker sidebar `#1b201b`, surface `#2a3129`, light text `#e5e9df`, and pale sage actions `#d6e5ca`. A 174px desktop sidebar collapses to 60px. Overview retains its single 680px reading column. People Groups and Opportunities use 1000px containers with open paired rows: narrative on the left, avatar clusters and recorded evidence on the right, stacked on mobile. People Everyone retains a 1080px table container. The Overview composer stays 680px wide below the findings; Ask Roots retains a 720px conversation column. Notices keeps its 900px dated feed, while the shared page container remains 1184px. Overview keeps the `#briefing` route; `#overview` is an alias, old Funding links resolve to Opportunities, and old `#outreach` links resolve to Notices. `dark.css` loads after the component styles and sets the shared theme. The earlier neutral stylesheet is no longer loaded.

## Data and delivery boundaries

The 35 existing fictional people retain their original visit and recorded-hour totals. An explicitly labeled California nonprofit demo scenario adds ages and study/capacity fields: 12 full-time undergraduates at UC Davis or Sacramento State, eight secondary students with a fictional 40-hour goal each (320 hours to plan), two named supervisors and two planned fellow places. These assumptions are demonstration data, not verified facts about real people, provider eligibility, approved school hours or confirmed attendance. The 40-hour figure is not a universal school rule.

Overview analytics use the current saved records. The seed snapshot has **35 people, 893 recorded hours, 8 people with one visit, and 27 with repeat visits**. Inline counts beneath Community patterns show people, recorded hours, and opportunity leads. The participation percentage is repeat visitors divided by profiles with at least one recorded visit—77% in the seed snapshot—not a cohort retention rate or a monthly trend. Interest bars count people and can overlap. Charts and totals open the contributing records; unknown visit counts and missing hours remain distinguishable from zero. Event capacity describes recorded aggregate places, not confirmed individual RSVPs. No historical growth figures or trend arrows are inferred.

The published site is a static demo. Its records and changes remain in that browser and origin. Core state uses `roots-demo-v1`; profile details use `roots-people-details-v1`; notices, drafts, and workflow settings use `roots-notices-v1`; the conversation ID, recent messages, and composer text use `roots-conversation-v1`. Sidebar collapse is stored as `roots-sidebar-collapsed`; local observation and check dates use `roots-review-journal-v1`. The published site and local test do not automatically share browser storage.

`RootsProgramFit` compares explicit study level, campus, full-time enrollment, school service requirements, employer connections and host capacity with saved provider rules. Interests do not affect the default ordering. CalAgPlate can be considered around 20 demo students; College Corps has 12 undergraduate connections, not 12 accepted fellows. Two planned fellow places meet the statewide College Corps baseline, but Sacramento State requires three and reopens its host application in March 2027. Climate Action Corps uses the two named supervisors and planned incoming roles, not the students as assumed eligible fellows. The event microgrant compares the known 35-person invitation pool with published turnout tiers: a possible 25-person/$500 route and 15 more people to reach the 50-person tier. Pool size is not confirmed turnout; reimbursement, eligible costs and remaining funds still need approval. `RootsConnections` remains available for the separate Overview/project evidence; it no longer ranks the Opportunities page.

People defaults to Groups and Ways to take part, beginning with school students who have service goals and undergraduates who could explore a funded pathway. Open rows show clickable profile clusters, cohort counts and useful capacity or service-hour figures. Interests, Participation, Age groups and Everyone remain available; the full list keeps search, filters, Add volunteer and profiles. Gardening still means the eight of 35 people who named that interest. Fictional demo context is labeled in groups and profiles. Direct context and local overrides retain per-field provenance; explicit clears remain unknown and saved preferences or notes survive. Optional student status, school, employer and hour-target edits remain available. Interest tags do not establish student status or program eligibility.

Opportunities defaults to For your community with four open paired rows, then Show more. Seven routes replace the generic participation proposals: CalAgPlate, the Climate Action Event Microgrant, College Corps, California Climate Action Corps, a local school service partnership, Microsoft employee matching and the upcoming Urban Agriculture grant round. Open funding comes first, followed by funded placements, the school pathway, employee giving and the watchlist. All routes, Grants, Funded placements and School partnerships filter the catalogue. All leads, Projects and Saved retain search, saves, requirements sheets and three illustrative project plans. Each programme gives its benefit recipient, status, next step, contributing people, capacity facts and gaps. Requirements & sources opens the published rules and source links. Microsoft is one of the seven catalogue records, not a separately appended row.

Programme terms were researched from official sources on 24 October 2026. Their source-check date is separate from browser-local observation and fit-check timestamps. Recheck fit recalculates against current community records; it does not browse, refresh terms or run automatic external searches. Published deadlines become a passed-deadline label after their date. Upcoming or campus-specific windows remain explicitly qualified. The local school route has no external-source verification date. `RootsJournal` preserves first-observed and meaningful-update dates when entry content is unchanged.

The source catalogue is `dist/programs.js`; criteria-based matching is in `dist/program-fit.js`. Key programme facts are:

- [CalAgPlate Tier 2](https://www.cdfa.ca.gov/egov/calagplate/docs/2026-CalAgPlate_RFP.pdf): $2,500–$10,000 to an eligible applicant organization; proposals due 2 November 2026 at 9am PT.
- [Climate Action Event Microgrant application](https://docs.google.com/forms/d/e/1FAIpQLSfdaYiTwOJ3RogTysWS7lFj6QLMBlD1RpBOICXBzmlMhvpl4g/viewform): reimbursement tiers of up to $250/12 volunteers, $500/25, $1,000/50 and $1,500/75; limited funds, eligible costs and actual turnout matter. Food and volunteer incentives are excluded.
- [College Corps](https://www.californiavolunteers.ca.gov/college-corps/): up to $10,000 to each eligible student for 450 programme hours, rather than a grant to the host. [Sacramento State](https://www.csus.edu/student-life/career-center/college-corps/community-partner-organizations.html) has its own three-fellow minimum and March 2027 host reopening.
- [Climate Action Corps](https://www.caclimateactioncorps.org/host-partners): capacity from two or more full-time fellows for 11 months; next host applications open January 2027. New-cycle fellow benefits and eligibility need checking.
- School service partnerships are a local outreach proposal requiring school approval, supervision and agreed hour recording.
- [Microsoft employee giving](https://www.microsoft.com/en-us/reno/community-involvement): $25 per eligible volunteer hour donated to an eligible nonprofit, within a combined $15,000 annual employee time-and-giving cap. [Its nonprofit guide](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/FY25-Max-Employee-Engagement-March-2025.pdf) describes the employee/Benevity route; no employee connection or donation is assumed.
- [CDFA Urban Agriculture](https://cafarmtofork.cdfa.ca.gov/farm_to_fork/grants/urban_ag.html): a new round is in development, with no open application or published per-project award. The $20 million announcement is a statewide allocation.

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
