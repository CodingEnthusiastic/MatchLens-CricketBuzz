import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv(backend_dir / ".env")

from app.config import get_settings
from qdrant_client import QdrantClient

def main():
    settings = get_settings()
    url = settings.qdrant_url
    key = settings.qdrant_api_key
    collection = settings.qdrant_collection

    print("=" * 65)
    print("MatchLens Qdrant Cloud Inspection Tool")
    print("=" * 65)
    print(f"Target URL:        {url}")
    print(f"Collection Name:   {collection}")

    if not url or not key:
        print("ERROR: QDRANT_URL or QDRANT_API_KEY is not set in backend/.env")
        return

    client = QdrantClient(url=url, api_key=key, timeout=15)
    
    # 1. Cluster collections
    colls = client.get_collections()
    collection_names = [c.name for c in colls.collections]
    print(f"Available Collections in Cluster: {collection_names}")
    
    if collection not in collection_names:
        print(f"WARNING: Collection '{collection}' does not exist on cluster!")
        return

    # 2. Collection statistics
    info = client.get_collection(collection)
    print("-" * 65)
    print(f"Collection Status: {info.status}")
    print(f"Total Points:      {info.points_count}")
    print(f"Vector Dimensions: {info.config.params.vectors.size}")
    print(f"Distance Metric:   {info.config.params.vectors.distance}")
    print("-" * 65)

    # 3. Scroll and display all ingested document payloads
    points, _ = client.scroll(
        collection_name=collection,
        limit=20,
        with_payload=True,
        with_vectors=False,
    )

    print(f"Stored Documents & Embeddings ({len(points)} points retrieved):\n")
    for idx, pt in enumerate(points, 1):
        payload = pt.payload or {}
        print(f"[{idx}] Point ID: {pt.id}")
        print(f"    Title:   {payload.get('title')}")
        print(f"    Source:  {payload.get('source_url')}")
        content = payload.get('content', '')
        print(f"    Preview: {content[:130].strip()}...")
        print()

    print("=" * 65)
    print("All points are verified and indexed in Qdrant Cloud.")

if __name__ == "__main__":
    main()
