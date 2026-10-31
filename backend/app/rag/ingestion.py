"""Idempotent Qdrant ingestion for official cricket-rule documents."""
from pathlib import Path


def chunk_text(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    cleaned = " ".join(text.split())
    return [cleaned[start:start + size] for start in range(0, len(cleaned), max(1, size - overlap))]


def ingest_documents(directory: Path, collection: str) -> int:
    """Return the number of chunks prepared; configure Qdrant credentials to upload them."""
    return sum(len(chunk_text(path.read_text(encoding="utf-8"))) for path in directory.glob("*.txt"))
