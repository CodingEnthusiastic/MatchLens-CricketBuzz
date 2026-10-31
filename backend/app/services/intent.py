from enum import StrEnum
from pathlib import Path

from app.config import Settings


class Intent(StrEnum):
    MATCH_STATISTICS = "MATCH_STATISTICS"
    MATCH_RECAP = "MATCH_RECAP"
    MOMENTUM_ANALYSIS = "MOMENTUM_ANALYSIS"
    PLAYER_COMPARISON = "PLAYER_COMPARISON"
    CRICKET_RULES = "CRICKET_RULES"
    GENERAL_MATCH_QUERY = "GENERAL_MATCH_QUERY"


def classify(question: str) -> Intent:
    text = question.lower()
    if any(word in text for word in ("rule", "no-ball", "noball", "wide", "drs", "powerplay", "lbw")):
        return Intent.CRICKET_RULES
    if any(word in text for word in ("compare", "versus", "vs", "partnership")):
        return Intent.PLAYER_COMPARISON
    if any(word in text for word in ("why", "momentum", "dropped", "surge", "pressure", "run rate")):
        return Intent.MOMENTUM_ANALYSIS
    if any(word in text for word in ("what happened", "last", "recap", "catch me up")):
        return Intent.MATCH_RECAP
    if any(word in text for word in ("how many", "score", "runs", "wickets", "overs", "required")):
        return Intent.MATCH_STATISTICS
    return Intent.GENERAL_MATCH_QUERY


class IntentClassifier:
    def __init__(self, settings: Settings):
        self._model = None
        self._tokenizer = None
        self._labels = list(Intent)
        self.source = "heuristic_fallback"
        if settings.intent_model_path and Path(settings.intent_model_path).exists():
            try:
                from transformers import AutoModelForSequenceClassification, AutoTokenizer
                self._tokenizer = AutoTokenizer.from_pretrained(settings.intent_model_path)
                self._model = AutoModelForSequenceClassification.from_pretrained(settings.intent_model_path)
                self.source = "peft_model"
            except (ImportError, OSError, ValueError):
                self._model = None

    def predict(self, question: str) -> Intent:
        if self._model is not None and self._tokenizer is not None:
            import torch
            encoded = self._tokenizer(question, return_tensors="pt", truncation=True)
            with torch.no_grad():
                label_id = int(self._model(**encoded).logits.argmax(dim=-1).item())
            return self._labels[label_id]
        return classify(question)
