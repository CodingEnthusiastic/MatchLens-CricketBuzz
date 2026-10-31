from app.services.cricket import overs_label, run_rate


def test_overs_use_cricket_notation():
    assert overs_label(15 * 6 + 4) == "15.4"


def test_run_rate_uses_legal_deliveries():
    assert run_rate(142, 90) == 9.47
