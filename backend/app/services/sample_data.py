from app.models import BallEvent, Wicket
from app.services.cricket import ReplayData


def _events() -> list[BallEvent]:
    tokens = "0 4 1 0 wd 2 1 1 1 0 6 0 2 0 1 W 4 1 0 2 0 4 nb 6 1 1 1 4 0 0 1 W 4 4 6 1 0 2 0 1 0 0 1 W 4 0 2 6 W 1 1 0 1 2 1 0 0 0 wd 0 W 1 1 4 0 1 6 1 0".split()
    batters = ["Rohan Kapoor", "Sameer Iyer", "Liam Carter", "Jordan Reyes", "Kabir Shah"]
    bowlers = ["Arjun Mehta", "Daniel Okafor", "Hassan Rahim", "Lewis Porter", "Sanjay Nair"]
    events: list[BallEvent] = []
    legal_by_over = 0
    for index, token in enumerate(tokens):
        over = legal_by_over // 6
        ball = legal_by_over % 6 + 1
        is_legal = token not in {"wd", "nb"}
        runs_bat = int(token) if token.isdigit() else 0
        extras = 1 if token in {"wd", "nb"} else 0
        wicket = Wicket(batter=batters[min(over + ball // 4, len(batters) - 1)], kind="bowled") if token == "W" else None
        events.append(BallEvent(
            index=index + 1, over=over, ball_in_over=ball, over_label=f"{over}.{ball}",
            bowler=bowlers[over % len(bowlers)], striker=batters[(index // 3) % len(batters)],
            non_striker=batters[((index // 3) + 1) % len(batters)], runs_off_bat=runs_bat,
            extras=extras, total_runs=runs_bat + extras, is_legal=is_legal,
            outcome="wicket" if wicket else ("wide" if token == "wd" else ("no_ball" if token == "nb" else ("four" if runs_bat == 4 else ("six" if runs_bat == 6 else ("run" if runs_bat else "dot"))))),
            wicket=wicket, commentary=f"{token} in over {over}.{ball}",
        ))
        if is_legal:
            legal_by_over += 1
    return events


def demo_matches() -> list[ReplayData]:
    return [ReplayData(
        match_id="demo-t20-northern-coastal", batting_team="Coastal Kings",
        bowling_team="Northern Strikers", target=183, deliveries=_events(),
        batting_order=["Rohan Kapoor", "Sameer Iyer", "Liam Carter", "Jordan Reyes", "Kabir Shah"],
        result="Historical replay complete",
    )]
