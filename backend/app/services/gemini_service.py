from app.core.llm_config import gemini_client,GEMINI_MODEL

def generate_health_response(question:str,context:str):
    prompt = f"""
You are a livestock health information assistant.

Answer the user's question using the information provided
in the context.

The context may come from:
1. A trusted veterinary knowledge base
2. Recent web search results

If the context comes from web search, you may summarize
the information found there, especially for questions about
latest, recent, current, outbreaks, alerts, or news.

Do not invent facts that are not supported by the context.

Do not invent:
- Symptoms
- Treatments
- Medicines
- Dosages
- Disease outbreaks
- News events
- Veterinary recommendations

For current or recent information, clearly indicate that
the information is based on the available web search results.

Return your response in exactly this JSON structure:

{{
    "guidance": "Clear answer based on the provided context",
    'key_symptoms':['Extract the key clinical symptoms relevant to the predicted disease from the provided context.
Do not invent symptoms that are not supported by the context.
Return the symptoms as a list of short strings.']
    "precautions": [
        "Precaution supported by the context"
    ],
    "veterinarian_advice": "Veterinary advice supported by the context"
}}

If the context genuinely does not contain enough information,
say that the available information is insufficient.

USER QUESTION:
{question}

RETRIEVED CONTEXT:
{context}
"""


    response=gemini_client.models.generate_content(model=GEMINI_MODEL,contents=prompt)
    return response.text