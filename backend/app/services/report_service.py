from datetime import datetime,timezone
from app.core.database import reports_collection

def save_health_report(user_id:str,prediction_id:str,report:dict):
    report_document={
        'user_id':user_id,
        'prediction_id':prediction_id,
        'report':report,
        'created_at':datetime.now(timezone.utc)
    }
    result=reports_collection.insert_one(report_document)
    return str(result.inserted_id)