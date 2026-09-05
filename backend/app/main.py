from fastapi import FastAPI
from app.api.cow_prediction import router as cow_prediction_router

app=FastAPI(title='Cattle Health AI',
            description='AI-based cattle disease prediction and health assistance system',
            version='1.0.0')

app.include_router(cow_prediction_router)

@app.get('/')
def check_health():
    return{
        'message':'Backend running successfully !!'
    }