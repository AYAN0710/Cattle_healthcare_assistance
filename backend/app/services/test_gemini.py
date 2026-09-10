from app.services.gemini_service import generate_health_response


context = """
Lumpy skin disease in cattle can cause:
- Fever
- Firm skin nodules
- Swollen lymph nodes
- Reduced appetite
- Reduced milk production
"""


question = "What are the symptoms of lumpy skin disease in cattle?"

answer = generate_health_response(
    question=question,
    context=context
)

print("\nGemini Response:\n")
print(answer)