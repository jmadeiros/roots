# Roots: 4-minute pitch, live demo path and Q&A prep

Pitch slot: Sun 25 Oct, 3:30 to 5pm. 4 minutes, then 1 minute of Q&A.

Length: about 446 spoken words, plus an optional 36-word assistant segment. At about 145 words a minute, plus clicks, the core runs about 3:40. The optional segment adds about 20 s.

**Hard rule:** if the welcome card on /join appears after 2:40, skip the assistant segment and keep it for Q&A. Without it, the last two segments move 20 s earlier.

---

## 1. Pitch script

**[0:00] The hook**
Picture a sixteen-year-old in FFA. She has to log fifty placement hours this year. She came to one garden workday, and nobody told her those hours count. Since June, many adults on CalFresh must log eighty hours a month of work or volunteering to keep their food benefits. With sign-off, garden hours can count for both, plus college credit and the State Seal of Civic Engagement. People come back when their hours count. Roots tells them.

**[0:30] Part one: benefits, live** *[Tab 1, Overview]*
This is Roots, on a fictional demo garden. One sentence up top: twelve volunteers could gain a benefit by coming back. *[Click the first box]* Three students could log FFA hours. What they get, what we do, and the official source, with the date we checked it. *[Click "Tell the students"]* Roots drafts the text. I choose who gets it, and I can change any word. *[Leave only Sofia ticked. Change "can count" to "could count". Click "Send to demo inbox"]* SMS isn't connected, so this goes to my demo inbox, standing in for Sofia's phone. *[Hold up the phone]* There it is. Nothing reached a real volunteer.

**[1:15] Event details into outreach** *[Click Overview. Point at the "first-timers not back yet" box. No click]*
Events work the same way. This box turns Saturday's workday details into an invitation for the eight first-timers, ready for a volunteer to review.

**[1:25] Part two: matching** *[Opportunities, filter "Employer matching"]*
Part two: Roots matches people to programmes by their circumstances, like school, employer and benefits, and to workdays by what they enjoy. Three work at Microsoft. Its published policy pays a nonprofit twenty-five dollars per eligible volunteer hour, if the Guild qualifies. We still need to confirm that. *[Click "Tell the people"]* Finn's SMS permission isn't recorded, and Roots flags it. *[Untick Finn. Close the window]*

**[1:55] Part three: money** *[Filter "Grants", CalAgPlate card]*
Part three: money. This education grant pays up to ten thousand dollars and closes in eight days. In the demo garden, twenty students fit it.

**[2:10] Welcoming new members** *[Tab 2, /join, on "Could your hours count for something?"]*
New members join in Garden Steward, an open-source volunteer app for gardens. We added a two-minute sign-up, one question per screen. This one asks: could your hours count for something? *[Click the FFA option. OK. Skip]* SMS consent is required. *[Click "Text me about volunteer days". Click "Join the garden"]* The answers go to the garden's coordinators. Feeding them into Roots is next.

**[2:40] OPTIONAL: the assistant** *[Phone, @roots_community_josh_bot, reply already waiting]*
Coordinators can also text Roots. I asked it what needs attention today. Gemini answers from the records. It isn't even given the send tool unless you clearly say send, and sends reach only my demo inbox.

**[3:00] What is new, real and demo** *[Face the panel. No clicks]*
What's new: Roots checks people's recorded circumstances against sourced programme rules, and shows what is still unproven. Real: the matching, the sourced research, the drafts, the Telegram flow and the Garden Steward code. Demo: all thirty-five people are fictional, some Today items are seeded, SMS isn't connected, join answers don't reach Roots yet, and it runs on this laptop. Upkeep is small: no build step, no Python packages, one SQLite file and a Gemini key. We haven't measured running costs.

**[3:30] Close and ask**
So: a newcomer knows how to join. A volunteer has a reason to return. An organizer stops rewriting the same message, and nothing goes out without their go-ahead. Our ask: pilot Roots with the Guild, connect it to Garden Steward's SMS, and check together whether the Guild can apply for CalAgPlate before 2 November. Thank you.

---

## 2. Live demo click path

1. **PRE-FLIGHT, by 3:15 PM: services.**
   (a) Open http://127.0.0.1:8896/api/status. Check polling:true, demoPolling:true and testPreview.available:true.
   (b) Open http://127.0.0.1:1337/api/onboarding/options and check it lists two gardens. If it is down, restart Strapi in /Users/josh/steward-bank-hack with `npm run develop`. Postgres runs on :5432.
   (c) Open http://127.0.0.1:5173/join in the browser. A 200 alone proves nothing, because Vite returns 200 for any path. Check that the garden question lists "Downtown Community Garden" and "Neighborhood Garden".
   (d) Phone: Telegram open on @roots_demo_inbox_josh_bot, with @roots_community_josh_bot one tap away. Turn on Do Not Disturb.
   (e) Laptop on charger, with caffeinate running.
   (f) A phone hotspot ready as backup Wi-Fi. Telegram and Gemini both need the network.
   (g) Gallery shot 07 open in a background browser tab, as a fallback for the send.

2. **PRE-FLIGHT: tab 2, /join.** The form now asks one question per screen (new at 13:27). Answer every screen up to "Could your hours count for something?" and stop there. Do not reload the tab.
   - Name: a fictional first name.
   - Mobile: a fresh fictional number in the (510) 555-01xx range. A phone that already exists is refused with 409, so use a new one for each run.
   - Email: an @example.com address.
   - Garden: pick one. One task, one skill, Saturday, Mornings, and how often.
   - "Where do you work?": leave it blank and press OK. This avoids the Microsoft callout, which states $25 as certain, and it skips the job-title screen.
   - LinkedIn: press Skip.

3. **PRE-FLIGHT, about 2 minutes before you start.** Text "What needs attention today?" to @roots_community_josh_bot. The reply will be waiting, so nothing waits live.

4. **PRE-FLIGHT: tab 1.** Open http://127.0.0.1:8896/#briefing (Overview in the sidebar, layout A by default). Reload it just before you start. The first feed item (Chloe Davis signs up) arrives at 8 s.

5. **[0:00 to 0:30] Tab 1, no clicks.** Speak the hook. If the "Today's feed" badge lights, ignore it. Do not click the "2 drafts" link. That label is seeded. Notices holds the real drafts.

6. **[0:30] The first box.** Point at "12 volunteers who could gain a benefit" in the summary sentence. Under "What Roots noticed", click the first box. It reads "3 · Benefit · students could log FFA hours". The detail opens below, headed "3 agriculture students could log FFA placement hours here". Point at What they get, What you'd do, and the California FFA SAE source checked 25 Oct.

7. **Tell the students.** Click "Tell the students". The "Tell the people" window opens with Sofia Patel, Ethan Brooks and Owen Wright ticked. Untick Ethan and Owen, so only Sofia is ticked. In the message, change "can count" to "could count". This shows the text can be edited, and it is more accurate, because her FFA advisor must approve the placement.

8. **Send to demo inbox.** Click "Send to demo inbox". The view moves to the Ask Roots chat and shows the SMS card at Review. The first chat lines ("Send the message to Sofia." and the reply) are scripted in the browser, not written by Gemini. Do not call them AI replies. Wait for the receipt: "Demo sent to Telegram... No SMS or email was sent to the intended recipients." Hold up the phone. @roots_demo_inbox_josh_bot shows "SMS to Sofia Patel" and her text.
   - **Fallback:** if no Telegram message arrives within 5 s, or the receipt says not confirmed, do not retry on stage. A failed card cannot be resent. Say "the receipt is here in the review card", point at it, then show shot 07 or the Telegram chat history. Re-run Tell the people once only if you are ahead of time.

9. **[1:15] Events.** Click "Overview" in the sidebar. Point at the box ending "first-timers not back yet". Do not click it.

10. **[1:25] Employer matching.** Click "Opportunities" in the sidebar (http://127.0.0.1:8896/#opportunities). Click the route filter "Employer matching". On the "Microsoft employee volunteer matching" card, point at the status "Public policy · Eligibility to confirm" and the 3 avatars.

11. **Finn.** On the Microsoft card, click "Tell the people". Point at Finn Carter's row: "SMS permission not recorded". Untick Finn. Close the window with its close button or Esc. Do not send from here.

12. **[1:55] Grants.** Click the route filter "Grants". On the "CalAgPlate education grant" card, point at "$2,500–$10,000", the 2 Nov deadline and the matched students. Click "Requirements & sources" only if asked. Its heading says "checked 24 Oct 2026", while the benefit cards say 25 Oct. Do not click "Prepare application". It only fills in a chat prompt and submits nothing.

13. **[2:10] /join.** Switch to tab 2, already on "Could your hours count for something?".
    - Click "I'm in FFA or an agriculture class" (or press B), then OK.
    - On "What would make coming back worth it for you?", click Skip.
    - On "Last thing... How should we reach you?", click "Text me about volunteer days". Say that SMS consent is required.
    - Click "Join the garden". The welcome card reads "Welcome, [name]. You've joined [garden]." It lists her benefit notes. Note: the Strapi demo gardens are not "Greenfield Farm", so the garden name differs from Roots.
    - Do not type an employer on stage.
    - **Fallback** if Strapi is down: show the join gallery shots.

14. **[2:40] OPTIONAL: assistant.** Only if the welcome card appeared by 2:40. On the phone, open @roots_community_josh_bot and show the reply that is already waiting. Do not wait for a live reply.
    - **Fallback** if Telegram fails: skip it. The chat box on tab 1 also uses Gemini over the same network, so it is not a real fallback.

15. **[3:00] No clicks.** Face the panel for the new, real and demo lines.

16. **[3:30] Close on the ask.** Pilot with the Guild, connect to Garden Steward's SMS, and check together whether the Guild can apply for CalAgPlate before 2 November. Then take Q&A.

17. **OPTIONAL in Q&A: a profile.** On the Employer matching view, click the AR avatar on the Microsoft card. Or click People, then the Everyone tab, then Alex Rivera. The profile shows work at Microsoft, the "Their hours could count for" tags, "What would bring them back", and a LinkedIn link marked "Demo link". Say: "Roots never reads LinkedIn. It keeps only the link a volunteer types." The profile tag "Microsoft gives the garden $25 an hour" is worded as certain, so add: "eligibility is still to confirm."

18. **OPTIONAL in Q&A: accessibility, about 10 s.** On tab 1, press Tab once to show the "Skip to content" link. Tab on to a noticed box and press Enter to open it. The boxes are buttons with aria-expanded, and the feed items are native details elements. Nobody has run axe or a full tab-through, so do not claim an axe check unless you ran one.

**Watch-outs (Josh's call, nothing changed in the code)**
- The workspace says "Greenfield Farm" and "Jamie" in a Sacramento scenario, not the Guild. Say it is a fictional demo garden. The Strapi demo gardens are "Downtown Community Garden" and "Neighborhood Garden".
- The community-college card says "3 community college students", but those 3 are recorded as "Not a student". They match only through the benefit tag.
- "Tell the people" starts with everyone ticked, including Finn Carter, who has no SMS permission. Untick him on stage.
- These are worded as certain: the Microsoft SMS text, the join callout, the join welcome-card note, and the profile tag "Microsoft gives the garden $25 an hour". Only the route status says "Eligibility to confirm".
- The FFA SMS says shifts "can count" as placement hours, but the advisor must approve. The CalFresh SMS says hours "can count toward the 80 hours a month... we can sign the form", but the county must verify. Soften on stage if you show them.
- Demo sends now arrive on the phone headed only "SMS to [Name]". The old "TEST PREVIEW" label is gone. Only the bot's name and the dashboard receipt mark them as demo.
- The join form offers Apple at $25 an hour with no source in Roots. Avoid typing Apple on stage.
- The join form has no State Seal option.
- The "Try the SMS flow" sample says "Greenfield Farm".

---

## 3. Q&A prep (1 minute, honest answers)

- **Is SMS live?** No. Drafts are real and saved, but no provider is connected. Every draft carries the blocker DELIVERY_NOT_CONNECTED. The next step is Garden Steward's existing SMS bot.
- **Real volunteers?** No. All 35 are fictional.
- **Does the person who just joined appear in Roots?** Not yet. That connection is next.
- **Cost?** Not measured. It needs a Gemini key, a small host and the SMS provider Garden Steward already uses. No build step and no Python packages.
- **How do you know someone qualifies?** You don't, until a person checks. Roots matches on recorded circumstances, shows the source and check date, and lists what is still to establish. Each benefit needs approval from an advisor, a college or the county.
- **Why store CalFresh status?** Only if the volunteer chooses to tell us at sign-up. It is optional, and only coordinators see it.
- **Consent?** The join form requires SMS consent. Roots labels every person's SMS permission. Enforcing it on real sends is next.
- **Why was Finn ticked?** Today, sends reach only my demo inbox. Before any real send, people without permission will start unticked and be blocked. The draft already carries the delivery blocker.
- **Opt-out?** Roots has none yet. Garden Steward's SMS bot already handles STOP and records the opt-out, and real sends would go through it.
- **Can the AI send by itself?** No. The send tool is offered only on a clear "send it", and only to the owner's demo inbox.
- **Where is the AI?** Matching uses fixed rules on purpose, so it is steady and can be checked. Gemini handles the conversation and drafting.
- **Are the messages AI-written?** Benefit messages come from fixed templates, so the wording has been checked. Gemini drafts in chat. A person can edit everything, and nothing is sent without their go-ahead.
- **Is the Guild eligible for CalAgPlate?** Not checked. Let's check it this week.
- **Why Garden Steward and not Partiful or the Google Group?** It is open source and already has SMS with STOP opt-out, and the Guild would own the data.
- **What if rules change?** Each researched entry stores its sources and a check date. The school partnership has no source yet. The plan is for a volunteer to recheck them each term.
- **Is it tested?** The Codex base has its own Python and JavaScript tests. The new work shown today has no automated tests yet.
