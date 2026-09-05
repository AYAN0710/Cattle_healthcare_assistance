import json
import numpy as np
import tensorflow as tf
from PIL import Image
from app.core.config import CNN_CLASSES_PATH,CNN_MODEL_PATH,IMAGE_SIZE

model=tf.keras.models.load_model(CNN_MODEL_PATH)
with open(CNN_CLASSES_PATH,"r") as file:
    classes=json.load(file)

def predict_disease(image: Image.Image):
    image=image.resize(IMAGE_SIZE)
    image=image.convert("RGB")
    image_array=np.array(image)
    image_array=np.expand_dims(image_array,axis=0)
    predictions=model.predict(image_array,verbose=1)
    predicted_index=np.argmax(predictions[0])
    confidence=float(predictions[0][predicted_index])
    disease=classes[str(predicted_index)]
    return {
        "disease":disease,
        "confidence":confidence
    }