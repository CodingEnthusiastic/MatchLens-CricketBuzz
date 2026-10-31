from typing import TypedDict

from app.models import ComputedFact, EvidenceItem
from app.services.cricket import ReplayData, state_at
from app.services.intent import IntentClassifier
from app.services.gemini import GeminiService
from app.services.rag import CricketRetriever


class MatchLensState(TypedDict, total=False):
    match_id: str
    ball_index: int
    question: str
    conversation_id: str | None
    intent: str
    match_context: dict
    computed_statistics: list[ComputedFact]
    retrieved_documents: list
    evidence: list[EvidenceItem]
    final_answer: str
    citations: list[dict]
    confidence: str | None
    warnings: list[str]


def build_workflow(data: ReplayData, gemini: GeminiService, retriever: CricketRetriever, classifier: IntentClassifier):
    from langgraph.graph import END, START, StateGraph

    graph = StateGraph(MatchLensState)

    def load_match_context(state: MatchLensState) -> MatchLensState:
        current = state_at(data, state["ball_index"])
        return {
            "match_context": current.model_dump(),
            "computed_statistics": [
                ComputedFact(label="Score", value=f"{current.score}/{current.wickets}"),
                ComputedFact(label="Overs", value=current.overs),
                ComputedFact(label="Current run rate", value=f"{current.current_run_rate:.2f}"),
            ],
        }

    def classify_intent(state: MatchLensState) -> MatchLensState:
        return {"intent": classifier.predict(state["question"]).value}

    def retrieve_statistics(state: MatchLensState) -> MatchLensState:
        context = state["match_context"]
        return {
            "evidence": [
                EvidenceItem(
                    kind="statistic",
                    title="Verified replay state",
                    detail=f"{context['score']}/{context['wickets']} after {context['overs']} overs",
                    ball_index=state["ball_index"],
                )
            ]
        }

    def retrieve_knowledge(state: MatchLensState) -> MatchLensState:
        return {"retrieved_documents": retriever.retrieve(state["question"])}

    def generate_explanation(state: MatchLensState) -> MatchLensState:
        documents = state.get("retrieved_documents", [])
        intent = state["intent"]
        context = state["match_context"]
        if intent == "MATCH_STATISTICS":
            answer = (
                f"The verified historical replay score is {context['score']}/{context['wickets']} "
                f"after {context['overs']} overs. Current run rate: {context['current_run_rate']:.2f}."
            )
            return {"final_answer": answer, "citations": [], "warnings": []}
        if intent == "PLAYER_COMPARISON":
            answer = (
                f"The current partnership is {context['partnership']['runs']} runs from "
                f"{context['partnership']['balls']} legal balls between "
                f"{context['partnership']['batters'][0]} and {context['partnership']['batters'][1]}."
            )
            return {"final_answer": answer, "citations": [], "warnings": []}
        if "probability" in state["question"].lower() or "win probability" in state["question"].lower():
            return {
                "final_answer": "A win-probability percentage is unavailable because MatchLens has no calibrated probability model. The replay engine will not invent one.",
                "citations": [],
                "warnings": ["No calibrated win-probability model is configured."],
            }
        prompt = (
            "Answer the user's question directly and concisely. This is a historical replay, never live data. "
            "Do not repeat score or run-rate facts unless they directly answer the question. "
            "Never invent events, statistics, rules, probabilities, or citations. "
            f"Question: {state['question']}\n"
            f"Relevant verified context: score={context['score']}/{context['wickets']}, overs={context['overs']}, "
            f"run_rate={context['current_run_rate']}, partnership={context['partnership']}\n"
            f"Retrieved cricket-rule evidence (use only for rule questions): {documents}"
        )
        generated = gemini.explain(prompt)
        fallback = (
            f"This historical replay is at {context['score']}/{context['wickets']} after {context['overs']} overs. "
            f"The calculated current run rate is {context['current_run_rate']:.2f}."
        )
        citations = [
            {"title": doc.title, "source": doc.source_url or "Qdrant knowledge base", "excerpt": doc.content}
            for doc in documents
        ]
        warnings = [] if generated else [
            f"Gemini unavailable ({gemini.error_kind or gemini.status}); deterministic evidence was returned."
        ]
        return {"final_answer": generated or fallback, "citations": citations, "warnings": warnings}

    def validate_grounding(state: MatchLensState) -> MatchLensState:
        return {"confidence": "high" if not state.get("warnings") else "medium"}

    def format_response(state: MatchLensState) -> MatchLensState:
        return state

    graph.add_node("load_match_context", load_match_context)
    graph.add_node("classify_intent", classify_intent)
    graph.add_node("retrieve_statistics", retrieve_statistics)
    graph.add_node("retrieve_knowledge", retrieve_knowledge)
    graph.add_node("generate_explanation", generate_explanation)
    graph.add_node("validate_grounding", validate_grounding)
    graph.add_node("format_response", format_response)
    graph.add_edge(START, "load_match_context")
    graph.add_edge("load_match_context", "classify_intent")
    graph.add_conditional_edges(
        "classify_intent",
        lambda state: "retrieve_knowledge" if state["intent"] == "CRICKET_RULES" else "retrieve_statistics",
        {"retrieve_knowledge": "retrieve_knowledge", "retrieve_statistics": "retrieve_statistics"},
    )
    graph.add_edge("retrieve_knowledge", "generate_explanation")
    graph.add_edge("retrieve_statistics", "generate_explanation")
    graph.add_edge("generate_explanation", "validate_grounding")
    graph.add_edge("validate_grounding", "format_response")
    graph.add_edge("format_response", END)
    return graph.compile()
