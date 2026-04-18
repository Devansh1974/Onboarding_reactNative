"""
WingMann Backend Tests — Interview Scheduling + Admin APIs
Tests are executed against the Node.js/Express backend running on port 8001 via supervisor.
"""
import json
import sys
import requests

BASE_URL = "http://localhost:8001/api"
PHONE = "9876543210"
USER_NAME = "Test User"
USER_EMAIL = "test@example.com"
BOOK_DATE = "2025-07-15"
BOOK_TIME = "3:00 PM"
RESCHEDULE_DATE = "2025-07-20"
RESCHEDULE_TIME = "6:00 PM"
RESCHEDULE_REASON = "Schedule conflict"
MEETING_LINK = "https://meet.google.com/abc-defg-hij"
ADMIN_EMAIL = "admin@wingmann.com"
ADMIN_PASS = "admin123"

results = []  # list of (step, status_code, passed, detail)


def log(step, code, passed, detail=""):
    results.append((step, code, passed, detail))
    marker = "PASS" if passed else "FAIL"
    print(f"[{marker}] Step {step}  HTTP {code}  {detail}")


def pretty(obj, limit=500):
    try:
        s = json.dumps(obj, default=str)
    except Exception:
        s = str(obj)
    return s if len(s) <= limit else s[:limit] + "...(truncated)"


def do(method, path, json_body=None, expected_codes=(200,)):
    url = f"{BASE_URL}{path}"
    r = requests.request(method, url, json=json_body, timeout=30)
    try:
        body = r.json()
    except Exception:
        body = {"_raw": r.text[:500]}
    return r.status_code, body


def main():
    global_session_id = None

    # ================= Step 1: Cleanup =================
    try:
        code, body = do("POST", "/sessions/cancel", {"phoneNumber": PHONE, "reason": "pre-test cleanup"})
        # Acceptable: 200 (had active session) or 404 (no scheduled session)
        ok = code in (200, 404)
        log("1 Cleanup (pre)", code, ok, f"msg={body.get('message')}")
    except Exception as e:
        log("1 Cleanup (pre)", 0, False, f"exception: {e}")
        return

    # Also cover case where a previous test left the session in 'rescheduled' state,
    # which the cancel endpoint does NOT clear (it only operates on 'scheduled').
    # Force-clean by a direct second cancel call isn't possible, but 'book' endpoint's
    # duplicate check uses {scheduled, not_scheduled}, so rescheduled won't block booking.
    # However, slot availability query filters by scheduled/completed. So rescheduled
    # leftover sessions will not collide here.

    # ================= Step 2: Get slots =================
    code, body = do("GET", f"/sessions/slots/{BOOK_DATE}")
    slots = body.get("slots", [])
    has_11 = len(slots) == 11
    all_keys = all(("time" in s and "available" in s) for s in slots)
    three_pm_slot = next((s for s in slots if s.get("time") == BOOK_TIME), None)
    three_pm_available = three_pm_slot is not None and three_pm_slot.get("available") is True
    ok = code == 200 and body.get("success") is True and has_11 and all_keys and three_pm_available
    log("2 GET slots/2025-07-15", code,
        ok,
        f"success={body.get('success')} count={len(slots)} 3PM.available={three_pm_slot and three_pm_slot.get('available')}")

    # ================= Step 3: Book session =================
    code, body = do("POST", "/sessions/book", {
        "phoneNumber": PHONE,
        "userName": USER_NAME,
        "userEmail": USER_EMAIL,
        "scheduledDate": BOOK_DATE,
        "scheduledTime": BOOK_TIME,
    })
    sess = body.get("session") or {}
    global_session_id = sess.get("_id")
    ok = (code == 200 and body.get("success") is True and sess.get("status") == "scheduled"
          and global_session_id is not None)
    log("3 POST sessions/book", code, ok,
        f"success={body.get('success')} status={sess.get('status')} id={global_session_id}")

    if not global_session_id:
        print("Cannot continue without session id")
        summary(results)
        return

    # ================= Step 4: Verify slot booked =================
    code, body = do("GET", f"/sessions/slots/{BOOK_DATE}")
    slots = body.get("slots", [])
    three_pm_slot = next((s for s in slots if s.get("time") == BOOK_TIME), None)
    ok = (code == 200 and body.get("success") is True
          and three_pm_slot is not None and three_pm_slot.get("available") is False)
    log("4 Verify 3:00 PM booked", code, ok,
        f"3PM.available={three_pm_slot and three_pm_slot.get('available')}")

    # ================= Step 5: Fetch user session status =================
    code, body = do("GET", f"/sessions/user/{PHONE}")
    sess = body.get("session") or {}
    ok = (code == 200 and body.get("success") is True and body.get("status") == "scheduled"
          and sess.get("scheduledDate") == BOOK_DATE and sess.get("scheduledTime") == BOOK_TIME)
    log("5 GET sessions/user/{phone}", code, ok,
        f"status={body.get('status')} date={sess.get('scheduledDate')} time={sess.get('scheduledTime')}")

    # ================= Step 6: Duplicate booking prevention =================
    code, body = do("POST", "/sessions/book", {
        "phoneNumber": PHONE,
        "userName": USER_NAME,
        "userEmail": USER_EMAIL,
        "scheduledDate": BOOK_DATE,
        "scheduledTime": BOOK_TIME,
    })
    ok = (code == 400 and body.get("success") is False
          and "already" in str(body.get("message", "")).lower())
    log("6 Duplicate book prevention", code, ok,
        f"success={body.get('success')} msg={body.get('message')}")

    # ================= Step 7: Reschedule =================
    code, body = do("POST", "/sessions/reschedule", {
        "phoneNumber": PHONE,
        "newDate": RESCHEDULE_DATE,
        "newTime": RESCHEDULE_TIME,
        "reason": RESCHEDULE_REASON,
    })
    sess = body.get("session") or {}
    prev = sess.get("previousSessions") or []
    prev0 = prev[0] if prev else {}
    ok = (code == 200 and body.get("success") is True
          and sess.get("status") == "rescheduled"
          and sess.get("rescheduleCount") == 1
          and prev0.get("date") == BOOK_DATE
          and prev0.get("time") == BOOK_TIME
          and prev0.get("reason") == RESCHEDULE_REASON)
    log("7 POST sessions/reschedule", code, ok,
        f"status={sess.get('status')} count={sess.get('rescheduleCount')} prev0={pretty(prev0, 200)}")

    # ================= Step 8: Verify after reschedule =================
    code, body = do("GET", f"/sessions/user/{PHONE}")
    sess = body.get("session") or {}
    ok = (code == 200 and body.get("success") is True
          and sess.get("scheduledDate") == RESCHEDULE_DATE
          and sess.get("scheduledTime") == RESCHEDULE_TIME
          and body.get("status") == "rescheduled")
    log("8 GET sessions/user after reschedule", code, ok,
        f"date={sess.get('scheduledDate')} time={sess.get('scheduledTime')} status={body.get('status')}")

    # ================= Step 9: Admin login (2x) =================
    code, body = do("POST", "/admin/login", {"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    ok1 = code == 200 and body.get("success") is True
    log("9a POST admin/login (first)", code, ok1,
        f"success={body.get('success')} name={(body.get('admin') or {}).get('name')}")

    code, body = do("POST", "/admin/login", {"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    ok2 = code == 200 and body.get("success") is True
    log("9b POST admin/login (idempotent)", code, ok2,
        f"success={body.get('success')}")

    # ================= Step 10: Admin login wrong password =================
    code, body = do("POST", "/admin/login", {"email": ADMIN_EMAIL, "password": "wrongpass"})
    ok = code == 401 and body.get("success") is False
    log("10 Admin login wrong password", code, ok,
        f"success={body.get('success')} msg={body.get('message')}")

    # ================= Step 11: Admin list sessions =================
    code, body = do("GET", "/admin/sessions")
    sessions_list = body.get("sessions") or []
    found = any(str(s.get("_id")) == str(global_session_id) for s in sessions_list)
    ok = code == 200 and body.get("success") is True and found
    log("11 GET admin/sessions", code, ok,
        f"success={body.get('success')} count={len(sessions_list)} found_test_session={found}")

    # ================= Step 12: Admin stats =================
    code, body = do("GET", "/admin/stats")
    stats = body.get("stats") or {}
    required_keys = ["totalSessions", "scheduled", "completed", "underReview",
                     "approved", "rejected", "totalInterviewers"]
    all_present = all(k in stats for k in required_keys)
    all_numeric = all(isinstance(stats.get(k), (int, float)) for k in required_keys)
    ok = code == 200 and body.get("success") is True and all_present and all_numeric
    log("12 GET admin/stats", code, ok,
        f"success={body.get('success')} stats={pretty(stats, 300)}")

    # ================= Step 13: Attach meeting link =================
    code, body = do("POST", f"/admin/sessions/{global_session_id}/meeting-link",
                    {"meetingLink": MEETING_LINK})
    sess = body.get("session") or {}
    ok = code == 200 and body.get("success") is True and sess.get("meetingLink") == MEETING_LINK
    log("13 POST admin/sessions/{id}/meeting-link", code, ok,
        f"success={body.get('success')} savedLink={sess.get('meetingLink')}")

    # ================= Step 14: Verify user sees meeting link =================
    code, body = do("GET", f"/sessions/user/{PHONE}")
    sess = body.get("session") or {}
    ok = code == 200 and sess.get("meetingLink") == MEETING_LINK
    log("14 User sees meeting link", code, ok,
        f"meetingLink={sess.get('meetingLink')}")

    # ================= Step 15: Admin review approve =================
    code, body = do("POST", f"/admin/sessions/{global_session_id}/review",
                    {"reviewStatus": "approved", "reviewNotes": "Great fit!"})
    sess = body.get("session") or {}
    ok = code == 200 and body.get("success") is True and sess.get("reviewStatus") == "approved"
    log("15 POST admin/sessions/{id}/review approve", code, ok,
        f"success={body.get('success')} reviewStatus={sess.get('reviewStatus')} reviewNotes={sess.get('reviewNotes')}")

    # ================= Step 16: Post-test cleanup (best-effort) =================
    code, body = do("POST", "/sessions/cancel", {"phoneNumber": PHONE, "reason": "test cleanup"})
    # 200 OR 404 acceptable per spec (session status is 'rescheduled' not 'scheduled')
    ok = code in (200, 404)
    log("16 Cleanup (post)", code, ok, f"msg={body.get('message')} (404 expected per test spec)")

    summary(results)


def summary(results):
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    fails = [r for r in results if not r[2]]
    passes = [r for r in results if r[2]]
    print(f"Passed: {len(passes)}/{len(results)}")
    if fails:
        print("\nFAILURES:")
        for step, code, _, detail in fails:
            print(f"  - {step}  HTTP {code}  {detail}")
    else:
        print("All steps passed.")
    # Return a proper exit code so CI can capture it
    sys.exit(0 if not fails else 1)


if __name__ == "__main__":
    main()
