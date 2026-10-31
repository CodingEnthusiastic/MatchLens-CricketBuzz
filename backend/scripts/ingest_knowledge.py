import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv(backend_dir / ".env")

from app.config import get_settings
from app.services.rag import CricketRetriever, RetrievedDocument


def parse_knowledge_file(file_path: Path) -> list[RetrievedDocument]:
    text = file_path.read_text(encoding="utf-8")
    sections = text.split("---")
    docs = []
    for section in sections:
        section = section.strip()
        if not section:
            continue
        
        lines = section.split("\n")
        title = "Cricket Knowledge"
        source = "MCC / ICC Rules"
        section_name = "General"
        doc_id = None
        content_lines = []
        
        for line in lines:
            line_stripped = line.strip()
            if line_stripped.startswith("[DOCUMENT:") and line_stripped.endswith("]"):
                doc_id = line_stripped[10:-1].strip()
            elif line_stripped.startswith("Title:"):
                title = line_stripped[6:].strip()
            elif line_stripped.startswith("Section:"):
                section_name = line_stripped[8:].strip()
            elif line_stripped.startswith("Source:"):
                source = line_stripped[7:].strip()
            else:
                content_lines.append(line)
        
        content = "\n".join(content_lines).strip()
        if content:
            docs.append(
                RetrievedDocument(
                    document_id=doc_id or title.lower().replace(" ", "_"),
                    title=title,
                    section=section_name,
                    source_url=source,
                    content=content,
                )
            )
    return docs


def main():
    settings = get_settings()
    print(f"Connecting to Qdrant cluster: {settings.qdrant_url}")
    print(f"Target collection: {settings.qdrant_collection}")
    
    retriever = CricketRetriever(settings)
    if retriever._client is None or retriever._encoder is None:
        print(f"Error: Retriever not configured or failed to initialize! Status: {retriever.status}")
        sys.exit(1)
        
    knowledge_dir = backend_dir / "app" / "data" / "knowledge"
    if not knowledge_dir.exists():
        print(f"Error: {knowledge_dir} does not exist!")
        sys.exit(1)
        
    all_docs = []
    for txt_file in knowledge_dir.glob("*.txt"):
        print(f"Parsing: {txt_file.name}")
        docs = parse_knowledge_file(txt_file)
        all_docs.extend(docs)
        print(f"  -> Extracted {len(docs)} documents.")
        
    print(f"\nTotal documents to index: {len(all_docs)}")
    indexed_count = retriever.index(all_docs)
    print(f"Successfully indexed and upserted {indexed_count} points to Qdrant collection '{settings.qdrant_collection}'!")
    
    # Verification
    info = retriever._client.get_collection(settings.qdrant_collection)
    print(f"\n[Verification from Qdrant Cloud]")
    print(f"Collection status: {info.status}")
    print(f"Points count in collection: {info.points_count}")
    
    # Test sample search
    print("\n[Testing sample semantic query: 'What happens on a free hit after a no ball?']")
    test_results = retriever.retrieve("What happens on a free hit after a no ball?", limit=2)
    for i, res in enumerate(test_results, 1):
        print(f"Hit #{i}: {res.title} (Source: {res.source_url})")
        print(f"Excerpt: {res.content[:140]}...\n")


if __name__ == "__main__":
    main()
