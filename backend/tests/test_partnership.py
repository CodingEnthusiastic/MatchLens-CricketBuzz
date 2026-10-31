from app.models import BallEvent, Wicket
from app.services.cricket import ReplayData, state_at


def delivery(index: int, striker: str, non_striker: str, runs: int, wicket: str | None = None) -> BallEvent:
    return BallEvent(
        index=index, over=0, ball_in_over=index, over_label=f"0.{index}",
        bowler="Bowler", striker=striker, non_striker=non_striker,
        runs_off_bat=runs, extras=0, total_runs=runs, is_legal=True,
        outcome="wicket" if wicket else "run", wicket=Wicket(batter=wicket, kind="bowled") if wicket else None,
        commentary="test",
    )


def test_partnership_resets_after_latest_wicket():
    data = ReplayData(
        match_id="test", batting_team="A", bowling_team="B", target=200,
        deliveries=[
            delivery(1, "A", "B", 2),
            delivery(2, "A", "B", 1, wicket="A"),
            delivery(3, "C", "B", 4),
        ],
        batting_order=["A", "B", "C", "D"], result="replay",
    )
    state = state_at(data, 3)
    assert state.partnership.runs == 4
    assert state.partnership.balls == 1
    assert state.partnership.batters == ("C", "B")
