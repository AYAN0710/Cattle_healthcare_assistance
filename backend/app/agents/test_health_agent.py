from app.agents.health_agent import health_graph

def test_health_agent(question: str):

    print("\n========================================")
    print("QUESTION")
    print("========================================")
    print(question)

    result = health_graph.invoke({
        "question": question,
        "qdrant_results": [],
        "web_results": [],
        "context": "",
        "answer": ""
    })

    print("\n========================================")
    print("FINAL ANSWER")
    print("========================================")
    print(result["answer"])


if __name__ == "__main__":

    # This should primarily use Qdrant.
    test_health_agent(
        "What are the symptoms of lumpy skin disease in cattle?"
    )

    #web fallback
    test_health_agent(
        "What are the latest livestock disease alerts in India?"
    )