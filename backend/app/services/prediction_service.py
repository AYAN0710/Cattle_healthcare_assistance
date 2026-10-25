from datetime import datetime,timezone
from app.core.database import predictions_collection

def save_cow_prediction(user_id:str,disease:str,confidence:float):
    prediction_document={
        'user_id':user_id,
        'animal_type':'cow',
        'prediction_module':'cnn',
        'disease':disease,
        'confidence':confidence,
        'created_at':datetime.now(timezone.utc)
    }
    result=predictions_collection.insert_one(prediction_document)
    return str(result.inserted_id)

def save_tabular_prediction(user_id:str,disease:str,confidence:float, input_data:dict):
    prediction_document={
        'user_id':user_id,
        'animal_type':'cow',
        'prediction_module':'tabular_ml',
        'disease':disease,
        'confidence':confidence,
        'input_data':input_data,
        'created_at':datetime.now(timezone.utc)
    }
    result=predictions_collection.insert_one(prediction_document)
    return str(result.inserted_id)