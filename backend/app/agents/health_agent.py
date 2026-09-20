from typing import TypedDict,List
from app.rag.retriever import retrieve_knowledge
from app.rag.web_search import search_web
from langgraph.graph import StateGraph,START,END
from app.services.gemini_service import generate_health_response
import json

class HealthState(TypedDict):
    question:str
    qdrant_results:List
    web_results:List
    context:str
    answer:dict
    predicted_disease: str
    
def retrieve_from_qdrant(state:HealthState):
    
    # print("\n===== HEALTH AGENT INPUT =====")
    # print("QUESTION:", state["question"])
    # print("PREDICTED DISEASE:", state["predicted_disease"])
    # print("==============================\n")
    
    documents=retrieve_knowledge(state['question'],state['predicted_disease'])
    return {
        'qdrant_results':documents
    }

def check_qdrant_results(state: HealthState):
    question = state["question"].lower()

    web_keywords = [
        "latest",
        "recent",
        "current",
        "today",
        "news",
        "alert",
        "outbreak",
        "outbreaks",
        "reported",
        "this week"
    ]

    if any(keyword in question for keyword in web_keywords):
        print("AGENT ROUTE: WEB SEARCH")
        return "web"

    if state["qdrant_results"]:
        print("AGENT ROUTE: QDRANT")
        return "qdrant"

    print("AGENT ROUTE: WEB SEARCH")
    return "web"

def search_web_fallback(state: HealthState):
    print("\nAGENT ROUTE: WEB SEARCH")

    results = search_web(
        state["question"],
        max_results=3
    )
    print(f"WEB RESULTS FOUND: {len(results)}")

    return { "web_results": results}
    
def build_qdrant_context(state:HealthState):
    context='\n\n'.join(document.page_content for document in state['qdrant_results'])
    return {
        'context':context
    }
    
def build_web_context(state: HealthState):
    context_parts = []

    for result in state["web_results"]:
        context_parts.append(
            f"Title: {result['title']}\n"
            f"URL: {result['url']}\n"
            f"Content: {result['content']}"
        )
    context = "\n\n".join(context_parts)
    print("\nWEB CONTEXT CREATED")
    print(context[:1000])
    return {"context": context}
    
def generate_answer(state: HealthState):
    # Generate the response from Gemini
    raw_answer = generate_health_response(
        question=state["question"],
        context=state["context"],
        predicted_disease=state["predicted_disease"]
    )

    try:
        # Remove Markdown code fences if Gemini returns ```json ... ```
        cleaned_answer = raw_answer.strip()

        if cleaned_answer.startswith("```"):
            cleaned_answer = cleaned_answer.replace("```json", "", 1)
            cleaned_answer = cleaned_answer.replace("```", "", 1)
            cleaned_answer = cleaned_answer.strip()

        # Convert JSON text into a Python dictionary
        answer = json.loads(cleaned_answer)

    except (json.JSONDecodeError, TypeError):
        # Keep a safe fallback if Gemini returns invalid JSON
        answer = {
            "guidance": raw_answer,
            "precautions": [],
            "veterinarian_advice": (
                "The available information should be reviewed "
                "with a qualified veterinarian."
            )
        }

    return {"answer": answer}
    
workflow=StateGraph(HealthState)

workflow.add_node('qdrant',retrieve_from_qdrant)
workflow.add_node("web_search",search_web_fallback)
workflow.add_node('qdrant_context',build_qdrant_context)
workflow.add_node('web_context',build_web_context)
workflow.add_node('generate_answer',generate_answer)


#graph structure
workflow.add_edge(START,'qdrant')
workflow.add_conditional_edges('qdrant',
                               check_qdrant_results,
                               {
                                   'qdrant':'qdrant_context',
                                   'web':'web_search'
                               })
workflow.add_edge('qdrant_context','generate_answer')
workflow.add_edge('web_search','web_context')
workflow.add_edge("web_context","generate_answer")
workflow.add_edge('generate_answer',END)

health_graph=workflow.compile()