"""Evaluate a trained classifier without fabricating metrics."""
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score


def metrics(expected: list[int], predicted: list[int]) -> dict:
    return {
        "accuracy": accuracy_score(expected, predicted),
        "macro_f1": f1_score(expected, predicted, average="macro"),
        "confusion_matrix": confusion_matrix(expected, predicted).tolist(),
    }
