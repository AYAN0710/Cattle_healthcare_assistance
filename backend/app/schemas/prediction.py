from pydantic import BaseModel,Field

class CowPredictResponse(BaseModel):
    prediction_id:str
    disease:str
    confidence:float=Field(ge=0.0,le=1.0)