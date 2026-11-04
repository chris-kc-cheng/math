import uuid

import pytest
from sqlalchemy import func, select

from app.models import Account, DeletedLearner, Learner, Result, ResultItem
from conftest import Client, build_app, learner_body, now_ms, result_body


def count(app, model):
    with app.state.sessions() as s:
        return s.scalar(select(func.count()).select_from(model))


# ---------- learners ----------

def test_create_list_and_update_learner(alice):
    lid = alice.new_learner("Chloe")
    listing = alice.get("/api/v1/me/learners").json()
    assert [(x["id"], x["name"], x["avatar"], x["result_count"]) for x in listing["learners"]] == [(lid, "Chloe", "🦊", 0)]
    later = alice.put(f"/api/v1/learners/{lid}", learner_body("Chloe M", "🐸", now_ms() + 1000))
    assert later.json()["applied"] and later.json()["name"] == "Chloe M"


def test_last_write_wins_by_updated_at(alice):
    lid = alice.new_learner("Chloe")
    newer = alice.put(f"/api/v1/learners/{lid}", learner_body("Newer", "🐸", now_ms() + 5000)).json()
    older = alice.put(f"/api/v1/learners/{lid}", learner_body("Older", "🐱", now_ms() - 5000)).json()
    assert newer["applied"] is True
    assert older["applied"] is False and older["name"] == "Newer"  # the stale write did not overwrite


def test_put_is_idempotent(alice, app):
    lid = alice.new_learner()
    body = learner_body("Chloe")
    for _ in range(3):
        assert alice.put(f"/api/v1/learners/{lid}", body).status_code == 200
    assert count(app, Learner) == 1


def test_same_name_on_another_id_conflicts_and_returns_existing(alice):
    first = alice.new_learner("Chloe")
    response = alice.put(f"/api/v1/learners/{uuid.uuid4()}", learner_body(" chloe "))
    assert response.status_code == 409 and response.json()["learner"]["id"] == first


@pytest.mark.parametrize("body", [
    {"name": "", "updated_at": 1},
    {"name": "x" * 41, "updated_at": now_ms()},
    {"name": "bad\x00name", "updated_at": now_ms()},
    {"name": "Ok", "updated_at": now_ms() + 3_600_000},              # an hour in the future
    {"name": "Ok", "updated_at": now_ms(), "extra": 1},               # unknown field
    {"name": "Ok", "avatar": "a" * 20, "updated_at": now_ms()},
    {"name": "Ok", "avatar": "A", "updated_at": now_ms()},            # not an emoji
])
def test_learner_validation(alice, body):
    assert alice.put(f"/api/v1/learners/{uuid.uuid4()}", body).status_code == 422


def test_ids_must_be_uuids(alice):
    assert alice.put("/api/v1/learners/not-a-uuid", learner_body()).status_code == 422
    assert alice.delete("/api/v1/learners/not-a-uuid").status_code == 404


def test_profile_limit(settings):
    from dataclasses import replace
    client = Client(build_app(replace(settings, max_learners=2)), "user-a")
    client.new_learner("One")
    client.new_learner("Two")
    assert client.put(f"/api/v1/learners/{uuid.uuid4()}", learner_body("Three")).status_code == 409


# ---------- results ----------

def post(client, *results):
    response = client.post("/api/v1/results", {"results": list(results)})
    assert response.status_code == 200, response.text
    return response.json()["results"]


def test_results_are_saved_and_listed(alice):
    lid = alice.new_learner()
    res = result_body(lid)
    assert post(alice, res) == [{"id": res["id"], "status": "created"}]
    page = alice.get(f"/api/v1/learners/{lid}/results").json()
    assert [r["id"] for r in page["results"]] == [res["id"]]
    assert page["results"][0]["items"][0] == {"template_id": "g4-b2-0", "correct": True, "attempts": 1, "time_ms": None}
    assert page["has_more"] is False
    assert alice.get("/api/v1/me/learners").json()["learners"][0]["result_count"] == 1


def test_pushing_twice_creates_no_duplicates_and_keeps_first_write(alice, app):
    lid = alice.new_learner()
    res = result_body(lid)
    assert post(alice, res)[0]["status"] == "created"
    changed = {**res, "correct": 3, "items": [{**i, "correct": True} for i in res["items"]]}  # a later, different payload
    assert post(alice, res, changed)[0]["status"] == "duplicate"
    assert count(app, Result) == 1
    assert alice.get(f"/api/v1/learners/{lid}/results").json()["results"][0]["correct"] == 2  # results are immutable


def test_batch_reports_each_result_separately(alice):
    lid = alice.new_learner()
    good = result_body(lid)
    bad = {**result_body(lid), "correct": 1}  # the items say 2 correct
    unknown = result_body(str(uuid.uuid4()))
    out = post(alice, good, bad, unknown)
    assert [o["status"] for o in out] == ["created", "rejected", "unknown_learner"]
    assert "correct" in out[1]["reason"]


@pytest.mark.parametrize("change", [
    {"grade": 0}, {"grade": 11}, {"questions": 0}, {"questions": 51}, {"difficulty": "extreme"},
    {"topics": ["x" * 41]}, {"topics": [f"t{i}" for i in range(21)]}, {"time_spent_ms": -1},
    {"time_spent_ms": 86_400_001}, {"id": "nope"}, {"started_at": 5},
    {"finished_at": now_ms() + 3_600_000},                               # far in the future
    {"extra": "free text"},
    {"items": []},
    {"items": [{"template_id": "has space", "correct": True}]},
    {"items": [{"template_id": "ok", "correct": True, "answer": "free text"}]},
])
def test_result_validation_rejects(alice, change):
    lid = alice.new_learner()
    out = post(alice, result_body(lid, **change))
    assert out[0]["status"] == "rejected", change


def test_finished_before_started_is_rejected(alice):
    lid = alice.new_learner()
    started = now_ms() - 1000
    assert post(alice, result_body(lid, started_at=started, finished_at=started - 10))[0]["status"] == "rejected"


def test_batch_size_is_bounded(alice):
    lid = alice.new_learner()
    assert alice.post("/api/v1/results", {"results": [result_body(lid) for _ in range(51)]}).status_code == 422
    assert alice.post("/api/v1/results", {"results": []}).status_code == 422


def test_pull_with_cursor(alice):
    lid = alice.new_learner()
    ids = [result_body(lid)["id"] for _ in range(3)]
    post(alice, *[result_body(lid, rid=i) for i in ids])
    first = alice.get(f"/api/v1/learners/{lid}/results?limit=2").json()
    assert len(first["results"]) == 2 and first["has_more"] is True
    rest = alice.get(f"/api/v1/learners/{lid}/results?since={first['next']}").json()
    assert [r["id"] for r in first["results"] + rest["results"]] == ids and not rest["has_more"]


def test_storage_limit(settings):
    from dataclasses import replace
    client = Client(build_app(replace(settings, max_results=1)), "user-a")
    lid = client.new_learner()
    out = post(client, result_body(lid), result_body(lid))
    assert [o["status"] for o in out] == ["created", "rejected"]


# ---------- isolation between accounts (IDOR) ----------

def test_accounts_never_see_each_others_data(alice, bob):
    lid = alice.new_learner("Chloe")
    res = result_body(lid)
    post(alice, res)
    assert bob.get("/api/v1/me/learners").json()["learners"] == []
    assert bob.get(f"/api/v1/learners/{lid}/results").status_code == 404
    assert res["id"] not in str(bob.get("/api/v1/export").json())


def test_other_account_cannot_write_overwrite_or_delete(alice, bob, app):
    lid = alice.new_learner("Chloe")
    res = result_body(lid)
    post(alice, res)
    # Overwrite the profile through its id: looks like a missing profile, changes nothing.
    assert bob.put(f"/api/v1/learners/{lid}", learner_body("Hacked", "🐸", now_ms() + 9999)).status_code == 404
    assert bob.delete(f"/api/v1/learners/{lid}").status_code == 404
    # Push a result into Alice's profile: unknown learner.
    assert post(bob, result_body(lid))[0]["status"] == "unknown_learner"
    # Re-send Alice's result id under Bob's own profile: refused, Alice's copy is untouched.
    bl = bob.new_learner("Other")
    assert post(bob, result_body(bl, rid=res["id"]))[0] == {"id": res["id"], "status": "rejected", "reason": "id already used"}
    still = alice.get(f"/api/v1/learners/{lid}/results").json()["results"]
    assert len(still) == 1 and still[0]["learner_id"] == lid
    assert alice.get("/api/v1/me/learners").json()["learners"][0]["name"] == "Chloe"
    assert count(app, Result) == 1


def test_same_names_in_two_accounts_are_independent(alice, bob):
    a, b = alice.new_learner("Sam"), bob.new_learner("Sam")
    assert a != b
    post(alice, result_body(a))
    assert alice.get("/api/v1/me/learners").json()["learners"][0]["result_count"] == 1
    assert bob.get("/api/v1/me/learners").json()["learners"][0]["result_count"] == 0


def test_delete_of_a_tombstone_id_of_another_account_does_not_leak(alice, bob):
    lid = alice.new_learner()
    assert alice.delete(f"/api/v1/learners/{lid}").status_code == 204
    assert bob.delete(f"/api/v1/learners/{lid}").status_code == 404   # Bob cannot tell it ever existed
    assert bob.put(f"/api/v1/learners/{lid}", learner_body("Bob kid")).status_code == 200  # an unrelated id is free for Bob


# ---------- deletion and export ----------

def test_delete_profile_removes_all_results_and_blocks_resurrection(alice, app):
    lid = alice.new_learner()
    other = alice.new_learner("Sibling")
    post(alice, result_body(lid), result_body(lid), result_body(other))
    assert count(app, ResultItem) == 9
    assert alice.delete(f"/api/v1/learners/{lid}").status_code == 204
    assert (count(app, Learner), count(app, Result), count(app, ResultItem)) == (1, 1, 3)  # the sibling is untouched
    assert alice.delete(f"/api/v1/learners/{lid}").status_code == 204                      # idempotent
    assert alice.put(f"/api/v1/learners/{lid}", learner_body()).status_code == 410           # another device cannot re-create it
    assert post(alice, result_body(lid))[0]["status"] == "gone"
    assert alice.get("/api/v1/me/learners").json()["deleted"] == [lid]
    assert count(app, DeletedLearner) == 1


def test_export_contains_only_own_data(alice, bob):
    lid = alice.new_learner("Chloe")
    res = result_body(lid)
    post(alice, res)
    bob.new_learner("Bob")
    data = alice.get("/api/v1/export")
    assert "attachment" in data.headers["content-disposition"]
    body = data.json()
    assert body["format"] == "whack-a-math-export-1"
    assert [(l["name"], len(l["results"])) for l in body["learners"]] == [("Chloe", 1)]
    assert body["learners"][0]["results"][0]["id"] == res["id"]


def test_delete_account_data(alice, bob, app):
    lid = alice.new_learner()
    post(alice, result_body(lid))
    keep = bob.new_learner("Bob")
    post(bob, result_body(keep))
    assert alice.delete("/api/v1/me").status_code == 204
    with app.state.sessions() as s:
        assert s.get(Account, "user-a") is None and s.get(Account, "user-b") is not None
    assert (count(app, Learner), count(app, Result), count(app, ResultItem)) == (1, 1, 3)
    assert alice.get("/api/v1/me/learners").json()["learners"] == []  # a new empty area on the next request


def test_nothing_identifying_is_stored(app, alice):
    """The result tables hold ids, counts and timestamps only: no IP, user agent or free text columns."""
    columns = {c.name for t in (Result.__table__, ResultItem.__table__, Learner.__table__) for c in t.columns}
    assert not columns & {"ip", "user_agent", "device", "email", "answer", "entry", "text"}


# ---------- rate limit ----------

def test_writes_are_rate_limited_per_account(settings):
    from dataclasses import replace
    limited = build_app(replace(settings, write_limit=3))
    a, b = Client(limited, "user-a"), Client(limited, "user-b")
    lid = a.new_learner()
    statuses = [a.put(f"/api/v1/learners/{lid}", learner_body()).status_code for _ in range(4)]
    assert statuses[:2] == [200, 200] and statuses[-1] == 429
    assert a.put(f"/api/v1/learners/{lid}", learner_body()).headers["retry-after"]
    assert a.get("/api/v1/me/learners").status_code == 200   # reads are not limited
    assert b.new_learner("Bob")                                # another account has its own allowance
