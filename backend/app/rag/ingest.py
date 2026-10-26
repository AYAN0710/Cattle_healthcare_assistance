
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from qdrant_client import QdrantClient

from app.core.rag_config import (
    KNOWLEDGE_BASE_PATH,
    QDRANT_COLLECTION_NAME,
    EMBEDDING_MODEL_NAME,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not QDRANT_URL or not QDRANT_API_KEY:
    raise RuntimeError(
        "QDRANT_URL and QDRANT_API_KEY must be configured."
    )

DISEASE_MAPPING = {
    "lumpy_skin_disease.txt": "lumpy_skin",
    "foot_and_mouth_disease.txt": "foot_and_mouth",
    "healthy_cow.txt": "healthy",
    "blackleg.txt": "blackleg",
    "anthrax.txt": "anthrax",
    "pneumonia.txt": "pneumonia",
}


def ingest_documents():
    knowledge_path = Path(KNOWLEDGE_BASE_PATH)

    if not knowledge_path.exists():
        raise FileNotFoundError(
            f"Knowledge base directory not found: {knowledge_path}"
        )

    documents = []

    for file_path in knowledge_path.glob("*.txt"):
        text = file_path.read_text(encoding="utf-8").strip()

        if not text:
            continue

        disease = DISEASE_MAPPING.get(file_path.name)

        if not disease:
            print(f"Skipping unmapped file: {file_path.name}")
            continue

        documents.append(
            Document(
                page_content=text,
                metadata={
                    "disease": disease,
                    "source": file_path.name,
                },
            )
        )

    if not documents:
        raise ValueError("No mapped, non-empty knowledge files found.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME
    )

    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        timeout=60,
    )

    try:
        if client.collection_exists(QDRANT_COLLECTION_NAME):
            raise RuntimeError(
                f"Collection '{QDRANT_COLLECTION_NAME}' already exists. "
                "Not overwriting existing cloud data."
            )

        QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            collection_name=QDRANT_COLLECTION_NAME,
            force_recreate=False,
        )

        print(
            f"Successfully uploaded {len(chunks)} chunks "
            f"from {len(documents)} files to Qdrant Cloud."
        )
    finally:
        client.close()


if __name__ == "__main__":
    ingest_documents()
