from app.core.llm_config import gemini_client, GEMINI_MODEL
import json


def generate_health_response(
    question: str,
    context: str,
    predicted_disease: str
) -> str:

    disease_display = predicted_disease.replace("-", " ").replace("_", " ").title()

    prompt = f"""You are an expert livestock veterinary health assistant for cattle farmers.

PREDICTED DISEASE: {predicted_disease} ({disease_display})

STRICT RULES:
- Answer ONLY about "{predicted_disease}" disease. Do NOT mix information from other diseases.
- Base your response ONLY on the provided RETRIEVED CONTEXT below.
- Do NOT invent symptoms, treatments, medicines, dosages, or statistics.
- If the question is completely unrelated to cattle health or {predicted_disease}, set guidance to: "This question is not related to {disease_display} in cattle. Please ask about the detected condition."
- If context is insufficient, clearly say so instead of guessing.

USER QUESTION: {question}

RETRIEVED CONTEXT:
{context if context.strip() else "No specific context was retrieved. Provide general well-known facts about " + predicted_disease + " in cattle only."}

Based on the above, provide a thorough, farmer-friendly response. Return ONLY valid JSON (no markdown, no code fences) in EXACTLY this structure:

{{
    "guidance": "A clear, detailed 2-4 sentence overview of {disease_display} answering the user's question. Be specific and practical.",
    "key_symptoms": [
        "Specific symptom 1 relevant to {predicted_disease}",
        "Specific symptom 2",
        "Specific symptom 3"
    ],
    "precautions": [
        "Actionable precaution or management step 1",
        "Actionable precaution or management step 2",
        "Actionable precaution or management step 3"
    ],
    "veterinarian_advice": "Specific advice on when and why a farmer should urgently call a vet for {disease_display}. Be direct and practical."
}}
"""

    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    raw = response.text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```", 2)[-1] if raw.count("```") >= 2 else raw
        raw = raw.replace("```json", "").replace("```", "").strip()

    # Validate it's parseable JSON before returning
    try:
        json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        # Return a safe structured fallback as JSON string
        fallback = {
            "guidance": raw if raw else f"Information about {disease_display} could not be retrieved at this time.",
            "key_symptoms": [],
            "precautions": [],
            "veterinarian_advice": "Please consult a qualified veterinarian for professional advice on this condition."
        }
        return json.dumps(fallback)

    return raw