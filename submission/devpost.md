# Roots: Devpost submission (final)

> **Before you paste (not for Devpost). Checked 13:40 PDT, 25 Oct.**
> - Roots has 26 commits. Re-count just before submitting: `git -C /Users/josh/roots-today-claude-20261025 log --oneline | wc -l`.
> - garden-vue-hack gained a new commit at 13:27 (212f053). The /join page now asks one question per screen, not 5 steps. The text below says so. Gallery shots 10 to 12 still show the old 5-step design. See gallery.md.
> - Both Garden Steward branches are pushed to public forks. steward-bank-hack is at 142e12e and garden-vue-hack at 212f053. No PR is open to Garden-Steward.
> - The Codex base README mentions a "published static demo". Its URL is not in the repo. TO CONFIRM before you claim "not hosted".
> - Josh ticks the terms box and presses Submit himself. Save a draft early and aim for 2:30 PM PDT. The hard deadline is 3:00 PM PDT.

---

## Project name

Roots

## Tagline

Volunteers come back when their hours count. Roots tells each one what their garden hours can earn, matches them to projects and programmes, and finds grants. Nothing sends without a person's OK.

---

## Inspiration

The East Bay Permaculture Guild's problem statement is "PS3: Grow lasting participation in East Bay permaculture while reducing the burden on organizers". Its written challenge says:

> "Build simple tools to help the Guild welcome new members, understand how they want to participate, and turn event details into outreach ready for volunteer review. Keep it affordable, easy for volunteers to maintain, and true to the personal connections."

We started with one question. Why would someone come back after their first visit?

A good day helps. A reason helps more. Many volunteers already have one, and nobody has told them:

- A high-school FFA student needs logged placement hours: at least 10 in year one, then 50 a year.
- Since 1 June 2026, many adults on CalFresh (ages 18 to 64, able to work, no child under 14) must log 80 hours a month of work, training or verified volunteering to keep their benefits beyond 3 months.
- A community college gives 1 unit of work-experience credit for every 60 volunteer hours.
- An Oakland high-school student can earn the State Seal of Civic Engagement on their diploma with 15 hours and a civic project.

Garden hours can count toward all four, with the right sign-off. The Guild can tell people that. So Roots starts there.

---

## What it does

**In one line:** Roots gives volunteers a reason to come back (their garden hours can count toward FFA, CalFresh, college credit or the State Seal). It gives organizers drafts to review instead of messages to rewrite.

**How Roots answers the Guild's challenge**

- **Welcome new members:** a new /join sign-up in Garden Steward. It asks one short question per screen and takes about two minutes.
- **Understand how they want to participate:** it asks about tasks, skills, days, times, how often, work, and whether their hours could count for something.
- **Turn event details into outreach ready for volunteer review:** Today turns an event ("Saturday in the garden, 31 Oct, 9am to 12pm") into an SMS for first-timers. A person picks who gets it, edits it and approves it.
- **Affordable and easy to maintain:** no build step, no Python packages, one SQLite file and one Gemini key. Running costs have not been measured yet.
- **True to personal connections:** every message can be edited, and nothing is sent without a person's go-ahead.

**1. Benefits that give people a reason to come back**

Roots keeps a catalogue of 4 in-kind benefits: FFA placement hours, the CalFresh 80-hours-a-month work rule, community-college work-experience credit, and the State Seal of Civic Engagement. Each one lists its requirements, what the site has to check, a draft SMS, and 2 sources checked on 25 Oct 2026. Benefits always rank ahead of every grant.

The front page (Overview in the sidebar) opens with a summary sentence. It names the 12 volunteers who could gain a benefit by coming back. Below it are four "What Roots noticed" boxes: 3 FFA students, 4 CalFresh volunteers, 20 students who fit the CalAgPlate grant, and 8 first-timers not back yet. The 12 counts everyone matched to any of the four benefits. Each box shows what they get, what you would do, and the source with its check date.

One click on "Tell the students" opens a "Tell the people" window. The coordinator chooses who to tell. Each person shows "SMS permission recorded" or "not recorded". The coordinator edits the SMS. Then they save drafts, or send an example to a separate demo-inbox bot on Telegram.

Three of the four benefits (FFA, community-college credit and CalFresh) also appear in the new join form, with school service hours. So they help recruit as well.

CalFresh status is sensitive. Roots knows it only if a volunteer chooses to say so at sign-up. The answer is optional, and only coordinators see it.

**2. Matching people to programmes and projects**

Every profile carries onboarding answers: skills, how often they want to come, work, what would bring them back, and which benefits their hours could count for.

Programmes match on recorded circumstances: school, level and campus for students, employer for employer matching, and the benefits each person chose to record. Placements use named supervisors and host capacity. Workdays and events match on interests and skills. Each match counts its checks: what is ready and what is still to establish.

The Opportunities page ranks 11 routes, benefits first. Filters: Volunteer benefits, Employer matching, Grants, Funded placements and School partnerships.

**3. Things to apply for**

- **CalAgPlate education grant:** $2,500 to $10,000. Closes 2 Nov 2026, 9am PT. In the demo garden, 20 recorded students and 2 named leads fit a proposal. Whether the Guild can apply is still to check.
- **Microsoft employee volunteer matching:** a published policy of $25 per eligible hour, within a combined $15,000 a year time-and-giving cap per eligible employee. 3 demo volunteers are recorded as Microsoft employees. Eligibility is still to confirm.
- **College Corps:** 12 full-time undergraduates at 2 campuses. Up to $10,000 per fellow for 450 hours, paid to the student fellows, not the Guild. Sacramento State's host intake reopens in March 2027 and needs 3 places. Campus approval and student eligibility are still to check.
- **California Climate Action Corps:** 2 named supervisors. Host applications open January 2027.
- **Climate Action Event Microgrant:** with 25 attendees, an event could qualify for up to $500 in reimbursement (50 attendees for $1,000). The pool is 35 people, but turnout is not confirmed and funds are nearly allocated.

"Prepare application" fills in a chat prompt. Nothing is submitted.

**Around the three parts**

- **An assistant you can text.** It works in the dashboard chat and on Telegram (@roots_community_josh_bot). Ask "What needs attention today?" in plain words. It uses Google Gemini with 8 tools to look up people, events, opportunities and notices, and to save drafts.
- **Nothing is sent without a go-ahead.** In the dashboard, the coordinator picks the people, edits the message and presses Send. In chat or on Telegram, the assistant can send only after a clear "send it". In this demo every send goes to a second bot (@roots_demo_inbox_josh_bot), which stands in for the volunteer's phone.
- **A Today's feed** lights a badge when new sign-ups or logged hours arrive. A "Coming back" chart shows returns by month and by interest.
- **Onboarding in Garden Steward**, an open-source volunteer app for community gardens. The new /join page saves to new fields in the Strapi backend. The coordinator's volunteer panel has new fields for work, skills, availability, benefit badges and hopes.

All people in the demo are fictional. SMS and email are not connected. See "What is real and what is demo" below.

---

## How we built it

Built so one volunteer can maintain it: no build step, no Python packages, one SQLite file. Built so it cannot message a volunteer by accident: real delivery is switched off in code, and every send goes to the owner's demo inbox.

**Technical details**

*Roots app*
- Plain JavaScript single-page app. No framework and no build step.
- The noticed boxes and programme matches use fixed rules in the browser, so they stay steady and can be checked. Gemini handles conversation and drafting.

*Roots bridge*
- Python 3 standard library only (http.server, sqlite3, urllib). No pip packages.
- One SQLite file stores drafts, activity, conversations and demo receipts.
- Google Gemini (gemini-3.5-flash-lite) with function calling and 8 tools. A 9th tool, send_demo_messages, is offered only when the current message is a clear send instruction such as "send it". Phrases like "don't send" or "before I approve" block it. The assistant can send only drafts from this conversation. Up to 10 model turns, with at most 8 tool calls per turn.
- Telegram Bot API with long polling and two dedicated bots. Both answer only one allowed user in a private chat.

*Safety in the bridge*
- It binds to 127.0.0.1 and checks host, origin and fetch site, so all API calls must come from the local origin.
- Creating drafts and every send need a per-session token. Request bodies are capped at 256 KB. The SQLite file is mode 0600.
- Each send is fingerprinted. Repeating a send returns the existing receipt instead of sending again. A restart mid-send never resends.
- Real-delivery readiness is always false, with the blocker DELIVERY_NOT_CONNECTED.

*Garden Steward onboarding* (volunteer-onboarding branches, public forks)
- Strapi 5 and PostgreSQL 14 backend: 12 new user fields and 4 endpoints: GET /api/onboarding/options, POST /api/onboarding/join, and GET and PUT /api/onboarding/me.
- Join checks phone, first name, email, SMS consent and garden. It refuses a phone that already exists (409) and allows 10 sign-ups an hour per IP. It creates the volunteer as INTERESTED and links their interests.
- Onboarding answers on the garden page go to the garden's managers only.
- Vue 3 and Vite frontend: the /join sign-up (one question per screen, with letter keys to pick options) and the new coordinator panel fields.

*How the work was done*

Josh Madeiros built Roots with AI coding agents. OpenAI's Codex agent built the first Roots base on 24 and 25 Oct (17 commits, with its own Python and JavaScript test suites). Claude Code built the benefits layer, Today, "Tell the people", the onboarding data and the Garden Steward branches on 25 Oct. That is 26 Roots commits on top of the Codex base, including the first copy of the base and one sync of Codex's latest files, plus 3 Strapi commits and 4 Vue commits. The Roots copy shown today does not carry the base's tests, and the new work has no automated tests yet.

---

## What is real and what is demo

*(Paste as an extra section after "How we built it".)*

**What is demonstrated (real code, runs live)**
- Benefit and programme matching on 35 records, in the browser.
- 11 programme entries with requirements and 22 source links, mostly official. They were researched 24 to 25 Oct 2026 and are stored in dist/programs.js. There is no live lookup.
- Drafts saved to a local SQLite store, with editing, review and receipts.
- Gemini chat with tools, in the dashboard and on Telegram.
- Examples delivered to the owner's separate Telegram demo inbox.
- The Garden Steward /join page and onboarding API, running locally on Strapi 5 and Vue 3.

**What is demo data or still a prototype**
- All 35 people are fictional, with example.com emails and 555 phone numbers. The workspace is a fictional garden, "Greenfield Farm", in a Sacramento scenario.
- SMS and email are not connected. "Send" delivers examples only to the owner's Telegram demo inbox. No message has reached a volunteer.
- These Today items are seeded: the monthly "Coming back" history, "4 people joined", the "2 drafts" label in the summary, and the feed items. 3 feed items arrive on timers, at 8 s, 45 s and 110 s. The "By interest" chart is worked out from the records.
- LinkedIn is never read or scraped. Roots stores only a link the volunteer types, and the demo links are made up.
- The dashboard is hosted at https://roots-ebpg.vercel.app. The AI assistant and Telegram bots run from the laptop during the demo. An earlier static demo of the Codex base was published by Codex. It has no assistant, Telegram or benefits layer.
- Join answers saved in Garden Steward do not flow into Roots yet.
- Microsoft matching is a published policy. Eligibility must still be confirmed.
- Grant applications are never submitted.

**Ongoing effort and costs**
- Running costs have not been measured.
- What it needs: a Gemini API key (pay per use), a small host, the SMS provider Garden Steward already uses, and a volunteer to review drafts. The plan is for that volunteer to recheck the 11 programme entries each term.
- Upkeep stays small: no build step, no Python packages and one SQLite file.

---

## Challenges we ran into

- **Keeping matches honest.** Interests are not eligibility. Programmes match only on recorded circumstances. Every gap shows as "Still to establish".
- **Making "send" safe in a live demo.** We split the assistant and the inbox into two bots. Sends go only to the owner. The send tool needs a clear instruction, and every send is fingerprinted.
- **Keeping the front page simple.** The Today page took 18 commits between 7am and noon, across five layouts. We cut it to one sentence and four boxes.
- **Programme rules change by place.** Districts, counties and colleges set their own rules. Each researched entry stores its sources (22 links across 10 of the 11 routes) and a check date. The school partnership is marked as a local proposal with no source. Each benefit says who must approve it.
- **Gaps we found and left visible.** The 3 community-college matches come from a benefit tag, not a recorded school. "Tell the people" starts with everyone ticked, including people without SMS permission. That is safe today only because examples go to the owner alone. The join form states the Microsoft $25 as certain, while Roots marks it "to confirm".

---

## Accomplishments that we're proud of

- **Benefits lead.** The four boxes on the front page lead with who could gain something by coming back.
- **A full live loop.** Noticed box, then "Tell the students", then an editable SMS, then send, then a real phone's demo inbox, then a receipt. It takes under a minute.
- **11 programme routes with 22 source links (mostly official)**, checked 24 to 25 Oct 2026.
- **Onboarding built into an existing open-source volunteer platform (Garden Steward)**, not a side app: 12 fields, 4 endpoints and a one-question-per-screen sign-up.
- **A bridge with no dependencies**, and an assistant that is not given the send tool unless you say send.
- **Safe by design.** Every send goes only to the owner's demo inbox, and none has reached a volunteer.

---

## What we learned

- We think a concrete benefit is a stronger reason to return than a reminder: "your hours count" instead of "please come again". We have not tested this with volunteers yet.
- Eligibility depends on a person's circumstances, not their interests.
- We cut the front page to one sentence and four boxes after trying five layouts.
- Honest labels make a demo easier to trust. "Nothing was sent to the volunteers" says what is true.
- A person must stay in control of outreach: draft, review, then send.

---

## What's next for Roots

1. Check with the Guild whether it can apply for the 2026 CalAgPlate Tier 2 education grant (closes 2 Nov 2026, 9am PT), and help draft the proposal if so.
2. Connect the drafts to Garden Steward's existing SMS bot, which already handles STOP. Require SMS consent on every real send, and start people without permission unticked.
3. Send join answers from Garden Steward into Roots, so matching uses real profiles.
4. Host it, with the Guild's name and Oakland data in place of the demo garden.
5. Confirm Microsoft eligibility through Benevity, and stop the join form stating $25 as certain. Add a source for Apple matching or remove it.
6. Add hour tracking and paperwork: CalFresh CF 888 sign-off, FFA AET logs, college work-experience forms and State Seal letters.
7. Add the State Seal to the join form, add tests for the new work, and open PRs to Garden Steward.

---

## Built with

javascript, html5, css3, python, sqlite, google-gemini, gemini-3.5-flash-lite, telegram-bot-api, strapi, node.js, postgresql, vue.js, vite, tailwindcss

---

## Other fields

**Team (Manage team)**
Josh Madeiros. Roots is team 22 on the organisers' judging list, the first of six Guild teams (22 to 27). TO CONFIRM: invite any other team members on Devpost before submitting.

**Problem statement / prize category**
Permaculture & Community: East Bay Permaculture Guild (PS3: Grow lasting participation in East Bay permaculture while reducing the burden on organizers). TO CONFIRM: the exact option wording on the Devpost form.

**Nonprofit partner**
East Bay Permaculture Guild (Oakland). Our onboarding work is in Garden Steward, an open-source volunteer app for community gardens.

**Opt-in prizes**
Opt in to the East Bay Permaculture Guild problem-statement prize and to Crowd Favorite, if the form offers them. TO CONFIRM on the form.

**Try it out links / repo** (Josh's decision whether to list them)
- Roots live dashboard: https://roots-ebpg.vercel.app (the dashboard; the AI assistant and Telegram run locally at the demo)
- Roots code (public): https://github.com/jmadeiros/roots
- Garden Steward backend (public fork): https://github.com/jmadeiros/steward-bank-hack/tree/volunteer-onboarding
- Garden Steward frontend (public fork): https://github.com/jmadeiros/garden-vue-hack/tree/volunteer-onboarding
- All three are public. No PR is open to Garden-Steward; the onboarding work lives on the forks.

**Video demo link**
Josh has the video from another chat. Paste its link here.

**Thumbnail image**
Crop /Users/josh/roots-today-claude-20261025/submission/shots/01-roots-today.png from 1440x900 to 1350x900 (3:2).

**Additional hackathon questions**
TO CONFIRM. The form sits behind a Devpost login and could not be read. Answer any extra questions within the "What is real and what is demo" section. Do not claim OpenAI API use, hosting, live SMS, LinkedIn reading or real volunteers.

**Accessibility bonus**
TO CONFIRM. No axe run and no full keyboard tab-through were done. The code has a "Skip to content" link. The Today boxes are buttons with aria-expanded, and the feed items are native details elements. Several CSS files have focus-visible styles. The /join options are buttons with letter-key shortcuts. Only if you run axe on http://127.0.0.1:8896/#briefing and http://127.0.0.1:5173/join before 3:00, add: "We ran axe on the Today and /join pages (N issues). Today has a skip link, and its boxes open with Enter." Skip this line if the run is not done.

**Submit**
Josh must tick the Devpost terms box and press Submit himself. Save a draft early and aim to submit by 2:30 PM PDT. The hard deadline is 3:00 PM PDT, with no extensions.
