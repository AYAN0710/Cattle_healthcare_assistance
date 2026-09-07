from pathlib import Path

BASE_DIR=Path(__file__).resolve().parents[2]
KNOWLEDGE_BASE_PATH=BASE_DIR/"data"/"knowledge_base"

QDRANT_PATH=str(BASE_DIR/'data'/'qdrant')
QDRANT_COLLECTION_NAME='cow_disease_knowledge'

EMBEDDING_MODEL_NAME="intfloat/multilingual-e5-small"

CHUNK_SIZE=500
CHUNK_OVERLAP=50



