from pydantic import BaseModel,Field

class CowPredictResponse(BaseModel):
    prediction_id:str
    disease:str
    confidence:float=Field(ge=0.0,le=1.0)
    
class TabularPredictRequest(BaseModel):
    age: float=Field(gt=0)
    temperature: float=Field(gt=0)
    symptom_1: str
    symptom_2: str
    symptom_3: str
    
class TabularPredictResponse(BaseModel):
    prediction_id:str
    disease: str
    confidence: float=Field(ge=0.0,le=1.0)