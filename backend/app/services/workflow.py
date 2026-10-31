from app.ai.graph import build_workflow
from app.models import ChatResponse
from app.models import ComputedFact
from app.services.cricket import ReplayData, state_at
from app.services.gemini import GeminiService
from app.services.intent import IntentClassifier
from app.services.rag import CricketRetriever


def answer(
    data: ReplayData,
    question: str,
    ball_index: int,
    gemini: GeminiService,
    retriever: CricketRetriever,
    classifier: IntentClassifier,
) -> ChatResponse:
    try:
        graph = build_workflow(data, gemini, retriever, classifier)
        state = graph.invoke({
            "match_id": data.match_id,
            "ball_index": ball_index,
            "question": question,
            "conversation_id": None,
        })
    except Exception as exc:
        # Fallback if graph execution encounters an error
        from app.services.intent import classify
        current = state_at(data, ball_index)
        state = {
            "intent": classify(question).value,
            "computed_statistics": [
                {"label": "Score", "value": f"{current.score}/{current.wickets}"},
                {"label": "Overs", "value": current.overs},
                {"label": "Current run rate", "value": f"{current.current_run_rate:.2f}"},
            ],
            "evidence": [{
                "kind": "statistic",
                "title": "Verified replay state",
                "detail": f"{current.score}/{current.wickets} after {current.overs} overs",
                "ball_index": ball_index,
            }],
            "citations": [],
            "warnings": [f"Graph fallback engaged: {exc}"],
            "final_answer": f"This historical replay is at {current.score}/{current.wickets} after {current.overs} overs. Current run rate: {current.current_run_rate:.2f}.",
        }
    return ChatResponse(
        answer=state["final_answer"],
        intent=state["intent"],
        computed_facts=state.get("computed_statistics", []),
        evidence=state.get("evidence", []),
        citations=state.get("citations", []),
        confidence=state.get("confidence", "high"),
        warnings=state.get("warnings", []),
        source="backend",
        last_processed_ball_index=ball_index,
        match_id=data.match_id,
    )
