
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore

from app.core.rag_config import (
    KNOWLEDGE_BASE_PATH,
    QDRANT_COLLECTION_NAME,
    EMBEDDING_MODEL_NAME,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)

load_dotenv()

url = os.getenv("QDRANT_URL")
api_key = os.getenv("QDRANT_API_KEY")

if not url or not api_key:
    raise RuntimeError("QDRANT_URL and QDRANT_API_KEY must be configured.")

file_path = Path(KNOWLEDGE_BASE_PATH) / "healthy_cow.txt"

if not file_path.exists():
    raise FileNotFoundError(f"File not found: {file_path}")

text = file_path.read_text(encoding="utf-8").strip()

if not text:
    raise ValueError("health_cow.txt is empty.")

document = Document(
    page_content=text,
    metadata={"disease": "healthy", "source": "healthy_cow.txt"},
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)
chunks = splitter.split_documents([document])

embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL_NAME
)

vector_store = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    url=url,
    api_key=api_key,
    collection_name=QDRANT_COLLECTION_NAME,
)

vector_store.add_documents(chunks)

print(f"Uploaded {len(chunks)} healthy knowledge chunks.")
