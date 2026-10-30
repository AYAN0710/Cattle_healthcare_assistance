import os
import warnings

# ── Memory optimisations ─────────────────────────────────────────────────────
# These MUST be set before any TensorFlow / keras import happens.
# TF is lazy-loaded (first prediction request), so setting them here is safe.
os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '3')       # suppress TF logs
os.environ.setdefault('OMP_NUM_THREADS', '1')             # limit OpenMP threads
os.environ.setdefault('TF_NUM_INTRAOP_THREADS', '1')      # limit intra-op parallelism
os.environ.setdefault('TF_NUM_INTEROP_THREADS', '1')      # limit inter-op parallelism
# Disable oneDNN custom ops to reduce memory footprint
os.environ.setdefault('TF_ENABLE_ONEDNN_OPTS', '0')
# Stop TF from pre-allocating the entire GPU memory
os.environ.setdefault('TF_FORCE_GPU_ALLOW_GROWTH', 'true')

warnings.filterwarnings('ignore')
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import check_db_connection
from app.api.cow_prediction import router as cow_prediction_router
from app.api.auth import router as auth_router
from app.api.prediction_history import router as prediction_history_router
from app.api.health_guidance import router as health_guidance_router
from app.api.health_report import router as health_report_router
from app.api.tabular_prediction import router as tabular_prediction_router

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://cattle-healthcare-assistance.vercel.app",
        "https://cattle-healthcare-assistance-m02ctwn2s-ayan-4155.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(health_report_router)
app.include_router(tabular_prediction_router)

@app.get('/')
def check_health():
    return{
        'message':'Backend running successfully !!'
    }