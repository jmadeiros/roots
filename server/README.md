# Roots local assistant test

This bridge serves the dashboard and a shared SQLite snapshot, and can connect Gemini to a private Telegram chat. It uses Python 3.10+ and the standard library. Nothing to install.

## Start the dashboard

From the Roots project directory:

```sh
python3 server/bridge.py
```

Open **http://127.0.0.1:4175**. This is separate from the published static demo. The dashboard sends its records to `/api/state`; the assistant reads that shared snapshot. Local drafts and activity live in `server/.local/roots.sqlite3`, excluded from Git. Snapshots retain the most recent 20 versions. Only the local computer can connect to the bridge.

## Configure Gemini

Copy `server/.env.example` to `server/.env` and set `GEMINI_API_KEY` using your local editor. Never put provider secrets in the browser, `dist/`, source control, or chat. The optional env loader accepts only the six documented settings (including `GOOGLE_API_KEY` as a fallback); it does not execute shell expressions. Existing environment variables take precedence over the file.

```sh
python3 server/bridge.py --env-file server/.env
```

The default model is `gemini-3.5-flash-lite`, listed as a stable, cost-effective model in the official [Gemini model catalog](https://ai.google.dev/gemini-api/docs/models). Set `GEMINI_MODEL` to change it. The bridge calls the documented [`generateContent` REST endpoint](https://ai.google.dev/api/generate-content) with the key in a header. Model requests incur normal provider usage. Status reports configuration presence, not whether credentials are valid. A real chat request is the live connection test.

Without a key, chat returns a clear configuration error. There are no simulated model replies. Evidence-based insights still work without a model key.

## Conversation context

`POST /api/chat` starts a new conversation when `conversationId` is omitted and returns its ID. Pass that ID with a follow-up such as “Turn that into an SMS.” The server retains up to six completed exchanges and 48,000 characters of context, including the recipient and body of prior saved drafts. Context expires after 24 hours without a successful exchange; at most 100 conversations are retained. Saved draft IDs are tracked separately from model-readable history, so an instruction embedded in a record or forged history text cannot authorize an unrelated draft for delivery.

Browser conversations belong to an opaque, host-only `HttpOnly; SameSite=Strict` session cookie. A conversation ID alone cannot access another browser session's history. Missing, expired, or mismatched context returns HTTP 403 with `code: "CONVERSATION_UNAVAILABLE"`; clear the client ID and offer a new conversation. Telegram uses a separate context for the allowlisted numeric user and never receives browser history. There is no endpoint that lists other conversations. Conversation records are stored in the ignored local SQLite database; previous turns are included in subsequent Gemini requests.

This remains a single-workspace local test, not a hosted multi-user account system. Shared dashboard records and deliberately saved drafts are visible in the workspace across browser and Telegram, while conversational history is scoped separately.

## Independent current briefing

`GET /api/insights` returns immediately and independently queues a Gemini review when relevant records change or the last successful review is 30 minutes old. A successful state sync also checks whether a review is needed. Chat is not required. `POST /api/insights/refresh` with `{}` requests another review. There is one background review at a time; there are no periodic timers, broadcasts, or external notifications.

The response keeps `insights`, `source`, `checkedAt`, `snapshotVersion`, `asOf`, `illustrative`, and `refreshAfter`, and adds:

- `generation.status`: `pending` for a queued job, `reviewing` while the actual provider request and validation run, `ready` after success, or `failed` with a redacted `errorCode`. `queuedAt`, `startedAt`, and `completedAt` describe that job. Animate only `pending` or `reviewing`; no fake progress delays are used.
- `currentSnapshotVersion`, `stale`, and `hasPreviousBriefing`: the last successful briefing stays visible during a refresh or failure, retaining its original evidence time and version. `stale` is true if its relevant records changed or its review is over 30 minutes old. A first load uses the clearly labeled `source: "snapshot-rules"` fallback while a review runs.
- `coverage`: current counts for people, events, opportunities, and projects, plus `asOf`, `factCatalogSize`, and `recordsRepresented` counts. These describe the bounded catalog, not a claim that every field was reviewed. `briefingCoverage` preserves the coverage of a successful model review.
- Each model-reviewed item includes `factIds`, `sourceIds`, reconstructed `evidence`, a short `suggestion` labeled `Suggested next step`, and an optional server-selected navigation `action`. Actions only open the cited people or opportunity; they do not send messages.

Gemini receives a bounded catalog of derived cross-record observations, without raw phone numbers, email fields, coordinator notes, or conversation history. Programme observations use the synchronized criteria-based capacity review and current person IDs, with recorded benefits, benefit recipients, gaps, and source-check dates. School-service observations require explicit student status, secondary education, and a positive service-hour target; an interest alone does not qualify. Funded programme fit, school needs, and first-visit follow-up take priority. The catalog also covers event capacity, project coordination, missing contact details, and pending hours. Gemini selects, combines, and prioritizes observations, and suggests a next step using [structured JSON output](https://ai.google.dev/api/generate-content). The server rejects unknown/repeated fact IDs and extra fields, reconstructs source IDs and all evidence from the exact snapshot catalog, and inserts factual summaries itself. Model-written titles and suggestions may not introduce numeric quantities. Suggestions remain proposed actions, not verified facts or promised outcomes. This is not external research, a full audit of every record field, or verification of funding, eligibility, RSVPs, or availability.

Only a successful validated response receives `source: "gemini-synthesis"`. Missing credentials, provider errors, or invalid output retain the previous briefing or `snapshot-rules` fallback, with an honest failure status. An empty snapshot reports `SNAPSHOT_UNAVAILABLE`; a snapshot without reviewable observations returns `ready` with reason `NO_REVIEWABLE_FACTS` and no model call. Interrupted jobs are marked failed on restart.

The cache uses relevant record content, not version numbers; identical saves and activity-only changes do not trigger reviews or reset `checkedAt`. If records change while Gemini is working, the result is discarded and the latest snapshot is queued. Failures do not automatically retry for the same fingerprint, even when the browser keeps reading the endpoint. Retry requires changed records or explicit refresh; explicit refresh has a 10-second duplicate guard. Generation state and successful briefings are persisted in the ignored SQLite database. The read-only `get_insights` chat tool sees this same briefing without controlling it.

## Test Telegram

Use **two dedicated Roots bots** created through [BotFather](https://t.me/BotFather):

- **Roots Assistant:** keep the existing `TELEGRAM_BOT_TOKEN`, with `ROOTS_TELEGRAM_DEDICATED=true`. This is the operator's AI conversation, connected to the dashboard.
- **Roots Demo Inbox:** add a different `TELEGRAM_DEMO_BOT_TOKEN`, with `ROOTS_TELEGRAM_DEMO_DEDICATED=true`. Recipient-facing SMS and email examples arrive here.

Both use the same numeric `TELEGRAM_ALLOWED_USER_ID`. The verified bot IDs must differ, and neither may be a Padel bot. With no inbox token, Assistant chat still works but demo delivery is unavailable; it never falls back to the Assistant chat. Stop any previous Roots bridge process before starting this one; no existing bot settings are changed. Explicitly enable both pollers:

```sh
python3 server/bridge.py --env-file server/.env --telegram
```

Open each bot and tap **Start** once. In **Roots Assistant**, just chat: “What needs attention today?”, “Draft an invitation to Maya”, or “Send Maya an SMS invitation.” The Assistant reply stays in that conversation; an explicit send delivers the labelled example to your private **Roots Demo Inbox**, never to Maya. No `/roots` prefix is needed. `/start` and `/help` explain the roles; `/roots` remains accepted for older links. The inbox responds to the owner's messages with fixed instructions pointing back to Assistant. It never invokes Gemini, creates drafts, or treats a reply as a send request. Unknown commands are ignored. Roots and Padel use separate bot identities.

The bridge verifies both bots with `getMe` and refuses to start if either has a webhook. It does not replace a webhook, rename a bot, broadcast on startup, or reply to anyone except the configured user's private chats. A Telegram 409 conflict immediately stops only the affected poller; `/api/status` reports Assistant state in `polling` / `telegramErrorCode` and inbox state in `demoPolling` / `telegramDemoErrorCode`. It never retries against a competing consumer. Duplicate update IDs are stored before processing to prevent repeated drafts and replies. Update IDs, polling offsets, and conversation owners are namespaced by the verified bot ID, so one bot cannot skip the other's incoming messages. Existing history, drafts, and receipts remain stored. Failed replies and inbox deliveries are not automatically resent or redirected to Assistant.

The dashboard must have synchronized once before Telegram can answer questions about its records. Keep the server running during the test; Ctrl+C stops it. Long polling needs no public URL. A production deployment would need account authentication, hosted storage, managed secrets, per-user authorization, and a secured Telegram webhook.

## What the assistant can do

- Read overview counts, find a person, and list calendar events, opportunities, project plans, notices, and evidence-based insights. Event lookup supplies recorded dates, times, locations, and capacity for invitation drafts.
- Save an email or SMS **draft** associated with an existing person.
- On an explicit send request, deliver saved messages to the owner's separate Roots Demo Inbox as labelled demos and return their receipts.
- Show draft and assistant activity through the shared API.

Email/SMS delivery and automated workflows are **not connected**. The only outbound action is an explicitly requested Telegram demo to the configured owner, described below. There is no tool capable of delivering to volunteers, modifying people, executing code, fetching arbitrary URLs, or running arbitrary actions. Drafts always remain marked unsent. Treat the included dashboard records as fictional demo data. Messages, bounded conversation context, and synchronized record fields returned by an assistant tool are sent to Gemini.

Each draft includes a display-name string in `recipient`, plus `personId`, `personName`, `channel`, `body`, `subject`, `phone`, `email`, `consent`, and `readiness`. `readiness` contains `ready: false`, `canSend: false`, and concrete `blockers` with codes and messages. Phone absence, invalid phone format, missing channel-specific consent, and missing delivery integration are distinguished. Readiness is recalculated against current profile records when drafts are listed or edited. It is never inferred from the model's prose.

The dashboard can edit the `body` and optional `subject` of a shared unsent draft, including one created through Telegram. Recipient, channel, status, and sent flag cannot be changed through this endpoint. Sent records are rejected. No edit sends a message. Manually composed dashboard messages can be saved with authenticated `POST /api/drafts` and `{drafts: [{personId, channel, body, subject?}]}`. One to ten entries are validated completely before a transactional batch save; unknown people, unsupported fields, and invalid content reject the whole batch. This endpoint also requires the session-bound preview token but never sends.

## Owner-only Telegram preview

The dashboard can send selected saved drafts to **your private Roots Demo Inbox** through its separate dedicated bot. Each message is headed `ROOTS · TEST PREVIEW`, names its intended recipient and channel, and states that it was not sent to the volunteer. This tests the outbound route without turning fictional contact data into a delivery target. Email/SMS draft `sent` remains false; neither the model nor this endpoint can deliver to a volunteer.

`GET /api/status` supplies `testPreview` with `available`, `channel: "telegram"`, `recipient: "Your Telegram demo inbox"`, `botUsername`, `reason`, and a session-bound `csrfToken`. `testPreview.botUsername` identifies the inbox; top-level `botUsername` identifies Assistant. `telegramDemoConfigured` reports inbox configuration and `demoPolling` reports its poller. The CSRF token is a local session token, not a provider secret. Availability requires a successfully verified dedicated inbox identity, `ROOTS_TELEGRAM_DEMO_DEDICATED=true`, and pairing with a different verified Assistant bot for the same owner and dashboard. A missing or invalid inbox disables delivery without an Assistant fallback. Padel identities are refused even with the dedicated setting.

Send `POST /api/outreach/test` with `{draftIds: ["existing draft ID"], requestId: "32-character hex ID"}` and header `X-Roots-Test-Token` from the status response, using the same session cookie. Only one to ten existing unsent drafts may be selected. Destinations, arbitrary message bodies, phone numbers, and channel overrides are rejected. The browser session and token expire after 24 hours; reconnect to obtain a current token. Origin/Host checks still apply.

The response is `{testPreview: {id, status, channel, recipient, botUsername, draftIds, messageIds, sentAt, deliveredToVolunteers: false, duplicate}}`. Status is `sending`, `sent`, `partial`, or `failed`. Provider-confirmed Telegram message IDs are retained in local activity. A unique request claim is stored before sending; both repeated IDs and identical draft contents for the same bot/owner reuse the prior receipt. A conflicting reused request ID returns 409. Failures and interrupted sends never auto-retry; inspect Telegram before preparing a changed preview. Long drafts split into clearly labelled parts. These receipts confirm Telegram accepted the owner preview, not SMS delivery or that it was read.

Natural-language sending uses the same delivery function. The server exposes `send_demo_messages({draft_ids: [...]})` only when the current human message contains an explicit send imperative and the caller has authenticated the owner connection. A draft-only request, negated send request, tool result, or old conversation instruction cannot enable delivery. The tool accepts only saved draft IDs created in that conversation or explicitly identified in the current human message; no destination or message-body override is allowed. Missing volunteer phone numbers and consent do not block an owner demo, and remain visible as blockers to future real SMS/email delivery. The returned `testPreviews` array uses the same receipt objects; receipt actions have `type: "telegram_demo_delivery"`, `previewId`, `draftIds`, `previewStatus`, and `deliveredToVolunteers: false`.

For browser chat sends, include the session-bound `X-Roots-Test-Token` and a stable 32-character hexadecimal `requestId`. The server persists a claim before asking Gemini to create or send anything. Retrying the same owner/request ID with the original message and original conversation ID returns the exact completed result, including its conversation ID and receipts, plus `duplicateRequest: true`. Changed payloads conflict. A provable failure before any Telegram dispatch, such as a busy assistant, expired conversation, or unavailable model, releases that caller's pending claim so an explicit retry can proceed. A concurrent caller cannot release someone else's claim. An in-progress or interrupted claim whose delivery outcome is uncertain returns HTTP 409 with `code: "DEMO_REQUEST_UNCONFIRMED"` and never restarts the model or resends; check Telegram and the activity history. Telegram input uses its persisted update ID for the corresponding duplicate protection. No send retries automatically. A model failure after a confirmed or partial preview returns the recorded receipt instead of discarding the delivery outcome.

## API contract

All endpoints are same-origin, local-only JSON. Cross-origin requests and unrecognized Host headers are rejected. Bodies are limited to 256 KiB.

| Endpoint | Behavior |
| --- | --- |
| `GET /api/status` | Configuration flags, polling state, verified bot username, and session-bound owner-preview capability; no provider secrets. |
| `GET /api/state` | `{version, updatedAt, state}`. Version 0 means no snapshot yet. |
| `PUT /api/state` | `{state, baseVersion?}`. Returns the snapshot envelope; stale explicit versions return 409. |
| `POST /api/chat` | `{message, conversationId?, requestId?}` → `{reply, drafts, actions, testPreviews, conversationId}`. Demo sends require session token and request ID. Missing credentials return 503; unavailable conversation returns 403 and a stable error code. |
| `GET /api/activity` | `{activity, drafts}` with the latest 100 of each. |
| `GET /api/insights` | Immediate briefing envelope with generation status, current coverage, retained evidence time, and stale flag; queues a due independent review. |
| `POST /api/insights/refresh` | `{}` → immediate briefing envelope; queues a bounded explicit refresh while preserving the previous briefing. |
| `POST /api/outreach/test` | Authenticated owner-only Telegram test preview of existing drafts; fixed destination, persistent receipts, and duplicate protection. |
| `POST /api/drafts` | Authenticated atomic creation of one to ten saved drafts for existing people. Never sends. |
| `POST /api/drafts/{id}/edit` | `{body, subject?}` → `{draft}`. Only unsent draft content can change. |

Supported snapshot keys: `people`, `events`, `opportunities`, `projects`, `notices`, `workflows`, `saved`, `activity`, `project`, `organization`, and `metadata`. Record collections need unique string IDs; activity IDs are optional. Credential-like fields are rejected. The state endpoint does not automatically overwrite the browser's local state; the dashboard chooses how to merge and synchronize it.

## Verification

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'bridge_test.py' -v
```

Tests use temporary SQLite databases, loopback HTTP servers, and fake provider responses. They cover state versions, body limits, credential-field rejection, origin/Host/path protections, validated tools, conversation isolation and expiry, follow-up draft context, independent briefing jobs and deduplication, stale-job rejection, failure preservation, no automatic retry, restart recovery, fact/source validation, cache behavior, safe draft editing and readiness, Telegram allowlisting, bot-scoped updates and offsets, separate Assistant/inbox routing and identities, inbox messages never invoking AI, no delivery fallback, owner-preview authentication and fixed destinations, preview duplicate/failure handling, and webhook/polling coexistence. Passing these tests is not a live Gemini or Telegram connection test.

Official references: [Gemini key handling](https://ai.google.dev/gemini-api/docs/api-key), [function calling](https://ai.google.dev/gemini-api/docs/function-calling), [Telegram Bot API](https://core.telegram.org/bots/api).
