from app.core.llm_config import gemini_client,GEMINI_MODEL

def generate_health_response(question:str,context:str):
    prompt = f"""
You are a livestock health information assistant.

Answer the user's question using ONLY the veterinary
information provided in the context.

Do not invent:
- Symptoms
- Treatments
- Medicines
- Dosages
- Precautions
- Veterinary recommendations

If the context does not contain enough information,
clearly state that the available information is insufficient.

Return your response in exactly this JSON structure:

{{
    "guidance": "Clear explanation based on the context",
    "precautions": [
        "Precaution supported by the context",
        "Another precaution supported by the context"
    ],
    "veterinarian_advice": "Veterinary advice supported by the context"
}}

If the context does not provide specific precautions or
veterinary advice, return an empty list or clearly state
that sufficient information is unavailable.

USER QUESTION:
{question}

VETERINARY CONTEXT:
{context}
"""


    response=gemini_client.models.generate_content(model=GEMINI_MODEL,contents=prompt)
    return response.text