"""Idempotent Qdrant ingestion for official cricket-rule documents."""
from pathlib import Path
from app.config import get_settings
from app.services.rag import CricketRetriever, RetrievedDocument


def chunk_text(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    cleaned = " ".join(text.split())
    return [cleaned[start:start + size] for start in range(0, len(cleaned), max(1, size - overlap))]


def ingest_documents(directory: Path, collection: str | None = None) -> int:
    """Ingest and upsert official cricket knowledge documents into Qdrant."""
    settings = get_settings()
    if collection:
        settings.qdrant_collection = collection
    retriever = CricketRetriever(settings)
    if retriever._client is None or retriever._encoder is None:
        raise RuntimeError(f"Qdrant retriever could not be initialized: {retriever.status}")

    docs: list[RetrievedDocument] = []
    for path in directory.glob("*.txt"):
        text = path.read_text(encoding="utf-8")
        sections = text.split("---")
        for idx, sec in enumerate(sections):
            sec = sec.strip()
            if not sec:
                continue
            title = f"{path.stem.replace('_', ' ').title()} - Section {idx + 1}"
            source = "MCC / ICC Official Laws"
            doc_id = f"{path.stem}_{idx}"
            content_lines = []
            for line in sec.split("\n"):
                if line.startswith("Title:"):
                    title = line[6:].strip()
                elif line.startswith("Source:"):
                    source = line[7:].strip()
                elif not line.startswith("[DOCUMENT:"):
                    content_lines.append(line)
            content = "\n".join(content_lines).strip()
            if content:
                docs.append(
                    RetrievedDocument(
                        document_id=doc_id,
                        title=title,
                        source_url=source,
                        content=content,
                    )
                )

    if not docs:
        return 0
    return retriever.index(docs)
