from pydantic import BaseModel, Field
from typing import List, Optional

class HealthGuidanceRequest(BaseModel):
    prediction_id: str
    question: str | None = None

class HealthGuidanceResponse(BaseModel):
    disease: str
    confidence: float = Field(ge=0.0, le=1.0)
    guidance: str
    key_symptoms: List[str] = []
    precautions: List[str]
    veterinarian_advice: str