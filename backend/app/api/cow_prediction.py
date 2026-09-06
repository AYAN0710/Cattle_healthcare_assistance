from fastapi import APIRouter,HTTPException,UploadFile,File,Depends
from PIL import Image
import io
from app.ml.cow_cnn.predictor import predict_disease
from app.schemas.prediction import CowPredictResponse
from app.services.prediction_service import save_cow_prediction
from app.core.dependencies import get_current_user

router=APIRouter(prefix="/predict",tags=["Cow Disease Prediction (Image)"])

@router.post("/cow",response_model=CowPredictResponse)
async def predict_cow_disease(file:UploadFile=File(...),current_user=Depends(get_current_user)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400,detail='Please upload a valid image file.')
    image_bytes=await file.read()
    try:
        image=Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=400,detail='Unable to read the uploaded image.')
    result=predict_disease(image)
    prediction_id=save_cow_prediction(
        user_id=str(current_user['_id']),
        disease=result['disease'],
        confidence=result['confidence']
    )
    return{
        'prediction_id':prediction_id,
        'disease':result['disease'],
        'confidence':result['confidence']
    }

