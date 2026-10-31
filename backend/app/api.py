from collections import defaultdict
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

from app.config import get_settings
from app.models import CatchUpRequest, ChatRequest, MatchState, ReplayAdvanceRequest
from app.services.cricket import ReplayData, state_at, timeline_at
from app.services.gemini import GeminiService
from app.services.match_data import MatchRepository
from app.services.rag import CricketRetriever
from app.services.workflow import answer
from app.services.intent import IntentClassifier

settings = get_settings()
repository = MatchRepository(settings.resolved_data_dir)
gemini = GeminiService(settings)
retriever = CricketRetriever(settings)
classifier = IntentClassifier(settings)
router = APIRouter(prefix="/api")


def get_data(match_id: str) -> ReplayData:
    try:
        return repository.get(match_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Match {match_id} was not found") from exc


@router.get("/health")
def health() -> dict[str, str | None]:
    return {
        "status": "ok",
        "mode": "historical_replay",
        "gemini": gemini.status,
        "gemini_model": gemini.model,
        "gemini_error": gemini.error_kind,
        "gemini_error_summary": gemini.error_summary,
        "qdrant": retriever.status,
        "intent_classifier": classifier.source,
    }


@router.get("/matches")
def matches():
    return repository.all()


@router.get("/matches/{match_id}")
def match(match_id: str):
    try:
        return repository.metadata(match_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Match was not found") from exc


@router.get("/matches/{match_id}/state")
def state(match_id: str, ball_index: int = Query(ge=0)) -> MatchState:
    return state_at(get_data(match_id), ball_index)


@router.get("/matches/{match_id}/timeline")
def timeline(match_id: str, ball_index: int = Query(ge=0)):
    return timeline_at(get_data(match_id), ball_index)


@router.post("/matches/{match_id}/replay/advance")
def advance(match_id: str, request: ReplayAdvanceRequest):
    data = get_data(match_id)
    return {"match_id": match_id, "ball_index": max(0, min(len(data.deliveries), request.from_index + request.steps)), "total_deliveries": len(data.deliveries)}


@router.post("/matches/{match_id}/catch-up")
def catch_up(match_id: str, request: CatchUpRequest):
    data = get_data(match_id)
    end = max(0, min(request.ball_index, len(data.deliveries)))
    start = max(0, end - request.overs * 6)
    events = data.deliveries[start:end]
    runs = sum(event.total_runs for event in events)
    wickets = sum(1 for event in events if event.wicket)
    legal = sum(event.is_legal for event in events)
    boundaries = sum(event.runs_off_bat in (4, 6) for event in events)
    dots = sum(event.runs_off_bat == 0 and event.extras == 0 for event in events)
    from app.models import CatchUpStatistic, CatchUpResponse, KeyMoment
    moments = [KeyMoment(title="Wicket", detail=event.commentary, over_label=event.over_label, tone="wicket") for event in events if event.wicket]
    moments += [KeyMoment(title="Boundary", detail=event.commentary, over_label=event.over_label, tone="boundary") for event in events if event.runs_off_bat in (4, 6)]
    return CatchUpResponse(
        match_id=match_id, from_over=events[0].over_label if events else "0.1",
        to_over=events[-1].over_label if events else "0.1",
        headline=f"{runs} runs from the last {request.overs} overs",
        summary=f"Historical replay interval produced {runs} runs and {wickets} wickets.",
        key_moments=moments[:6], important_events=events[-6:],
        statistics=[
            CatchUpStatistic(label="Runs", value=str(runs)),
            CatchUpStatistic(label="Wickets", value=str(wickets)),
            CatchUpStatistic(label="Boundaries", value=str(boundaries)),
            CatchUpStatistic(label="Dot balls", value=str(dots)),
            CatchUpStatistic(label="Scoring rate", value=f"{runs * 6 / legal:.2f}" if legal else "0.00"),
        ],
        key_players=[], evidence=[], source="backend", last_processed_ball_index=end,
    )


@router.post("/matches/{match_id}/ask")
@router.post("/chat")
def ask(request: ChatRequest):
    data = get_data(request.match_id)
    return answer(data, request.question, request.ball_index, gemini, retriever, classifier)


@router.get("/matches/{match_id}/insights")
def insights(match_id: str, ball_index: int = Query(ge=0)):
    current = state_at(get_data(match_id), ball_index)
    return [f"Scoring at {current.current_run_rate:.2f} runs per over", f"{current.remaining_runs} runs remain in this historical chase"]


@router.get("/matches/{match_id}/stories")
def stories(match_id: str):
    data = get_data(match_id)
    return [{"kind": "over", "title": "Replay available", "detail": "Explore the historical ball-by-ball sequence.", "over_label": "0.1", "ball_index": 1}]
