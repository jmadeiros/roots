"""Local-only verification. Provider responses are fakes; these are not live API tests."""
import importlib.util
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
        bot.assistant.chat = lambda message: seen.append(message) or {"reply": "Local test reply"}
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


if __name__ == "__main__":
    unittest.main()
