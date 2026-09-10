from fastapi import FastAPI
from app.api.cow_prediction import router as cow_prediction_router
from app.core.database import check_db_connection
from app.api.auth import router as auth_router
from app.api.prediction_history import router as prediction_history_router
from contextlib import asynccontextmanager
from app.api.health_guidance import router as health_guidance_router

@asynccontextmanager
async def lifespan(app:FastAPI):
    if check_db_connection():
        print("MongoDB connected successfully.")
    else:
       print("MongoDB connection failed.")
    yield
    print("Shutting down...")

app=FastAPI(title='Cattle Health AI',
            description='AI-based cattle disease prediction and health assistance system',
            version='1.0.0',
            lifespan=lifespan)

# @app.on_event('startup')
# def startup_event():
#     if check_db_connection():
#         print("MongoDB connected successfully.")
#     else:
#         print("MongoDB connection failed.")


app.include_router(cow_prediction_router)
app.include_router(auth_router)
app.include_router(prediction_history_router)
app.include_router(health_guidance_router)

@app.get('/')
def check_health():
    return{
        'message':'Backend running successfully !!'
    }