from pathlib import Path
import os
from dotenv import load_dotenv


BASE_DIR=Path(__file__).resolve().parents[2]
CNN_MODEL_PATH=BASE_DIR/"app"/"ml"/"cow_cnn"/"cattle_disease_model.keras"
CNN_CLASSES_PATH=BASE_DIR/"app"/"ml"/"cow_cnn"/"classes.json"

IMAGE_SIZE=(224,224)

CONFIDENCE_THRESHOLD=0.50
