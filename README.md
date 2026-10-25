# Roots

A conversation-first workspace for nonprofit coordinators: useful community insights, clear records, and concrete next actions. The interface uses HTML, CSS, and JavaScript with self-hosted DM Sans and no build dependencies. An optional Python bridge connects the local workspace to Gemini and supports a private Telegram test.

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

- **Chat:** a spacious conversation view, two compact evidence-backed insights with an optional third, a bottom composer, and inline email/SMS drafts with Edit, Copy, and Refine actions.
- **People:** the existing searchable table and richer profiles with Profile, Activity, and Notes views; stated interests, editable declared skills and preferences, service-hour targets, illustrative attendance, and opportunity suggestions.
- **Opportunities:** 11 candidate leads across volunteer benefits and organization support, plus three project drafts. Compact rows, search, saved items, and collapsed detail sections keep the page manageable. Project plans include suggested teams, budgets, and readiness checks.
- **Secondary tools:** Drafts and Workflows preserve detailed outreach review and rule configuration; Calendar provides event details and date-sorted event creation. Notices and connection settings remain available without adding primary navigation items.
- Responsive sidebar/bottom navigation, reduced-motion support, keyboard focus, and accessible form labels.

The primary destinations are **Chat, People, and Opportunities**. Warm neutral surfaces, charcoal actions, DM Sans, and a small green brand accent replace the earlier green-heavy dashboard. Deeper information stays in compact lists, collapsible evidence, and focused detail sheets. Old Overview and Funding links redirect to Chat and Opportunities respectively.

## Data and delivery boundaries

Seed people, events, metrics, participation histories, assessments, project teams, and budgets are illustrative. Opportunity names and source links are research leads; no benefit, eligibility, deadline, award, or partnership is confirmed by this demo. Matches use stated interests rather than inferred demographics.

The published site is a static demo. Its records and changes remain in that browser and origin. Core state uses `roots-demo-v1`; profile details use `roots-people-details-v1`; notices, drafts, and workflow settings use `roots-notices-v1`; the conversation ID, recent messages, and composer text use `roots-conversation-v1`. The published site and local test do not automatically share browser storage.

Insights are deterministic observations from the records, not AI-generated facts or newly verified research. Evidence and source records are expandable. The open app requests checks when relevant data changes or after 30 minutes, and supports manual refresh. Cached insights retain stable IDs; unchanged records do not become fabricated discoveries or fresh activity. There is no background monitoring after the app closes.

When served by the local bridge, the browser synchronizes snapshots to the local SQLite store. The assistant reads that snapshot, and questions wait for a successful sync. Assistant-created drafts and activity return to the interface. This is not a bidirectional multi-user database: snapshots do not import remote records into the browser, and the most recently synchronized browser supplies the current dashboard data. Open the intended local workspace and let it sync before asking Telegram about its records.

The server retains up to six completed conversation exchanges, within a 48,000-character limit, so a follow-up can refer to an earlier answer or draft. Context expires after 24 hours without a successful exchange. Browser context belongs to its session cookie; Telegram has separate context for the allowed user. Shared workspace records and deliberately saved drafts can appear across both channels, while private conversation history stays separate. See [the assistant guide](server/README.md) for retention, isolation, and recovery details.

Email and SMS delivery are **not connected**. Drafts stay unsent, with readiness blockers such as missing phone details, channel-specific consent, or delivery integration shown explicitly. Editing updates the shared unsent draft; copying text and refining it in chat do not send it. Workflow settings save the audience rule, timing, channel, and message for review; previews do not schedule or send anything. SMS previews exclude people without recorded permission. A contact preference is not consent, and email permission, delivery details, and event/first-visit timestamps must be verified before any future activation.

Gemini is available only through a configured local server. Telegram requires its own bot configuration, an allowed user, and explicitly enabled polling; the UI does not imply an existing bot is connected. See [the assistant guide](server/README.md) for the setup and test procedure.

## Verification

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'bridge_test.py' -v
node --test tests/bridge-client.test.cjs
```

These tests cover the local API, conversation context, insight evidence and caching, safe draft editing, Telegram handling, and browser synchronization using test providers. Passing them is not proof of a live Gemini or Telegram connection.

Frontend source is in `dist/`; bridge source is in `server/`. [DESIGN.md](DESIGN.md) documents the visual system, and [PRODUCT.md](PRODUCT.md) records scope and demo constraints.
