"""Local-only verification. Provider responses are fakes; these are not live API tests."""
import importlib.util
import http.cookiejar
import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

SPEC = importlib.util.spec_from_file_location("bridge", Path(__file__).resolve().parents[1] / "server" / "bridge.py")
bridge = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(bridge)


class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = bridge.Store(Path(self.tmp.name) / "test.sqlite3")
        self.state = {"people": [{"id": "p01", "name": "Maya Chen", "visits": 1, "hours": 4, "consent": True}], "events": [], "opportunities": [{"id": "o01", "title": "Garden grant"}], "notices": [{"id": "n01", "title": "Invite a first-time volunteer back"}]}
        self.store.save(self.state)

    def tearDown(self):
        self.tmp.cleanup()

    def test_snapshot_versions_reject_lost_update(self):
        self.assertEqual(self.store.snapshot()["version"], 1)
        self.store.save(self.state, 1)
        with self.assertRaises(bridge.Conflict):
            self.store.save({"people": []}, 1)
        self.assertEqual(self.store.snapshot()["state"]["people"][0]["id"], "p01")

    def test_state_validation_rejects_credentials_duplicates_and_bad_types(self):
        invalid = [
            {"apiKey": "placeholder"},
            {"metadata": {"GEMINI_API_KEY": "placeholder"}},
            {"people": [{"id": "a"}, {"id": "a"}]},
            {"people": "wrong"},
            {"people": [{"id": "a", "hours": float("nan")}]},
            {"people": [{"id": "a", "hours": 10 ** 400}]},
            {"saved": [5]},
            {"projects": ["wrong"]},
        ]
        for state in invalid:
            with self.subTest(state=state), self.assertRaises(bridge.Invalid):
                self.store.save(state)
        self.assertEqual(self.store.snapshot()["version"], 1)

    def test_size_limits(self):
        with self.assertRaises(bridge.Invalid):
            self.store.save({"people": [{"id": str(i), "notes": "x" * 4000} for i in range(100)]})
        with self.assertRaises(bridge.Invalid):
            bridge.text("x" * 4001, "message", 4000)

    def test_read_tools_use_snapshot(self):
        summary = bridge.execute_tool(self.store, "get_overview", {})
        self.assertEqual(summary["people"], 1)
        self.assertEqual(summary["recordedVolunteerHours"], 4)
        self.assertFalse(summary["deliveryConnected"])
        self.assertEqual(bridge.execute_tool(self.store, "find_person", {"query": "maya"})["people"][0]["id"], "p01")

    def test_event_tool_returns_calendar_details_and_validates_query(self):
        event = {"id": "e01", "title": "Saturday garden", "date": "2026-10-31", "time": "9:00 AM", "category": "Community gardening", "capacity": 18, "attendees": 12}
        self.state.update(events=[event], metadata={"asOf": "2026-10-24"})
        self.store.save(self.state)
        result = bridge.execute_tool(self.store, "list_events", {"query": "GARDEN"})
        self.assertEqual(result["events"], [event])
        self.assertEqual(result["asOf"], "2026-10-24")
        self.assertEqual(result["totalMatches"], 1)
        self.assertEqual(result["snapshotVersion"], 2)
        self.assertEqual(bridge.execute_tool(self.store, "list_events", {})["events"], [event])
        self.assertEqual(bridge.execute_tool(self.store, "list_events", {"query": "grant"})["events"], [])
        for args in ({"query": []}, {"query": "x" * 101}, {"send": True}):
            with self.subTest(args=args), self.assertRaises(bridge.Invalid):
                bridge.execute_tool(self.store, "list_events", args)

    def test_unknown_tools_and_invalid_arguments_are_rejected(self):
        for name, args in [("send_sms", {}), ("get_overview", {"execute": "code"}), ("find_person", {}), ("find_person", {"query": []}), ("draft_message", {"person_id": "missing", "channel": "sms", "body": "Hello"}), ("draft_message", {"person_id": "p01", "channel": "telegram", "body": "Hello"})]:
            with self.subTest(name=name, args=args), self.assertRaises(bridge.Invalid):
                bridge.execute_tool(self.store, name, args)
        self.assertEqual(self.store.activity()["drafts"], [])

    def test_draft_is_saved_and_not_sent(self):
        result = bridge.execute_tool(self.store, "draft_message", {"person_id": "p01", "channel": "email", "body": "Come back next Saturday."})
        self.assertFalse(result["draft"]["sent"])
        self.assertEqual(result["draft"]["status"], "draft")
        self.assertEqual(len(self.store.activity()["drafts"]), 1)

    def test_draft_consent_is_channel_specific_and_explicit_false_wins(self):
        person = self.state["people"][0]
        cases = [
            ({"consent": True, "emailConsentRecorded": False}, False, True),
            ({"consent": True, "emailConsentRecorded": True, "smsConsentRecorded": False}, True, False),
            ({"consent": True}, False, True),
            ({"consent": False, "smsConsentRecorded": True}, False, True),
            ({"consent": False}, False, False),
        ]
        for fields, email_consent, sms_consent in cases:
            with self.subTest(fields=fields):
                for name in ("consent", "emailConsentRecorded", "smsConsentRecorded"):
                    person.pop(name, None)
                person.update(fields)
                self.store.save(self.state)
                for channel, expected in (("email", email_consent), ("sms", sms_consent)):
                    result = bridge.execute_tool(self.store, "draft_message", {"person_id": "p01", "channel": channel, "body": "Hello"})
                    self.assertEqual(result["draft"]["contactConsent"], expected)
                    self.assertFalse(result["draft"]["sent"])

    def test_fake_gemini_tool_cycle_and_duplicate_draft(self):
        requests = []
        call = {"functionCall": {"name": "draft_message", "args": {"person_id": "p01", "channel": "sms", "body": "Hi Maya"}}}
        def fake(url, payload, headers):
            requests.append(payload)
            parts = [call, call] if len(requests) == 1 else [{"text": "Your draft is ready."}]
            return {"candidates": [{"content": {"role": "model", "parts": parts}}]}
        result = bridge.Assistant(self.store, "fake-test-key", request=fake).chat("Draft an invitation")
        self.assertEqual(len(result["drafts"]), 1)
        self.assertIn("not sent", result["reply"])
        self.assertEqual(len(self.store.activity()["drafts"]), 1)
        self.assertEqual(requests[1]["contents"][-1]["parts"][0]["functionResponse"]["name"], "draft_message")

    def test_no_fake_success_when_key_missing(self):
        with self.assertRaises(bridge.Unavailable):
            bridge.Assistant(self.store).chat("Hello")

    def telegram(self):
        calls = []
        def fake(url, payload):
            calls.append((url.rsplit("/", 1)[-1], payload))
            return {"ok": True, "result": {}}
        bot = bridge.Telegram("123456789:" + "x" * 30, 42, bridge.Assistant(self.store), request=fake)
        return bot, calls

    def update(self, identifier=1, user=42, chat=42, kind="private"):
        return {"update_id": identifier, "message": {"from": {"id": user, "is_bot": False}, "chat": {"id": chat, "type": kind}, "text": "/start"}}

    def test_telegram_rejects_unauthorized_user_and_group_without_reply(self):
        bot, calls = self.telegram()
        for update in [self.update(1, user=7), self.update(2, chat=-99, kind="group"), self.update(3, chat=7)]:
            self.assertFalse(bot.handle(update))
        self.assertEqual(calls, [])

    def test_telegram_replies_only_once_to_allowlisted_private_chat(self):
        bot, calls = self.telegram()
        self.assertTrue(bot.handle(self.update()))
        self.assertFalse(bot.handle(self.update()))
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0][0], "sendMessage")
        self.assertEqual(calls[0][1]["chat_id"], 42)

    def test_telegram_roots_prefix_and_natural_text_reach_assistant(self):
        bot, calls = self.telegram()
        seen = []
        bot.assistant.chat = lambda message, **kwargs: seen.append(message) or {"reply": "Local test reply"}
        for identifier, value in enumerate(("/roots Who is Maya?", "Who is Maya?", "/roots\nWho is Maya?"), 1):
            update = self.update(identifier)
            update["message"]["text"] = value
            self.assertTrue(bot.handle(update))
        self.assertEqual(seen, ["Who is Maya?"] * 3)
        self.assertEqual(len(calls), 3)

    def test_telegram_help_explains_roots_and_ignores_foreign_commands(self):
        bot, calls = self.telegram()
        def unexpected_chat(message):
            self.fail("Command must not reach Gemini")
        bot.assistant.chat = unexpected_chat
        for identifier, value in enumerate(("/roots", "/start", "/help"), 1):
            update = self.update(identifier)
            update["message"]["text"] = value
            self.assertTrue(bot.handle(update))
            self.assertIn("/roots", calls[-1][1]["text"])
            self.assertIn("unsent", calls[-1][1]["text"])
        for identifier, value in enumerate(("/status", "/slots", "/pause", "/resume", "/book", "/unknown argument"), 10):
            update = self.update(identifier)
            update["message"]["text"] = value
            self.assertFalse(bot.handle(update))
        self.assertEqual(len(calls), 3)

    def test_telegram_polling_conflict_stops_without_retry(self):
        for style in ("http", "api"):
            with self.subTest(style=style):
                calls = []
                def conflict(url, payload):
                    calls.append(url.rsplit("/", 1)[-1])
                    if style == "http":
                        raise bridge.ProviderConflict("Provider conflict (HTTP 409).")
                    return {"ok": False, "error_code": 409, "description": "not exposed"}
                bot = bridge.Telegram("123456789:" + "x" * 30, 42, bridge.Assistant(self.store), request=conflict)
                bot.run()
                self.assertEqual(calls, ["getUpdates"])
                self.assertFalse(bot.polling)
                self.assertEqual(bot.last_error_code, "TELEGRAM_POLLING_CONFLICT")
                activity = self.store.activity()["activity"][0]
                self.assertEqual(activity["code"], "TELEGRAM_POLLING_CONFLICT")
                self.assertNotIn("not exposed", json.dumps(activity))

    def test_existing_webhook_is_never_replaced(self):
        calls = []
        def fake(url, payload):
            calls.append(url.rsplit("/", 1)[-1])
            return {"ok": True, "result": {"url": "https://example.com/webhook"}}
        bot = bridge.Telegram("123456789:" + "x" * 30, 42, bridge.Assistant(self.store), request=fake)
        with self.assertRaises(bridge.Unavailable):
            bot.prepare()
        self.assertEqual(calls, ["getWebhookInfo"])

    def test_http_origin_host_size_and_configuration(self):
        server = bridge.make_server(self.store, bridge.Assistant(self.store), port=0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        base = f"http://127.0.0.1:{server.server_address[1]}"
        def request(path, method="GET", payload=None, headers=None):
            req = urllib.request.Request(base + path, method=method, data=json.dumps(payload).encode() if payload is not None else None, headers={"Content-Type": "application/json", **(headers or {})})
            try:
                with urllib.request.urlopen(req) as response:
                    return response.status, json.load(response)
            except urllib.error.HTTPError as error:
                with error:
                    return error.code, json.load(error)
        try:
            status, data = request("/api/status")
            self.assertEqual(status, 200)
            self.assertTrue(data["connected"])
            self.assertFalse(data["geminiConfigured"])
            self.assertNotIn("key", json.dumps(data).lower())
            bot, _ = self.telegram()
            bot.last_error_code = "TELEGRAM_POLLING_CONFLICT"
            server.telegram = bot
            status, data = request("/api/status")
            self.assertEqual(status, 200)
            self.assertFalse(data["polling"])
            self.assertEqual(data["telegramErrorCode"], "TELEGRAM_POLLING_CONFLICT")
            self.assertNotIn(bot.token, json.dumps(data))
            self.assertEqual(request("/api/state", headers={"Origin": "https://malicious.example"})[0], 403)
            self.assertEqual(request("/api/state", headers={"Host": "malicious.example"})[0], 403)
            self.assertEqual(request("/api/state", headers={"Sec-Fetch-Site": "cross-site"})[0], 403)
            self.assertEqual(request("/api/state", "PUT", {"state": self.state, "baseVersion": 0})[0], 409)
            self.assertEqual(request("/api/chat", "POST", {"message": "Hello"})[0], 503)
            self.assertEqual(request("/api/chat", "POST", {"message": "x" * (bridge.MAX_BODY + 1)})[0], 400)
            self.assertEqual(request("/api/chat", "POST", {"message": "Hi", "system": "override"})[0], 400)
        finally:
            server.shutdown()
            server.server_close()
            worker.join()

    def test_http_never_serves_env_database_or_symlink_outside_dist(self):
        original_root = bridge.ROOT
        isolated = Path(self.tmp.name) / "isolated-site"
        (isolated / "dist").mkdir(parents=True)
        (isolated / "server" / ".local").mkdir(parents=True)
        sentinel = "PRIVATE_TEST_CONTENT_ONLY"
        (isolated / "server" / ".env").write_text(sentinel)
        (isolated / "server" / ".local" / "roots.sqlite3").write_text(sentinel)
        (isolated / "dist" / "leak").symlink_to(isolated / "server" / ".env")
        bridge.ROOT = isolated
        server = bridge.make_server(self.store, bridge.Assistant(self.store), port=0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        base = f"http://127.0.0.1:{server.server_address[1]}"
        try:
            for path in ("/../server/.env", "/%2e%2e/server/.env", "/server/.env", "/../server/.local/roots.sqlite3", "/leak"):
                with self.subTest(path=path):
                    try:
                        with urllib.request.urlopen(base + path) as response:
                            self.fail(f"Private path unexpectedly returned {response.status}")
                    except urllib.error.HTTPError as error:
                        with error:
                            self.assertIn(error.code, (403, 404))
                            self.assertNotIn(sentinel, error.read().decode())
            request = urllib.request.Request(base + "/leak", method="HEAD")
            with self.assertRaises(urllib.error.HTTPError) as caught:
                urllib.request.urlopen(request)
            caught.exception.close()
        finally:
            server.shutdown()
            server.server_close()
            worker.join()
            bridge.ROOT = original_root

    def test_static_top_level_navigation_is_allowed_but_api_keeps_origin_checks(self):
        server = bridge.make_server(self.store, bridge.Assistant(self.store), port=0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        base = f"http://127.0.0.1:{server.server_address[1]}"
        headers = {"Origin": "http://127.0.0.1:4176", "Sec-Fetch-Site": "same-site", "Sec-Fetch-Mode": "navigate", "Sec-Fetch-Dest": "document"}
        try:
            with urllib.request.urlopen(urllib.request.Request(base + "/", headers=headers)) as response:
                self.assertEqual(response.status, 200)
                self.assertIn("text/html", response.headers["Content-Type"])
            for path, method, data in (("/api/state", "GET", None), ("/api/state", "PUT", json.dumps({"state": self.state}).encode()), ("/api/chat", "POST", b'{"message":"Hello"}')):
                with self.subTest(path=path, method=method):
                    request = urllib.request.Request(base + path, method=method, data=data, headers={**headers, "Content-Type": "application/json"})
                    try:
                        urllib.request.urlopen(request)
                        self.fail("Cross-origin API request was unexpectedly accepted")
                    except urllib.error.HTTPError as error:
                        with error:
                            self.assertEqual(error.code, 403)
            request = urllib.request.Request(base + "/", headers={**headers, "Host": "malicious.example"})
            try:
                urllib.request.urlopen(request)
                self.fail("A foreign Host was unexpectedly accepted")
            except urllib.error.HTTPError as error:
                with error:
                    self.assertEqual(error.code, 403)
        finally:
            server.shutdown()
            server.server_close()
            worker.join()

    def test_followup_keeps_recipient_and_prior_draft_context(self):
        requests = []
        def fake(url, payload, headers):
            requests.append(json.loads(json.dumps(payload)))
            last = payload["contents"][-1]["parts"][0]
            if "functionResponse" in last:
                return {"candidates": [{"content": {"parts": [{"text": "Your draft is ready."}]}}]}
            channel = "sms" if "SMS" in last["text"] else "email"
            if channel == "sms":
                previous = payload["contents"][-2]["parts"][0]["text"]
                self.assertIn('"personId": "p01"', previous)
                self.assertIn("Join us in the garden", previous)
            return {"candidates": [{"content": {"parts": [{"functionCall": {"name": "draft_message", "args": {"person_id": "p01", "channel": channel, "body": "Join us in the garden"}}}]}}]}
        assistant = bridge.Assistant(self.store, "fake-test-key", request=fake)
        first = assistant.chat("Draft an email to Maya", owner="web:session-one")
        second = assistant.chat("Turn that into an SMS", first["conversationId"], owner="web:session-one")
        self.assertEqual(first["conversationId"], second["conversationId"])
        self.assertEqual(second["drafts"][0]["personId"], "p01")
        self.assertEqual(second["drafts"][0]["channel"], "sms")
        self.assertEqual(second["actions"][0]["type"], "message_draft")
        self.assertEqual(len(requests[2]["contents"]), 3)

    def test_conversations_are_private_bounded_and_expire(self):
        requests = []
        def fake(url, payload, headers):
            requests.append(json.loads(json.dumps(payload["contents"])))
            return {"candidates": [{"content": {"parts": [{"text": "Test reply"}]}}]}
        assistant = bridge.Assistant(self.store, "fake-test-key", request=fake)
        result = assistant.chat("Private web question", owner="web:first")
        identifier = result["conversationId"]
        with self.assertRaises(bridge.ConversationUnavailable):
            assistant.chat("Read another person's history", identifier, owner="web:second")
        with self.assertRaises(bridge.ConversationUnavailable):
            assistant.chat("Read web history", identifier, owner="telegram:42")
        telegram = assistant.chat("Telegram question", owner="telegram:42", continue_latest=True)
        self.assertEqual(len(requests[-1]), 1)
        telegram_followup = assistant.chat("Telegram follow-up", owner="telegram:42", continue_latest=True)
        self.assertEqual(telegram["conversationId"], telegram_followup["conversationId"])
        self.assertNotIn("Private web question", json.dumps(requests[-1]))
        for index in range(8):
            assistant.chat(f"Follow-up {index}", identifier, owner="web:first")
        _, history = self.store.conversation("web:first", identifier)
        self.assertEqual(len(history), bridge.MAX_HISTORY_MESSAGES)
        self.assertNotIn("Private web question", json.dumps(history))
        with self.store.connect() as db:
            db.execute("UPDATE conversations SET updated=? WHERE id=?", ("2000-01-01T00:00:00+00:00", identifier))
        with self.assertRaises(bridge.ConversationUnavailable):
            assistant.chat("Expired follow-up", identifier, owner="web:first")

    def test_insights_are_evidence_based_and_prioritize_actionable_connections(self):
        self.state.update({
            "people": [
                {"id": "p01", "name": "Maya", "visits": 1, "interests": ["Community gardening", "Service hours"], "availability": "Saturday mornings", "consent": True},
                {"id": "p02", "name": "Daniel", "visits": 2, "interests": ["Service hours"], "availability": "Weekday afternoons", "consent": False},
                {"id": "p03", "name": "Priya", "visits": 1, "interests": ["Community gardening"], "availability": "Tuesday evenings", "consent": True},
            ],
            "events": [{"id": "e01", "title": "Saturday garden", "capacity": 18, "attendees": 12, "category": "Community gardening"}],
            "opportunities": [{"id": "o01", "title": "School service", "interests": ["Service hours"], "candidate": True}],
            "projects": [{"id": "project-1", "title": "Learning garden", "status": "Draft plan", "team": [{"personId": "p01"}, {"personId": "p02"}], "checks": ["Confirm interest"]}],
            "metadata": {"illustrative": True, "asOf": "2026-10-24"},
        })
        self.store.save(self.state)
        result = self.store.insights()
        self.assertEqual(result["source"], "snapshot-rules")
        self.assertTrue(result["illustrative"])
        self.assertEqual(result["asOf"], "2026-10-24")
        self.assertEqual([i["type"] for i in result["insights"][:3]], ["event_capacity", "service_hours_pathway", "project_team_coordination"])
        event = result["insights"][0]
        self.assertEqual(event["title"], "A garden invitation for 2 new volunteers.")
        self.assertEqual(event["summary"], "Maya and Priya share an interest in community gardening. Saturday garden has 6 open places.")
        self.assertEqual(event["sourceIds"]["people"], ["p01", "p03"])
        self.assertEqual(event["evidence"][-1]["label"], "What to confirm")
        self.assertIn("RSVP status", event["evidence"][-1]["value"])
        service = result["insights"][1]
        self.assertEqual(service["title"], "Service hours could give people a reason to return.")
        self.assertEqual(service["summary"], "2 people list service hours, including 1 who has visited once. A clearer pathway could help them choose their next step.")
        self.assertEqual(service["evidence"][0]["value"], 2)
        self.assertEqual(service["evidence"][1]["value"], 1)
        self.assertEqual(service["evidence"][-1]["label"], "What to confirm")
        self.assertIn("School approval", service["evidence"][-1]["value"])
        known = {record["id"] for key in ("people", "events", "opportunities", "projects") for record in self.state[key]}
        for insight in result["insights"]:
            self.assertTrue(set(sum(insight["sourceIds"].values(), [])).issubset(known))
            for fact in insight["evidence"]:
                self.assertTrue(set(fact["sourceIds"]).issubset(known))
        self.assertEqual(bridge.execute_tool(self.store, "get_insights", {})["checkedAt"], result["checkedAt"])

    def test_insights_cache_ignores_version_and_activity_but_refreshes_changed_evidence(self):
        first = self.store.insights()
        self.store.save({**self.state, "activity": [{"text": "Opened dashboard"}]})
        cached = self.store.insights()
        self.assertTrue(cached["cached"])
        self.assertEqual(cached["checkedAt"], first["checkedAt"])
        self.assertEqual(cached["snapshotVersion"], first["snapshotVersion"])
        reloaded_store = bridge.Store(self.store.path)
        self.assertTrue(reloaded_store.insights()["cached"])
        self.state["people"][0]["visits"] = 2
        self.store.save(self.state)
        changed = self.store.insights()
        self.assertFalse(changed["cached"])
        self.assertFalse(any(i["type"] == "people_followup" for i in changed["insights"]))
        with self.store.connect() as db:
            db.execute("UPDATE insights SET checked=?", ("2000-01-01T00:00:00+00:00",))
        self.assertFalse(self.store.insights()["cached"])
        self.assertFalse(self.store.insights(force=True)["cached"])

    def briefing_response(self, payload, **changes):
        catalog = json.loads(payload["contents"][0]["parts"][0]["text"])["catalog"]
        item = {"factIds": [catalog[0]["id"]], "title": "Explore a return invitation", "suggestion": "Consider a relevant invitation after checking interest and contact permission.", "priority": "medium", **changes}
        return {"candidates": [{"content": {"parts": [{"text": json.dumps({"insights": [item]})}]}}]}

    def test_briefing_is_independent_async_deduplicated_and_persisted(self):
        entered, release = threading.Event(), threading.Event()
        calls = []
        self.state["people"][0].update(email="private@example.test", phone="+15555550123", notes="PRIVATE_COORDINATOR_NOTE")
        self.store.save(self.state)
        def fake(url, payload, headers):
            calls.append(payload)
            entered.set()
            self.assertTrue(release.wait(3))
            return self.briefing_response(payload)
        service = bridge.Briefing(self.store, "fake-test-key", request=fake)
        self.addCleanup(service.close)
        try:
            pending = service.get()
            self.assertEqual(pending["generation"]["status"], "pending")
            self.assertEqual(pending["source"], "snapshot-rules")
            self.assertTrue(entered.wait(2))
            self.assertEqual(service.get()["generation"]["status"], "reviewing")
            workers = [threading.Thread(target=service.get) for _ in range(5)]
            for worker in workers:
                worker.start()
            for worker in workers:
                worker.join(2)
            self.assertEqual(len(calls), 1)
            sent = json.dumps(calls[0])
            for private in ("private@example.test", "+15555550123", "PRIVATE_COORDINATOR_NOTE"):
                self.assertNotIn(private, sent)
            self.assertEqual(calls[0]["generationConfig"]["responseMimeType"], "application/json")
        finally:
            release.set()
            service.worker.join(3)
        ready = service.get()
        self.assertEqual(ready["generation"]["status"], "ready")
        self.assertEqual(ready["source"], "gemini-synthesis")
        self.assertFalse(ready["stale"])
        self.assertEqual(ready["coverage"]["people"], 1)
        self.assertEqual(ready["insights"][0]["action"]["personIds"], ["p01"])
        self.store.save({**self.state, "activity": [{"text": "Opened dashboard"}]})
        cached = service.get()
        self.assertEqual(cached["checkedAt"], ready["checkedAt"])
        self.assertEqual(cached["snapshotVersion"], ready["snapshotVersion"])
        self.assertEqual(cached["currentSnapshotVersion"], 3)
        self.assertEqual(len(calls), 1)
        reloaded = bridge.Briefing(self.store, "fake-test-key", request=fake)
        self.addCleanup(reloaded.close)
        self.assertEqual(reloaded.get()["checkedAt"], ready["checkedAt"])
        self.assertEqual(len(calls), 1)

    def test_briefing_discards_outdated_job_and_reviews_latest_records(self):
        entered = [threading.Event(), threading.Event()]
        releases = [threading.Event(), threading.Event()]
        calls = []
        def fake(url, payload, headers):
            index = len(calls)
            calls.append(payload)
            entered[index].set()
            self.assertTrue(releases[index].wait(4))
            return self.briefing_response(payload)
        service = bridge.Briefing(self.store, "fake-test-key", request=fake)
        self.addCleanup(service.close)
        try:
            service.get()
            self.assertTrue(entered[0].wait(2))
            self.state["people"][0]["visits"] = 2
            self.store.save(self.state)
            service.get()
            self.assertEqual(len(calls), 1)
            releases[0].set()
            self.assertTrue(entered[1].wait(2))
            with self.store.connect() as db:
                self.assertIsNone(db.execute("SELECT data FROM briefings").fetchone())
            self.assertEqual(service.get()["generation"]["snapshotVersion"], 2)
        finally:
            for release in releases:
                release.set()
            if service.worker:
                service.worker.join(3)
        result = service.get()
        self.assertEqual(result["snapshotVersion"], 2)
        self.assertEqual(result["generation"]["status"], "ready")
        self.assertFalse(result["stale"])
        self.assertEqual(len(calls), 2)

    def test_failed_briefing_keeps_last_result_without_automatic_retry(self):
        calls = []
        def fake(url, payload, headers):
            calls.append(payload)
            return self.briefing_response(payload) if len(calls) == 1 else self.briefing_response(payload, factIds=["invented-record"])
        service = bridge.Briefing(self.store, "fake-test-key", request=fake)
        self.addCleanup(service.close)
        service.get()
        service.worker.join(3)
        previous = service.get()
        self.state["people"][0]["visits"] = 2
        self.store.save(self.state)
        pending = service.get()
        self.assertEqual(pending["checkedAt"], previous["checkedAt"])
        self.assertTrue(pending["stale"])
        service.worker.join(3)
        for _ in range(4):
            failed = service.get()
            self.assertEqual(failed["generation"]["status"], "failed")
        self.assertEqual(failed["generation"]["errorCode"], "BRIEFING_VALIDATION_FAILED")
        self.assertEqual(failed["insights"], previous["insights"])
        self.assertEqual(len(calls), 2)
        service.get(force=True)
        self.assertEqual(len(calls), 2)
        with self.store.connect() as db:
            generation = json.loads(db.execute("SELECT data FROM briefing_generation WHERE id=1").fetchone()[0])
            generation["manualRetryAt"] = "2000-01-01T00:00:00+00:00"
            db.execute("UPDATE briefing_generation SET data=? WHERE id=1", (json.dumps(generation),))
        service.get(force=True)
        service.worker.join(3)
        self.assertEqual(len(calls), 3)

    def test_briefing_rejects_unverified_claim_fields_and_quantities(self):
        catalog = bridge.insight_catalog(self.state)
        item = {"factIds": [catalog[0]["id"]], "title": "Explore a return invitation", "suggestion": "Consider asking about the next suitable activity.", "priority": "medium"}
        for changed in ({"factIds": ["missing"]}, {"title": "Invite 99 people"}, {"suggestion": "Invite twenty volunteers."}, {"sourceIds": {"people": ["p99"]}}, {"suggestion": "x" * 181}, {"suggestion": "Ask about interest. Then invite everyone."}, {"priority": "critical"}):
            with self.subTest(changed=changed), self.assertRaises(bridge.Invalid):
                bridge.validate_briefing({"insights": [{**item, **changed}]}, catalog)
        with self.assertRaises(bridge.Invalid):
            bridge.validate_briefing({"insights": [item, item]}, catalog)
        checked = bridge.validate_briefing({"insights": [item]}, catalog)[0]
        self.assertEqual(checked["sourceIds"], catalog[0]["sourceIds"])
        self.assertEqual(checked["summary"], catalog[0]["summary"])
        self.assertEqual(checked["evidence"][0]["value"], 1)

    def test_empty_current_catalog_hides_obsolete_briefing_actions(self):
        calls = []
        def fake(url, payload, headers):
            calls.append(payload)
            return self.briefing_response(payload)
        service = bridge.Briefing(self.store, "fake-test-key", request=fake)
        self.addCleanup(service.close)
        service.get()
        service.worker.join(3)
        self.assertTrue(service.get()["insights"])
        self.store.save({"people": [], "events": [], "opportunities": [], "projects": []})
        empty = service.get()
        self.assertEqual(empty["insights"], [])
        self.assertEqual(empty["generation"]["reason"], "NO_REVIEWABLE_FACTS")
        self.assertEqual(empty["source"], "snapshot-rules")
        self.assertFalse(empty["stale"])
        self.assertEqual(len(calls), 1)

    def test_briefing_restart_and_missing_key_do_not_simulate_review(self):
        generation = {"status": "reviewing", "jobId": "interrupted", "fingerprint": bridge.insight_fingerprint(self.state), "snapshotVersion": 1}
        with self.store.connect() as db:
            db.execute("INSERT INTO briefing_generation VALUES(1,?)", (json.dumps(generation),))
        def no_request(*args):
            self.fail("An interrupted review must not automatically retry.")
        service = bridge.Briefing(self.store, "fake-test-key", request=no_request)
        self.addCleanup(service.close)
        result = service.get()
        self.assertEqual(result["generation"]["status"], "failed")
        self.assertEqual(result["generation"]["errorCode"], "REVIEW_INTERRUPTED")
        self.assertEqual(result["source"], "snapshot-rules")
        unconfigured = bridge.Briefing(self.store, request=no_request)
        self.addCleanup(unconfigured.close)
        missing = unconfigured.get()
        self.assertEqual(missing["generation"]["errorCode"], "GEMINI_NOT_CONFIGURED")
        self.assertIsNone(missing["generation"]["startedAt"])

    def test_draft_readiness_and_safe_edit_preserve_action_identity(self):
        draft = bridge.execute_tool(self.store, "draft_message", {"person_id": "p01", "channel": "sms", "body": "Original"})["draft"]
        self.assertEqual(draft["recipient"], "Maya Chen")
        self.assertIsNone(draft["phone"])
        self.assertTrue(draft["consent"]["recorded"])
        self.assertFalse(draft["readiness"]["canSend"])
        self.assertEqual({b["code"] for b in draft["readiness"]["blockers"]}, {"PHONE_MISSING", "DELIVERY_NOT_CONNECTED"})
        updated = self.store.edit_draft(draft["id"], {"body": "Edited invitation", "subject": ""})
        for field in ("id", "personId", "channel", "sent", "status"):
            self.assertEqual(updated[field], draft[field])
        self.assertEqual(updated["body"], "Edited invitation")
        for values in ({"body": "bad", "channel": "email"}, {"body": ""}, {"body": "x" * 4001}, {"body": "bad", "sent": True}):
            with self.assertRaises(bridge.Invalid):
                self.store.edit_draft(draft["id"], values)
        self.state["people"][0].update(phone="+15555550123", smsConsentRecorded=False)
        self.store.save(self.state)
        refreshed = self.store.activity()["drafts"][0]
        self.assertEqual(refreshed["phone"], "+15555550123")
        self.assertFalse(refreshed["consent"]["recorded"])
        self.assertEqual({b["code"] for b in refreshed["readiness"]["blockers"]}, {"CONSENT_NOT_RECORDED", "DELIVERY_NOT_CONNECTED"})
        with self.store.connect() as db:
            db.execute("UPDATE drafts SET data=? WHERE id=?", (json.dumps({**updated, "sent": True, "status": "sent"}), draft["id"]))
        with self.assertRaises(bridge.Conflict):
            self.store.edit_draft(draft["id"], {"body": "Cannot change sent message"})

    def test_http_conversation_cookie_insights_and_draft_edit_contract(self):
        def fake(url, payload, headers):
            if payload.get("generationConfig", {}).get("responseMimeType") == "application/json":
                return self.briefing_response(payload)
            return {"candidates": [{"content": {"parts": [{"text": "Test reply"}]}}]}
        server = bridge.make_server(self.store, bridge.Assistant(self.store, "fake-test-key", request=fake), port=0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        base = f"http://127.0.0.1:{server.server_address[1]}"
        jar = http.cookiejar.CookieJar()
        client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
        def request(path, payload=None, opener=client):
            req = urllib.request.Request(base + path, data=json.dumps(payload).encode() if payload is not None else None, headers={"Content-Type": "application/json"})
            try:
                with opener.open(req) as response:
                    return response.status, json.load(response), response.headers
            except urllib.error.HTTPError as error:
                with error:
                    return error.code, json.load(error), error.headers
        try:
            status, first, headers = request("/api/chat", {"message": "Who is Maya?"})
            self.assertEqual(status, 200)
            self.assertIn("HttpOnly", headers["Set-Cookie"])
            self.assertIn("SameSite=Strict", headers["Set-Cookie"])
            status, second, _ = request("/api/chat", {"message": "Follow up", "conversationId": first["conversationId"]})
            self.assertEqual(status, 200)
            self.assertEqual(first["conversationId"], second["conversationId"])
            other = urllib.request.build_opener()
            status, denied, _ = request("/api/chat", {"message": "Read another session", "conversationId": first["conversationId"]}, other)
            self.assertEqual(status, 403)
            self.assertEqual(denied["code"], "CONVERSATION_UNAVAILABLE")
            self.assertEqual(request("/api/insights")[1]["source"], "snapshot-rules")
            self.assertIn(request("/api/insights/refresh", {})[1]["generation"]["status"], ("pending", "reviewing", "ready"))
            draft = bridge.execute_tool(self.store, "draft_message", {"person_id": "p01", "channel": "sms", "body": "Before"})["draft"]
            status, result, _ = request(f"/api/drafts/{draft['id']}/edit", {"body": "After"})
            self.assertEqual(status, 200)
            self.assertEqual(result["draft"]["body"], "After")
            self.assertFalse(result["draft"]["sent"])
        finally:
            server.shutdown()
            server.server_close()
            worker.join()


if __name__ == "__main__":
    unittest.main()
