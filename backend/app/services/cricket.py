from collections import defaultdict
from dataclasses import dataclass

from app.models import BallEvent, BatterLine, BowlerLine, MatchState, Partnership


def overs_label(legal_balls: int) -> str:
    return f"{legal_balls // 6}.{legal_balls % 6}"


def run_rate(runs: int, legal_balls: int) -> float:
    return round(runs * 6 / legal_balls, 2) if legal_balls else 0.0


@dataclass(frozen=True)
class ReplayData:
    match_id: str
    batting_team: str
    bowling_team: str
    target: int
    deliveries: list[BallEvent]
    batting_order: list[str]
    result: str
    balls_per_innings: int = 120


def _batter_lines(events: list[BallEvent], names: list[str], striker: str) -> tuple[BatterLine, BatterLine]:
    stats: dict[str, dict[str, int | bool]] = defaultdict(lambda: {"runs": 0, "balls": 0, "fours": 0, "sixes": 0, "out": False})
    for event in events:
        row = stats[event.striker]
        if event.is_legal:
            row["balls"] = int(row["balls"]) + 1
        row["runs"] = int(row["runs"]) + event.runs_off_bat
        row["fours"] = int(row["fours"]) + (event.runs_off_bat == 4)
        row["sixes"] = int(row["sixes"]) + (event.runs_off_bat == 6)
        if event.wicket:
            stats[event.wicket.batter]["out"] = True

    selected = [striker]
    for name in names:
        if name not in selected:
            selected.append(name)
        if len(selected) == 2:
            break
    lines: list[BatterLine] = []
    for name in selected:
        row = stats[name]
        balls = int(row["balls"])
        runs = int(row["runs"])
        lines.append(BatterLine(
            name=name, runs=runs, balls=balls, fours=int(row["fours"]), sixes=int(row["sixes"]),
            strike_rate=round(runs * 100 / balls, 2) if balls else 0.0,
            is_out=bool(row["out"]), is_on_strike=name == striker,
        ))
    return lines[0], lines[1]


def _current_pair(events: list[BallEvent], batting_order: list[str]) -> tuple[str, str]:
    """Return the two current batters. Handles end-of-match (all-out) gracefully."""
    if not events:
        first = batting_order[0] if len(batting_order) > 0 else "Unknown"
        second = batting_order[1] if len(batting_order) > 1 else ""
        return first, second
    dismissed = {event.wicket.batter for event in events if event.wicket}
    last = events[-1]
    candidates: list[str] = []
    for name in (last.striker, last.non_striker):
        if name not in dismissed and name not in candidates:
            candidates.append(name)
    for name in batting_order:
        if name not in dismissed and name not in candidates:
            candidates.append(name)
        if len(candidates) == 2:
            break
    # All-out or final ball: fewer than 2 active batters remain
    if len(candidates) == 0:
        candidates = [last.striker, last.non_striker]
    elif len(candidates) == 1:
        other = last.non_striker if candidates[0] == last.striker else last.striker
        candidates.append(other)
    return candidates[0], candidates[1]


def state_at(data: ReplayData, ball_index: int) -> MatchState:
    index = max(0, min(ball_index, len(data.deliveries)))
    events = data.deliveries[:index]
    score = sum(event.total_runs for event in events)
    wickets = sum(1 for event in events if event.wicket)
    legal = sum(1 for event in events if event.is_legal)
    remaining_runs = max(data.target - score, 0)
    remaining_balls = max(data.balls_per_innings - legal, 0)
    current = events[-1] if events else None
    pair_names = _current_pair(events, data.batting_order)
    striker = current.striker if current and current.striker in pair_names else pair_names[0]
    pair = _batter_lines(events, list(pair_names), striker)
    current_bowler = current.bowler if current else data.deliveries[0].bowler
    bowler_events = [event for event in events if event.bowler == current_bowler]
    bowler_legal = sum(event.is_legal for event in bowler_events)
    bowler_runs = sum(event.total_runs for event in bowler_events)
    bowler_wickets = sum(1 for event in bowler_events if event.wicket)
    last_wicket_position = max(
        (position for position, event in enumerate(events) if event.wicket),
        default=-1,
    )
    partnership_events = events[last_wicket_position + 1:]
    partnership_runs = sum(event.total_runs for event in partnership_events)
    partnership_balls = sum(event.is_legal for event in partnership_events)
    is_finished = (
        (index == len(data.deliveries) and len(data.deliveries) > 0)
        or wickets >= 10
        or (data.target > 0 and score >= data.target)
        or (data.balls_per_innings > 0 and legal >= data.balls_per_innings)
    )
    rrr = None if (is_finished or remaining_balls == 0) else round(remaining_runs * 6 / remaining_balls, 2)
    return MatchState(
        match_id=data.match_id, ball_index=index, total_deliveries=len(data.deliveries),
        innings=2, batting_team=data.batting_team, bowling_team=data.bowling_team,
        score=score, wickets=wickets, overs=overs_label(legal), legal_balls=legal,
        current_run_rate=run_rate(score, legal),
        required_run_rate=rrr,
        target=data.target, remaining_runs=remaining_runs, remaining_balls=remaining_balls,
        batting_pair=pair, current_bowler=BowlerLine(
            name=current_bowler, overs=overs_label(bowler_legal), runs=bowler_runs,
            wickets=bowler_wickets, economy=run_rate(bowler_runs, bowler_legal),
        ),
        partnership=Partnership(runs=partnership_runs, balls=partnership_balls, batters=pair_names),
        recent_events=events[-6:], last_ball=current, result=data.result if is_finished else None,
    )


def timeline_at(data: ReplayData, ball_index: int) -> list[dict]:
    events = data.deliveries[:max(0, min(ball_index, len(data.deliveries)))]
    grouped: dict[int, list[BallEvent]] = defaultdict(list)
    for event in events:
        grouped[event.over].append(event)
    result = []
    cumulative_runs = cumulative_wickets = 0
    for over, balls in grouped.items():
        cumulative_runs += sum(ball.total_runs for ball in balls)
        cumulative_wickets += sum(1 for ball in balls if ball.wicket)
        legal = sum(ball.is_legal for ball in events if ball.index <= balls[-1].index)
        result.append({
            "over": over, "balls": balls, "runs": sum(ball.total_runs for ball in balls),
            "wickets": sum(1 for ball in balls if ball.wicket),
            "cumulative_runs": cumulative_runs, "cumulative_wickets": cumulative_wickets,
            "run_rate": run_rate(cumulative_runs, legal), "target_pace": None,
        })
    return result
