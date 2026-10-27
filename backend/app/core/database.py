# import os
# from pymongo import MongoClient

# MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
# db = client["Livestock_health"]

import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000
)

db = client["Livestock_health"]

predictions_collection=db['predictions']
users_collection=db['users']
medicine_collection=db['medicine_records']
reports_collection=db['health_reports']
otp_collection=db['otp_verification']

def check_db_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False