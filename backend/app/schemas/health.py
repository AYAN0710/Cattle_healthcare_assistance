from pydantic import BaseModel,Field
from typing import List

class HealthGuidanceRequest(BaseModel):
    prediction_id:str
    question: str | None=None
    
class HealthGuidanceResponse(BaseModel):
    disease:str
    confidence: float=Field(ge=0.0,le=1.0)
    guidance:str
    precautions: List[str]
    veterinarian_advice: str
    