**Bovicare --- Cattle Healthcare Assistance**

Bovicare is an AI-assisted cattle health platform designed to help
farmers assess animal health, explore disease-related information, and
maintain digital health records. The application combines image-based
cattle disease classification, tabular disease prediction for cattle,
and a retrieval-augmented health guidance assistant.
Important: Bovicare is an assistive information system, not a
replacement for a qualified veterinarian. Predictions and generated
guidance should be reviewed by a veterinary professional, especially
when an animal is seriously ill.

**Project Overview**
Bovicare brings together two disease-prediction approaches and a
knowledge-grounded health assistant:
1. Cattle image classification: A CNN model analyses an uploaded
   cattle image and predicts a disease class supported by the trained
   model.
   The CNN model classifies 3 classes(lumpy, foot and mouth, healthy).
3. Livestock tabular prediction: A machine-learning model uses
   structured animal and symptom information to produce a prediction
   for supported livestock categories.
   The tabular ml model classifies 5 classes. (anthrax, foot and mouth, blackleg, pneumonia, lumpy).
5. Health guidance assistant: A LangGraph-based workflow retrieves
   relevant veterinary knowledge from a Qdrant vector database and can
   use web search for time-sensitive or missing information. Gemini
   generates a response using the collected context.
The backend also supports user authentication and the storage of
prediction and health-report information.

**Core Features**
- Cattle disease prediction from an uploaded image.
- Tabular livestock disease prediction.
- Health guidance grounded in a curated veterinary knowledge base.
- Qdrant semantic retrieval with disease metadata filtering.
- Web-search fallback for recent or time-sensitive questions.
- AI-generated health guidance and report creation.
- User registration and login with email OTP verification.
- MongoDB persistence for application records.

**Technology Stack**

Frontend
- React
- Vite
- JavaScript
- CSS
  
Backend
- Python
- FastAPI
- Uvicorn
- Pydantic
  
Machine Learning and AI
- TensorFlow / Keras — CNN-based cattle image classification.
- Scikit-learn — tabular disease classification.
- Sentence Transformers — text embedding generation.
- LangChain — LLM and retrieval integrations.
- LangGraph — health-agent workflow orchestration.
- Google Gemini — context-grounded health response generation.
  
Authentication and Security
- JWT (JSON Web Tokens) — token-based authentication.
- OAuth 2.0 bearer-token flow — API authentication scheme.
- Email OTP verification — registration and account verification.
- FastAPI security utilities — authentication dependencies and protected routes.
Authentication note: The OAuth 2.0 entry refers to the bearer-token flow used for API authentication. It does not imply Google, Facebook, or other third-party social sign-in unless an external OAuth provider is separately configured.

Data, Retrieval and Web Search
- MongoDB Atlas — application data persistence.
- Qdrant Cloud — vector database for semantic retrieval.
- DDGS (DuckDuckGo Search) — web search for recent or supplementary information.

**Results**

CNN Results:

<img width="1027" height="211" alt="Screenshot 2026-11-01 001055" src="https://github.com/user-attachments/assets/e26b990d-80f5-4c97-b897-7c342633c3d1" />
<img width="482" height="433" alt="Screenshot 2026-11-01 001126" src="https://github.com/user-attachments/assets/4e9490ae-aa40-4ab8-bc1f-e0f3a327c109" />
<img width="482" height="437" alt="Screenshot 2026-11-01 001116" src="https://github.com/user-attachments/assets/a7933a6d-a664-4987-8560-ae6cb97f8ca7" />

Tabular ML Results: 

<img width="650" height="425" alt="Screenshot 2026-11-01 001316" src="https://github.com/user-attachments/assets/a95c0fda-45b3-4645-a193-5e5ad94e5ea7" />
<img width="441" height="207" alt="Screenshot 2026-11-01 001307" src="https://github.com/user-attachments/assets/eeb87623-97b4-468f-be49-225193b41d9a" />

**Notebook Links**

https://colab.research.google.com/drive/1UfUDa02cOYQaTZB0KMkw-w4luKWCPw9J?usp=sharing
https://colab.research.google.com/drive/1mmijYPgOyyDPEfP7Irtifh0mt5KgKtUI?usp=sharing

**WILL BE DEPLOYED AFTER MAKING THE EMBEDDING MODELS EFFICIENT FOR UPLOADING IN FREE MEMORY TIER IN RENDER**

