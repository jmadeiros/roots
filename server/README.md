# Roots local assistant test

This bridge serves the dashboard and a shared SQLite snapshot, and can connect Gemini to a private Telegram chat. It uses Python 3.10+ and the standard library. Nothing to install.

## Start the dashboard

From the Roots project directory:

```sh
python3 server/bridge.py
```

Open **http://127.0.0.1:4175**. This is separate from the published static demo. The dashboard sends its records to `/api/state`; the assistant reads that shared snapshot. Local drafts and activity live in `server/.local/roots.sqlite3`, excluded from Git. Snapshots retain the most recent 20 versions. Only the local computer can connect to the bridge.

## Configure Gemini

Copy `server/.env.example` to `server/.env` and set `GEMINI_API_KEY` using your local editor. Never put secrets in the browser, `dist/`, source control, or chat. The optional env loader accepts only the five documented settings; it does not execute shell expressions. Existing environment variables take precedence over the file.

```sh
python3 server/bridge.py --env-file server/.env
```

The default model is `gemini-3.5-flash-lite`, listed as a stable, cost-effective model in the official [Gemini model catalog](https://ai.google.dev/gemini-api/docs/models). Set `GEMINI_MODEL` to change it. The bridge calls the documented [`generateContent` REST endpoint](https://ai.google.dev/api/generate-content) with the key in a header. Model requests incur normal provider usage. Status reports configuration presence, not whether credentials are valid. A real chat request is the live connection test.

Without a key, chat returns a clear configuration error. There are no simulated model replies. This implementation does not retain chat history between questions.

## Test Telegram

Create or use a test bot through [BotFather](https://t.me/BotFather). Add `TELEGRAM_BOT_TOKEN` and your numeric `TELEGRAM_ALLOWED_USER_ID` to the local env file, then explicitly enable polling:

```sh
python3 server/bridge.py --env-file server/.env --telegram
```

Open your bot in Telegram and send `/roots` or `/start`. Then send `/roots Who has only visited once?` or ask naturally, “Draft an invitation to Maya.” `/help` explains Roots. Other slash commands, including PadelWatch's `/status`, `/slots`, `/pause`, `/resume`, and `/book`, are ignored. Outbound PadelWatch alerts can continue using the same bot.

The bridge verifies the bot with `getMe` and refuses to start if a webhook already exists. It does not replace a webhook, rename the bot, broadcast on startup, or reply to anyone except the configured user's private chat. A Telegram 409 conflict immediately stops Roots polling; `/api/status` then reports `polling: false` and `telegramErrorCode: "TELEGRAM_POLLING_CONFLICT"`. It never retries against a competing consumer. Duplicate update IDs are stored before processing to prevent repeated drafts and replies. Failed replies are not automatically resent.

The dashboard must have synchronized once before Telegram can answer questions about its records. Keep the server running during the test; Ctrl+C stops it. Long polling needs no public URL. A production deployment would need account authentication, hosted storage, managed secrets, per-user authorization, and a secured Telegram webhook.

## What the assistant can do

- Read overview counts, find a person, list opportunities, and list notices.
- Save an email or SMS **draft** associated with an existing person.
- Show draft and assistant activity through the shared API.

Email/SMS delivery and automated workflows are **not connected**. There is no tool capable of sending those messages, modifying people, executing code, fetching arbitrary URLs, or running arbitrary actions. Drafts always remain marked unsent. Treat the included dashboard records as fictional demo data. Only synchronized record fields returned by an assistant tool are sent to Gemini.

## API contract

All endpoints are same-origin, local-only JSON. Cross-origin requests and unrecognized Host headers are rejected. Bodies are limited to 256 KiB.

| Endpoint | Behavior |
| --- | --- |
| `GET /api/status` | Configuration flags, polling state, and optional verified bot username; no secrets. |
| `GET /api/state` | `{version, updatedAt, state}`. Version 0 means no snapshot yet. |
| `PUT /api/state` | `{state, baseVersion?}`. Returns the snapshot envelope; stale explicit versions return 409. |
| `POST /api/chat` | `{message}` → `{reply, drafts, actions}`. Missing credentials return 503. |
| `GET /api/activity` | `{activity, drafts}` with the latest 100 of each. |

Supported snapshot keys: `people`, `events`, `opportunities`, `projects`, `notices`, `workflows`, `saved`, `activity`, `project`, `organization`, and `metadata`. Record collections need unique string IDs; activity IDs are optional. Credential-like fields are rejected. The state endpoint does not automatically overwrite the browser's local state; the dashboard chooses how to merge and synchronize it.

## Verification

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'bridge_test.py' -v
```

Tests use temporary SQLite databases, a loopback HTTP server, and fake provider responses. They cover state versions, body limits, secret-field rejection, cross-origin and Host checks, argument validation, unsent drafts, Telegram allowlisting, duplicate updates, and existing webhook preservation. Passing these tests is not a live Gemini or Telegram connection test.

Official references: [Gemini key handling](https://ai.google.dev/gemini-api/docs/api-key), [function calling](https://ai.google.dev/gemini-api/docs/function-calling), [Telegram Bot API](https://core.telegram.org/bots/api).
