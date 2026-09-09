from typing import TypedDict,List
from app.rag.retriever import retrieve_knowledge
from app.rag.web_search import search_web

class HealthState(TypedDict):
    question:str
    qdrant_results:List
    web_results:List
    context:str
    
def retrieve_from_qdrant(state:HealthState):
    documents=retrieve_knowledge(state['question'])
    return {
        'qdrant_results':documents
    }

def check_qdrant_results(state:HealthState):
    if state['qdrant_results']:
        return 'qdrant'
    return 'web'

def search_web_fallback(state:HealthState):
    results=search_web(
        state['question'],max_results=3
    )
    return {
        'web_results':results
    }
    
def build_qdrant_context(state:HealthState):
    context='\n\n'.join(document.page_content for document in state['qdrant_results'])
    return {
        'context':context
    }
    
def build_web_context(state:HealthState):
    context_parts=[]
    for result in state['web_results']:
        context_parts.append(
            f"Title: {result['title']}\n"
            f"URL: {result['url']}\n"
            f"Content: {result['content']}"
        )
    return {
        'context':'\n\n'.join(context_parts)
    }