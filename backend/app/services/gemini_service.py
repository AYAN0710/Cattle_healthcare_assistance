from app.core.llm_config import gemini_client, GEMINI_MODEL


def generate_health_response(
    question: str,
    context: str,
    predicted_disease: str
):

    prompt = f"""
You are a livestock health information assistant.

Your task is to provide health information ONLY about the
predicted disease.

PREDICTED DISEASE:
{predicted_disease}

IMPORTANT DISEASE CONSTRAINT:
- The predicted disease is the primary constraint.
- Use ONLY information relevant to {predicted_disease}.
- Do NOT mix information from other diseases.
- Ignore retrieved context that clearly belongs to another disease.
- Do not transfer symptoms from another disease.
- Do not transfer precautions from another disease.
- Do not transfer treatments or veterinary advice from another disease.

The context may come from:
1. A trusted veterinary knowledge base
2. Recent web search results

Use only information supported by the retrieved context.

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

KEY SYMPTOMS:
Extract only clinical symptoms that are explicitly supported
by the context AND relevant to the predicted disease.

If the context does not contain reliable disease-specific
symptoms, return an empty list.

PRECAUTIONS:
Extract only precautions supported by the context and
relevant to the predicted disease.

If the context does not contain enough information,
say that the available information is insufficient.

Return ONLY valid JSON in exactly this structure:

{{
    "guidance": "Clear answer based on the provided context",
    "key_symptoms": [
        "Disease-specific symptom"
    ],
    "precautions": [
        "Disease-specific precaution"
    ],
    "veterinarian_advice": "Veterinary advice supported by the context"
}}

USER QUESTION:
{question}

RETRIEVED CONTEXT:
{context}
"""

    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    return response.text