from dataclasses import dataclass
from hashlib import sha256

from app.config import Settings


@dataclass(frozen=True)
class RetrievedDocument:
    title: str
    content: str
    source_url: str | None = None
    document_id: str | None = None
    section: str | None = None


class CricketRetriever:
    def __init__(self, settings: Settings):
        self.collection = settings.qdrant_collection
        self.status = "not_configured"
        self._client = None
        self._encoder = None
        if settings.qdrant_url and settings.qdrant_api_key:
            try:
                from qdrant_client import QdrantClient
                from sentence_transformers import SentenceTransformer
                self._client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
                self._encoder = SentenceTransformer(settings.embedding_model)
                self._ensure_collection()
                self.status = "connected"
            except (ImportError, OSError, RuntimeError, ValueError) as exc:
                self.status = f"unavailable: {exc.__class__.__name__}"

    def _ensure_collection(self) -> None:
        from qdrant_client.models import Distance, VectorParams
        size = self._encoder.get_sentence_embedding_dimension()
        if not self._client.collection_exists(self.collection):
            self._client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=size, distance=Distance.COSINE),
            )

    def index(self, documents: list[RetrievedDocument]) -> int:
        if self._client is None or self._encoder is None:
            raise RuntimeError("Qdrant is not configured")
        from qdrant_client.models import PointStruct
        vectors = self._encoder.encode([document.content for document in documents]).tolist()
        points = [
            PointStruct(
                id=int(sha256((document.document_id or str(index)).encode()).hexdigest()[:15], 16),
                vector=vector,
                payload={
                    "document_id": document.document_id,
                    "title": document.title,
                    "section": document.section,
                    "content": document.content,
                    "source_url": document.source_url,
                    "document_type": "cricket_rule",
                },
            )
            for index, (document, vector) in enumerate(zip(documents, vectors))
        ]
        self._client.upsert(collection_name=self.collection, points=points)
        return len(points)

    def retrieve(self, question: str, limit: int = 3) -> list[RetrievedDocument]:
        if self._client is None or self._encoder is None:
            return []
        vector = self._encoder.encode(question).tolist()
        if hasattr(self._client, "query_points"):
            result = self._client.query_points(
                collection_name=self.collection,
                query=vector,
                limit=limit,
                with_payload=True,
            )
            hits = result.points
        else:
            hits = self._client.search(collection_name=self.collection, query_vector=vector, limit=limit)
        return [
            RetrievedDocument(
                title=str(hit.payload.get("title", "Cricket rules")),
                content=str(hit.payload.get("content", "")),
                source_url=hit.payload.get("source_url"),
                document_id=hit.payload.get("document_id"),
                section=hit.payload.get("section"),
            )
            for hit in hits
            if hit.score >= 0.35
        ]
