
import os
from functools import lru_cache

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.core.rag_config import (
    QDRANT_COLLECTION_NAME,
    EMBEDDING_MODEL_NAME,
)

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")


def validate_qdrant_config():
    if not QDRANT_URL or not QDRANT_API_KEY:
        raise RuntimeError(
            "QDRANT_URL and QDRANT_API_KEY must be configured."
        )


@lru_cache(maxsize=1)
def get_embeddings():
    validate_qdrant_config()
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME
    )


@lru_cache(maxsize=1)
def get_vector_store():
    validate_qdrant_config()

    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        timeout=30,
    )

    return QdrantVectorStore(
        client=client,
        collection_name=QDRANT_COLLECTION_NAME,
        embedding=get_embeddings(),
    )


def retrieve_knowledge(
    question: str,
    disease: str | None = None,
):
    search_kwargs = {"k": 10}

    if disease:
        search_kwargs["filter"] = Filter(
            must=[
                FieldCondition(
                    key="metadata.disease",
                    match=MatchValue(value=disease),
                )
            ]
        )

    retriever = get_vector_store().as_retriever(
        search_kwargs=search_kwargs
    )

    return retriever.invoke(question)
