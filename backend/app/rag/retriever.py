from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from langchain_qdrant import QdrantVectorStore
from app.core.rag_config import QDRANT_PATH,QDRANT_COLLECTION_NAME,EMBEDDING_MODEL_NAME
from qdrant_client.models import Filter, FieldCondition, MatchValue

embeddings=HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

client=QdrantClient(path=QDRANT_PATH)

vector_store=QdrantVectorStore(
    client=client,
    collection_name=QDRANT_COLLECTION_NAME,
    embedding=embeddings
)

# points = client.scroll(
#     collection_name=QDRANT_COLLECTION_NAME,
#     limit=10,
#     with_payload=True
# )

# print("\n===== QDRANT PAYLOADS =====")

# for point in points[0]:
#     print(point.payload)

# print("===========================\n")


def retrieve_knowledge(question:str,disease: str|None=None):
    search_kwargs={'k':10}
    if disease:
        search_kwargs['filter']=Filter(
            must=[
                FieldCondition(
                    key='metadata.disease',
                    match=MatchValue(value=disease)
                )
            ]
        )
    retriever=vector_store.as_retriever(search_kwargs=search_kwargs)
    documents=retriever.invoke(question)
    
    

    # print("\n===== QDRANT RESULTS =====")

    # for i, document in enumerate(documents):
    #     print(f"\n--- RESULT {i + 1} ---")
    #     print("DISEASE:", document.metadata.get("disease"))
    #     print("SOURCE:", document.metadata.get("source_file"))
    #     print(document.page_content[:500])

    # print("\n==========================\n")

    return documents
    
    
