from fastapi import APIRouter,Depends
from app.core.dependencies import get_current_user
from app.schemas.prediction import TabularPredictRequest,TabularPredictResponse
from app.ml.tabular.predictor import predict_disease
from app.services.prediction_service import save_tabular_prediction

router=APIRouter(
    prefix='/predict',
    tags=['Tabular Disease prediction']
)

@router.post('/tabular',response_model=TabularPredictResponse)
def predict_tabular(request: TabularPredictRequest, current_user=Depends(get_current_user)):
    result=predict_disease(request.model_dump())
    prediction_id=save_tabular_prediction(
        user_id=str(current_user["_id"]),
        disease=result["disease"],
        confidence=result["confidence"],
        input_data=request.model_dump()
    )
    return {
        'prediction_id':prediction_id,
        'disease':result['disease'],
        'confidence':result['confidence']
    }