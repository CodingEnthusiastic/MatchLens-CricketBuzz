from dataclasses import dataclass
from hashlib import sha256
import logging

from app.config import Settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RetrievedDocument:
    title: str
    content: str
    source_url: str | None = None
    document_id: str | None = None
    section: str | None = None


class CricketRetriever:
    def __init__(self, settings: Settings):
        self._settings = settings
        self.collection = settings.qdrant_collection
        self._client = None
        self._encoder = None
        if settings.qdrant_url and settings.qdrant_api_key:
            self.status = "configured"
        else:
            self.status = "not_configured"

    def _get_client(self):
        if self._client is None and self._settings.qdrant_url and self._settings.qdrant_api_key:
            try:
                from qdrant_client import QdrantClient
                self._client = QdrantClient(
                    url=self._settings.qdrant_url,
                    api_key=self._settings.qdrant_api_key,
                    timeout=10,
                )
                self.status = "connected"
            except Exception as exc:
                logger.warning(f"Could not connect to Qdrant: {exc}")
                self.status = f"unavailable: {type(exc).__name__}"
                self._client = None
        return self._client

    def _get_encoder(self):
        if self._encoder is None:
            try:
                import torch
                torch.set_num_threads(1)
                from sentence_transformers import SentenceTransformer
                self._encoder = SentenceTransformer(self._settings.embedding_model)
            except Exception as exc:
                logger.warning(f"Could not load SentenceTransformer: {exc}")
                self._encoder = None
        return self._encoder

    def _ensure_collection(self) -> None:
        client = self._get_client()
        encoder = self._get_encoder()
        if client and encoder:
            from qdrant_client.models import Distance, VectorParams
            size = encoder.get_sentence_embedding_dimension()
            if not client.collection_exists(self.collection):
                client.create_collection(
                    collection_name=self.collection,
                    vectors_config=VectorParams(size=size, distance=Distance.COSINE),
                )

    def index(self, documents: list[RetrievedDocument]) -> int:
        client = self._get_client()
        encoder = self._get_encoder()
        if client is None or encoder is None:
            raise RuntimeError("Qdrant or embedding model is not configured")
        self._ensure_collection()
        from qdrant_client.models import PointStruct
        vectors = encoder.encode([document.content for document in documents]).tolist()
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
        client.upsert(collection_name=self.collection, points=points)
        return len(points)

    def retrieve(self, question: str, limit: int = 3) -> list[RetrievedDocument]:
        client = self._get_client()
        encoder = self._get_encoder()
        if client is None or encoder is None:
            return []
        try:
            vector = encoder.encode(question).tolist()
            if hasattr(client, "query_points"):
                result = client.query_points(
                    collection_name=self.collection,
                    query=vector,
                    limit=limit,
                    with_payload=True,
                )
                hits = result.points
            else:
                hits = client.search(collection_name=self.collection, query_vector=vector, limit=limit)
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
        except Exception as exc:
            logger.warning(f"Error retrieving from Qdrant: {exc}")
            return []
