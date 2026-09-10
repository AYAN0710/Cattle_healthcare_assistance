from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from langchain_qdrant import QdrantVectorStore
from app.core.rag_config import QDRANT_PATH,QDRANT_COLLECTION_NAME,EMBEDDING_MODEL_NAME

embeddings=HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

client=QdrantClient(path=QDRANT_PATH)

vector_store=QdrantVectorStore(
    client=client,
    collection_name=QDRANT_COLLECTION_NAME,
    embedding=embeddings
)

retriever=vector_store.as_retriever(search_kwargs={'k':6})

def retrieve_knowledge(question:str):
    documents=retriever.invoke(question)
    return documents
