from pymongo import MongoClient

MONGO_URL='mongodb://localhost:27017'
client=MongoClient(MONGO_URL)
db=client["Livestock_health"]

predictions_collection=db['predictions']
users_collection=db['users']
medicine_collection=db['medicine_records']
reports_collection=db['health_reports']

def check_db_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False