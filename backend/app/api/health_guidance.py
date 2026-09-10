from fastapi import APIRouter,Depends,HTTPException
from bson import ObjectId
from app.core.database import predictions_collection
from app.core.dependencies import get_current_user
from app.schemas.health import HealthGuidanceRequest,HealthGuidanceResponse
from app.agents.health_agent import health_graph

router=APIRouter(prefix='/health',tags=['Health Guidance'])

@router.post('/guidance',response_model=HealthGuidanceResponse)
def get_health_guidance(request:HealthGuidanceRequest,current_user=Depends(get_current_user)):
    user_id=str(current_user['_id'])
    if not ObjectId.is_valid(request.prediction_id):
        raise HTTPException(
            status_code=400,
            detail='Invalid prediction ID.'
        )
    prediction=predictions_collection.find_one({
        '_id':ObjectId(request.prediction_id),
        'user_id':user_id
    })
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail='Prediction not found.'
        )
        
        
    #user's question if provided else create a question based on predicted disease
    question=request.question
    if not question:
        question=(
            f"What should I know about "
            f"{prediction['disease']} in cattle?"
        )
        
    #langgraph health agent
    result=health_graph.invoke({
        "question": question,
        "qdrant_results": [],
        "web_results": [],
        "context": "",
        "answer": {}
    })
    
    answer=result['answer']
    return {
         "disease": prediction["disease"],
        "confidence": prediction["confidence"],
        "guidance": answer.get("guidance", ""),
        "precautions": answer.get("precautions", []),
        "veterinarian_advice": answer.get("veterinarian_advice", "")
    }