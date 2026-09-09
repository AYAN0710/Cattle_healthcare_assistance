from app.rag.retriever import retrieve_knowledge

question='What are the symptoms of lumpy skin disease?'

documents=retrieve_knowledge(question)

print("\nRetrieved Documents:\n")
for i, document in enumerate(documents, start=1):
    print(f"--- Result {i} ---")
    print(document.page_content)
    print("\nMetadata:")
    print(document.metadata)
    print()