import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY=os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    raise ValueError('API not responding.')

gemini_client=genai.Client(api_key=GEMINI_API_KEY)

GEMINI_MODEL='gemini-3.5-flash-lite'