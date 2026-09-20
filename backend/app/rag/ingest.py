from pathlib import Path
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from app.core.rag_config import (
    KNOWLEDGE_BASE_PATH,QDRANT_COLLECTION_NAME,QDRANT_PATH,EMBEDDING_MODEL_NAME,CHUNK_OVERLAP,CHUNK_SIZE
)

def get_disease_from_filename(file_path:Path):
    filename=file_path.stem.lower()
    disease_mapping={
        'lumpy_skin_disease':'lumpy',
        'foot_and_mouth_disease':'foot-and-mouth',
        'healthy_cow':'healthy'
    }
    return disease_mapping.get(filename,'unknown')

def ingest_documents():
    documents=[]
    for file_path in Path(KNOWLEDGE_BASE_PATH).rglob('*.txt'):
        loader=TextLoader(str(file_path),encoding='utf-8')
        
        loaded_documents=loader.load()
        disease=get_disease_from_filename(file_path)
        for document in loaded_documents:
            document.metadata['disease']=disease
            document.metadata['source_file']=file_path.name
        documents.extend(loaded_documents)
        
    if not documents:
        print("No knowledge documents found.")
        return
    print(f'Loaded {len(documents)} documents.')
    
    text_splitter=RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE,chunk_overlap=CHUNK_OVERLAP)
    chunks=text_splitter.split_documents(documents)
    print(f'Created {len(chunks)} chunks.')
    
    embeddings=HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    
    QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        path=QDRANT_PATH,
        collection_name=QDRANT_COLLECTION_NAME
    )
    print( f"Successfully indexed {len(chunks)} chunks "f"into Qdrant.")
        
if __name__ == "__main__":
    ingest_documents()