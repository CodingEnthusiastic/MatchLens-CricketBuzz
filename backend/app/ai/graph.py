from typing import TypedDict
from app.models import Citation, ComputedFact, EvidenceItem
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
        ctx = current.model_dump()
        computed = [
            ComputedFact(label="Score", value=f"{current.score}/{current.wickets}"),
            ComputedFact(label="Overs", value=current.overs),
            ComputedFact(label="Current run rate", value=f"{current.current_run_rate:.2f}"),
        ]
        if current.target:
            computed.append(ComputedFact(label="Target", value=str(current.target)))
        if current.required_run_rate is not None:
            computed.append(ComputedFact(label="Required run rate", value=f"{current.required_run_rate:.2f}"))
        if current.remaining_runs is not None and current.remaining_balls is not None:
            computed.append(ComputedFact(label="Equation", value=f"{current.remaining_runs} runs from {current.remaining_balls} balls"))
        if current.partnership:
            computed.append(ComputedFact(label="Partnership", value=f"{current.partnership.runs} off {current.partnership.balls}b"))
        return {
            "match_context": ctx,
            "computed_statistics": computed,
        }

    def classify_intent(state: MatchLensState) -> MatchLensState:
        return {"intent": classifier.predict(state["question"]).value}

    def retrieve_statistics(state: MatchLensState) -> MatchLensState:
        context = state["match_context"]
        evidence_items = [
            EvidenceItem(
                kind="statistic",
                title="Verified replay state",
                detail=f"{context.get('batting_team', 'Batting team')} {context['score']}/{context['wickets']} after {context['overs']} ov (CRR {context['current_run_rate']:.2f})",
                ball_index=state["ball_index"],
            )
        ]
        if context.get("target"):
            req_rate = context.get("required_run_rate")
            req_str = f"{req_rate:.2f}" if req_rate is not None else "N/A"
            evidence_items.append(
                EvidenceItem(
                    kind="statistic",
                    title="Target & run chase equation",
                    detail=f"Target {context['target']}, needing {context.get('remaining_runs')} from {context.get('remaining_balls')} balls. Required rate: {req_str} RPO",
                    ball_index=state["ball_index"],
                )
            )
        if context.get("partnership"):
            p = context["partnership"]
            evidence_items.append(
                EvidenceItem(
                    kind="statistic",
                    title=f"Active partnership ({p['batters'][0]} & {p['batters'][1]})",
                    detail=f"{p['runs']} runs off {p['balls']} balls",
                    ball_index=state["ball_index"],
                )
            )
        if context.get("last_ball"):
            lb = context["last_ball"]
            evidence_items.append(
                EvidenceItem(
                    kind="ball",
                    title=f"Delivery {lb.get('over_label', '')} ({lb.get('bowler', '')} to {lb.get('striker', '')})",
                    detail=lb.get("commentary", "Ball completed"),
                    ball_index=state["ball_index"],
                )
            )
        return {"evidence": evidence_items}

    def retrieve_knowledge(state: MatchLensState) -> MatchLensState:
        docs = retriever.retrieve(state["question"], limit=3)
        return {"retrieved_documents": docs}

    def generate_explanation(state: MatchLensState) -> MatchLensState:
        documents = state.get("retrieved_documents", [])
        context = state["match_context"]
        question = state["question"]
        intent = state["intent"]

        citations = [
            Citation(title=doc.title, source=doc.source_url or "Qdrant knowledge base", excerpt=doc.content, url=doc.source_url)
            for doc in documents
        ]

        # Add rule evidence items to evidence list for the UI
        existing_evidence = list(state.get("evidence", []))
        for doc in documents:
            existing_evidence.append(
                EvidenceItem(
                    kind="rule",
                    title=doc.title,
                    detail=doc.content[:160] + "...",
                    ball_index=state["ball_index"],
                )
            )

        # Build prompt for Gemini
        batting = context.get('batting_team', 'Batting side')
        bowling = context.get('bowling_team', 'Bowling side')
        doc_texts = "\n\n".join([f"Source: {d.title} ({d.source_url})\n{d.content}" for d in documents])

        prompt = f"""You are MatchLens, an expert cricket analytics companion (similar to ESPNcricinfo and Cricbuzz).
Analyze and answer the user's question with precise cricketing insight.

MATCH SITUATION:
- Match: {context.get('match_id')} ({bowling} vs {batting})
- Score: {batting} {context['score']}/{context['wickets']} in {context['overs']} overs
- Current Run Rate: {context['current_run_rate']:.2f}
- Target: {context.get('target', 'N/A')}
- Required Run Rate: {context.get('required_run_rate', 'N/A')}
- Equation: {context.get('remaining_runs', 'N/A')} runs needed off {context.get('remaining_balls', 'N/A')} balls
- Partnership: {context.get('partnership', {}).get('runs', 0)} runs off {context.get('partnership', {}).get('balls', 0)} balls between {context.get('partnership', {}).get('batters', ['Batter 1', 'Batter 2'])}
- Current Bowler: {context.get('current_bowler', {}).get('name', 'Bowler')} ({context.get('current_bowler', {}).get('wickets', 0)}-{context.get('current_bowler', {}).get('runs', 0)} in {context.get('current_bowler', {}).get('overs', '0')} ov)

RELEVANT CRICKET KNOWLEDGE & RULES RETRIEVED FROM KNOWLEDGE BASE:
{doc_texts if doc_texts else "No specific external rule clause matched."}

QUESTION:
{question}

INSTRUCTIONS:
1. Provide a direct, authoritative, and engaging analytical response.
2. Ground all numbers strictly in the verified match situation above.
3. If the question relates to rules, decisions, DRS, LBW, free hits, or tactics, explain the rule mechanism and directly cite the retrieved knowledge source.
4. If asked about win probability, analyze the mathematical factors (wickets in hand vs required run rate escalation vs death-overs leverage) rather than declining flatly.
5. Use markdown formatting with bullet points for readability. Keep it concise (2 to 4 paragraphs or bullet points).
"""

        generated = gemini.explain(prompt)
        warnings = []
        if not generated:
            warnings.append(f"Gemini unavailable ({gemini.error_kind or gemini.status}); deterministic match analysis returned.")
            target_info = f" Chasing {context.get('target')}, needing {context.get('remaining_runs')} runs from {context.get('remaining_balls')} balls (RRR {context.get('required_run_rate'):.2f})." if context.get('target') else ""
            fallback = f"At over {context['overs']}, {batting} are {context['score']}/{context['wickets']} (CRR {context['current_run_rate']:.2f}).{target_info}"
            generated = fallback

        return {
            "final_answer": generated,
            "citations": citations,
            "evidence": existing_evidence,
            "warnings": warnings,
        }

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
    graph.add_edge("classify_intent", "retrieve_statistics")
    graph.add_edge("retrieve_statistics", "retrieve_knowledge")
    graph.add_edge("retrieve_knowledge", "generate_explanation")
    graph.add_edge("generate_explanation", "validate_grounding")
    graph.add_edge("validate_grounding", "format_response")
    graph.add_edge("format_response", END)

    return graph.compile()
