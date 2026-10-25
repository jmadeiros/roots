# Roots

**Volunteers who come back.** Built for the East Bay Permaculture Guild at Hack for Social Impact 2026.

The Guild's problem is consistency: people volunteer once and do not return. Roots gives each person a reason to come back, uses AI to know them and reach them, and finds money that funds more volunteer days.

## What it does

- **Today:** what changed since yesterday, what Roots noticed, who is coming back, and a live feed.
- **Hours that count:** finds volunteers whose hours could count for something: FFA placement hours, the CalFresh 80-hours-a-month work rule, community-college work-experience credit, and the State Seal of Civic Engagement. Matches use what people recorded, never guesses.
- **Tell the people:** writes a personal SMS for each matched person. A coordinator edits, approves and sends. In this demo, messages go to a Telegram demo inbox, never to volunteers.
- **Money for the garden:** Microsoft employee volunteer matching ($25 an hour), the CalAgPlate education grant ($2,500 to $10,000, closes 2 November 2026), and funded fellowship programmes.
- **Ask Roots:** a chat assistant in the dashboard and on Telegram (Google Gemini).
- **Profiles:** each volunteer's onboarding answers (work, skills, availability, what their hours could count for). The sign-up itself lives in Garden Steward; see Related.

## Run it

Python 3.10 or newer; nothing to install.

```sh
python3 server/bridge.py --port 8896
```

Open http://127.0.0.1:8896. Without keys, the dashboard and record-based findings work, and chat explains it needs a key.

For the AI assistant and Telegram, copy `server/.env.example` to `server/.env`, fill in your own keys, and run:

```sh
python3 server/bridge.py --port 8896 --env-file server/.env --telegram
```

`server/README.md` explains the settings, the two Telegram bots and the API.

## Honest notes

- Every person is fictional demo data.
- SMS and email are not connected. "Send" delivers labelled examples to the owner's Telegram demo inbox only.
- The monthly "Coming back" history and some Today feed items are demo data.
- Programme facts were checked on 24 and 25 October 2026; sources are in `dist/programs.js`. Eligibility still needs confirming for each one.

## Related

- Garden Steward five-step sign-up (Vue): https://github.com/jmadeiros/garden-vue-hack/tree/volunteer-onboarding
- Garden Steward onboarding API (Strapi): https://github.com/jmadeiros/steward-bank-hack/tree/volunteer-onboarding
- `submission/`: the pitch deck (PowerPoint and PDF) and the pitch script.
