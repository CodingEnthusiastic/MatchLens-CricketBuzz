from pathlib import Path
from app.services.cricket import overs_label, run_rate, state_at
from app.services.match_data import MatchRepository


def test_overs_use_cricket_notation():
    assert overs_label(15 * 6 + 4) == "15.4"


def test_run_rate_uses_legal_deliveries():
    assert run_rate(142, 90) == 9.47


def test_match_finishes_at_all_out_without_index_error():
    repo = MatchRepository(Path("app/data/matches"))
    data = repo.get("1082591")
    # Delivery 123 is the 10th wicket (all out)
    st = state_at(data, 123)
    assert st.wickets == 10
    assert st.result == "Sunrisers Hyderabad won by 35 runs"
    assert len(st.batting_pair) == 2
