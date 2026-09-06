from fastapi import APIRouter,Depends,HTTPException
from app.core.dependencies import get_current_user
from app.core.database import predictions_collection
from bson import ObjectId

router=APIRouter(prefix='/predictions',tags=['Prediction History'])

@router.get('/history')
def get_prediction_history(current_user=Depends(get_current_user)):
    user_id=str(current_user['_id'])
    predictions=predictions_collection.find({'user_id':user_id}).sort('created_at',-1)
    history=[]
    for prediction in predictions:
        history.append({
            "prediction_id": str(prediction["_id"]),
            "animal_type": prediction["animal_type"],
            "prediction_module": prediction["prediction_module"],
            "disease": prediction["disease"],
            "confidence": prediction["confidence"],
            "created_at": prediction["created_at"]
        })
    return {
        'predictions':history
    }
    

@router.get('/{prediction_id}')
def get_prediction(prediction_id:str,current_user=Depends(get_current_user)):
    user_id=str(current_user['_id'])
    if not ObjectId.is_valid(prediction_id):
        raise HTTPException(status_code=400,
                            detail='Invalid prediction id.')
        
    prediction=predictions_collection.find_one({
        '_id':ObjectId(prediction_id),
        'user_id':user_id
    })
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail='Prediction not found.'
        )
    
    return {
        "prediction_id": str(prediction["_id"]),
        "animal_type": prediction["animal_type"],
        "prediction_module": prediction["prediction_module"],
        "disease": prediction["disease"],
        "confidence": prediction["confidence"],
        "created_at": prediction["created_at"]
    }