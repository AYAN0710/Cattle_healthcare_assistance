import joblib 
import pandas as pd
import json

from app.core.config import TABULAR_MODEL_PATH

CLASSES_PATH = TABULAR_MODEL_PATH.parent / 'classes.json'

# Lazy singleton — loaded only on first request
_model = None


def _get_model():
    global _model
    if _model is None:
        _model = joblib.load(TABULAR_MODEL_PATH)
    return _model

def predict_disease(data: dict) -> dict:
    model = _get_model()
    # Match the exact feature names used during training
    input_df = pd.DataFrame([{
        "Age": data["age"],
        "Temperature": data["temperature"],
        "Symptom 1": data["symptom_1"],
        "Symptom 2": data["symptom_2"],
        "Symptom 3": data["symptom_3"]
    }])

    # Predict disease name directly
    disease = str(model.predict(input_df)[0])

    # Calculate confidence if the model supports probabilities
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(input_df)[0]
        confidence = float(max(probabilities))
    else:
        confidence = 0.0

    return {
        "disease": disease,
        "confidence": confidence
    }