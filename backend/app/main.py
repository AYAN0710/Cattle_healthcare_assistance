from fastapi import FastAPI
from app.api.cow_prediction import router as cow_prediction_router
from app.core.database import check_db_connection
from contextlib import asynccontextmanager

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

@app.get('/')
def check_health():
    return{
        'message':'Backend running successfully !!'
    }