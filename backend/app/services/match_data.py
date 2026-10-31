import json
from pathlib import Path

from app.models import Match, TeamInfo
from app.services.cricket import ReplayData
from app.services.sample_data import demo_matches


class MatchRepository:
    def __init__(self, data_dir: Path):
        self._data = {match.match_id: match for match in demo_matches()}
        self._metadata = {
            "demo-t20-northern-coastal": Match(
                match_id="demo-t20-northern-coastal", tournament="MatchLens Demo T20 Cup",
                match_number="Match 14 of 24", teams=(TeamInfo(name="Northern Strikers", code="NS"), TeamInfo(name="Coastal Kings", code="CK")),
                venue="Harbour Oval, Demo City", match_date="2026-10-18",
            )
        }
        self._load_cricsheet(data_dir)

    def _load_cricsheet(self, data_dir: Path) -> None:
        if not data_dir.exists():
            return
        for path in data_dir.glob("*.json"):
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
                parsed = parse_cricsheet(payload, path.stem)
                self._data[parsed.match_id] = parsed
                self._metadata[parsed.match_id] = metadata_from_cricsheet(payload, parsed)
            except (OSError, ValueError, KeyError, TypeError):
                continue

    def all(self) -> list[Match]:
        return list(self._metadata.values())

    def get(self, match_id: str) -> ReplayData:
        if match_id not in self._data:
            raise KeyError(match_id)
        return self._data[match_id]

    def metadata(self, match_id: str) -> Match:
        if match_id not in self._metadata:
            raise KeyError(match_id)
        return self._metadata[match_id]


def parse_cricsheet(payload: dict, match_id: str = "cricsheet-match") -> ReplayData:
    info = payload["info"]
    teams = info["teams"]
    innings_data = payload["innings"]
    innings = innings_data[1] if len(innings_data) > 1 else innings_data[0]
    target = 0
    if len(innings_data) > 1:
        target = 1 + sum(
            delivery["runs"]["total"]
            for over_data in innings_data[0]["overs"]
            for delivery in over_data["deliveries"]
        )
    deliveries = []
    index = 0
    for over_data in innings["overs"]:
        over = over_data["over"]
        for delivery in over_data["deliveries"]:
            index += 1
            runs = delivery["runs"]
            extras_data = delivery.get("extras", {})
            extras = sum(extras_data.values())
            wicket_data = delivery.get("wickets", [])
            wicket = wicket_data[0] if wicket_data else None
            deliveries.append({
                "index": index, "over": over, "ball_in_over": len([d for d in deliveries if d["over"] == over]) + 1,
                "over_label": f"{over}.{len([d for d in deliveries if d['over'] == over]) + 1}",
                "bowler": delivery["bowler"], "striker": delivery["batter"], "non_striker": delivery["non_striker"],
                "runs_off_bat": runs["batter"], "extras": extras, "total_runs": runs["total"],
                "is_legal": not any(name in extras_data for name in ("wides", "noballs")),
                "outcome": "wicket" if wicket else ("wide" if "wides" in extras_data else ("no_ball" if "noballs" in extras_data else "run")),
                "wicket": {"batter": wicket["player_out"], "kind": wicket["kind"]} if wicket else None,
                "commentary": f"{runs['total']} run(s)",
            })
    from app.models import BallEvent
    return ReplayData(
        match_id=match_id,
        batting_team=innings["team"], bowling_team=next(team for team in teams if team != innings["team"]),
        target=target, deliveries=[BallEvent.model_validate(item) for item in deliveries],
        batting_order=list(dict.fromkeys([d.striker for d in [BallEvent.model_validate(item) for item in deliveries]])),
        result="Historical replay complete",
        balls_per_innings=int(info.get("overs", 20)) * int(info.get("balls_per_over", 6)),
    )


def metadata_from_cricsheet(payload: dict, parsed: ReplayData) -> Match:
    info = payload["info"]
    teams = list(info["teams"])
    return Match(
        match_id=parsed.match_id, tournament=str(info.get("event", {}).get("name", "Cricket match")),
        match_number=str(info.get("event", {}).get("match_number", "")),
        teams=(TeamInfo(name=teams[0], code=teams[0][:3].upper()), TeamInfo(name=teams[1], code=teams[1][:3].upper())),
        venue=str(info.get("venue", "Unknown venue")), match_date=str(info.get("dates", [""])[0]),
        is_demo=False,
    )
