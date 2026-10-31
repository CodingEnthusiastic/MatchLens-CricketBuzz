from fastapi.testclient import TestClient

from app.main import app


def test_historical_replay_journey():
    client = TestClient(app)
    match = client.get("/api/matches").json()[0]
    match_id = match["match_id"]
    advanced = client.post(f"/api/matches/{match_id}/replay/advance", json={"from_index": 0, "steps": 3}).json()
    state = client.get(f"/api/matches/{match_id}/state", params={"ball_index": advanced["ball_index"]}).json()
    response = client.post("/api/chat", json={"match_id": match_id, "question": "What is the current score?", "ball_index": state["ball_index"]}).json()
    assert response["source"] == "backend"
    assert response["computed_facts"]


def test_real_cricsheet_matches_are_available_when_ingested():
    client = TestClient(app)
    matches = client.get("/api/matches").json()
    real_matches = [item for item in matches if not item["is_demo"]]
    assert len(real_matches) >= 2
    state = client.get(f"/api/matches/{real_matches[0]['match_id']}/state", params={"ball_index": 10})
    assert state.status_code == 200
    assert state.json()["overs"].count(".") == 1
