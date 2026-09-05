from datetime import datetime,timezone
from app.core.database import predictions_collection

def save_cow_prediction(disease:str,confidence:float):
    prediction_document={
        'animal_type':'cow',
        'prediction_module':'cnn',
        'disease':disease,
        'confidence':confidence,
        'created_at':datetime.now(timezone.utc)
    }
    result=predictions_collection.insert_one(prediction_document)
    return str(result.inserted_id)