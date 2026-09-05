from fastapi import APIRouter,HTTPException,UploadFile,File
from PIL import Image
import io
from app.ml.cow_cnn.predictor import predict_disease

router=APIRouter(prefix="/predict",tags=["Cow Disease Prediction (Image)"])

@router.post("/cow")
async def predict_cow_disease(file:UploadFile=File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400,detail='Please upload a valid image file.')
    image_bytes=await file.read()
    try:
        image=Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=400,detail='Unable to read the uploaded image.')
    result=predict_disease(image)
    return result

