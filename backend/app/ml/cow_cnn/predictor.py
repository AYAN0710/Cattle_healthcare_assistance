import json
import numpy as np
import tensorflow as tf
from PIL import Image
from app.core.config import CNN_CLASSES_PATH, CNN_MODEL_PATH, IMAGE_SIZE, CONFIDENCE_THRESHOLD

# Prevent TF from pre-allocating all memory (important on memory-constrained servers)
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)

model = tf.keras.models.load_model(CNN_MODEL_PATH)
with open(CNN_CLASSES_PATH, "r") as file:
    classes = json.load(file)


def predict_disease(image: Image.Image):
    image = image.resize(IMAGE_SIZE)
    image = image.convert("RGB")
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)
    predictions = model.predict(image_array, verbose=0)
    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index])

    # If confidence is below threshold, the image is likely not a cattle image
    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "disease": "not_cattle",
            "confidence": confidence,
            "message": (
                "The uploaded image does not appear to be a cattle image, "
                "or the model could not confidently identify a disease. "
                "Please upload a clear photo of cattle."
            ),
        }

    disease = classes[str(predicted_index)]
    return {
        "disease": disease,
        "confidence": confidence,
        "message": None,
    }