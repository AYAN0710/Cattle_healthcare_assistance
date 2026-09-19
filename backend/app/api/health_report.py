from fastapi import APIRouter,HTTPException,Depends
from bson import ObjectId
from pydantic import BaseModel
from app.core.database import predictions_collection
from app.agents.report_agent import generate_health_report
from app.core.dependencies import get_current_user
from app.agents.health_agent import health_graph

router=APIRouter(prefix='/health-report',tags=['Health Report'])

class HealthReportRequest(BaseModel):
    prediction_id:str
    

@router.post('/generate')
def generate_report(request:HealthReportRequest,current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(request.prediction_id):
       raise HTTPException(
           status_code=400,
           detail='Invalid prediction ID'
       )
    prediction=predictions_collection.find_one({
         "_id": ObjectId(request.prediction_id),
        "user_id": str(current_user["_id"])
    })
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail='Prediction not found.'
        )
    
    health_result = health_graph.invoke({
    "question": f"Provide health guidance for {prediction['disease']}."
    })

    health_answer = health_result["answer"]

    report = generate_health_report(
    disease=prediction["disease"],
    confidence=prediction["confidence"],
    guidance=health_answer["guidance"],
    key_symptoms=health_answer.get("key_symptoms", []),
    precautions=health_answer["precautions"],
    veterinarian_advice=health_answer["veterinarian_advice"]
)
    return report