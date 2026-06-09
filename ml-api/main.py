import os
import sys

from fastapi import FastAPI, UploadFile, File, HTTPException
import tensorflow as tf
import keras
import numpy as np
import io
from PIL import Image
import uvicorn

app = FastAPI(title="Sigigi Karies Detection API (EfficientNet-B0)")

# ===========================================================
# Monkey-patch BatchNormalization and Dense layers
# Keras 3 removed renorm and added strict kwargs checks.
# We patch them directly on the classes so that the model loads 
# without any deserialization or unrecognized argument errors.
# ===========================================================
from keras.src.layers.normalization.batch_normalization import BatchNormalization
_original_bn_init = BatchNormalization.__init__
def _patched_bn_init(self, *args, **kwargs):
    kwargs.pop('renorm', None)
    kwargs.pop('renorm_clipping', None)
    kwargs.pop('renorm_momentum', None)
    _original_bn_init(self, *args, **kwargs)
BatchNormalization.__init__ = _patched_bn_init
keras.layers.BatchNormalization.__init__ = _patched_bn_init

from keras.src.layers.core.dense import Dense
_original_dense_init = Dense.__init__
def _patched_dense_init(self, *args, **kwargs):
    kwargs.pop('quantization_config', None)
    _original_dense_init(self, *args, **kwargs)
Dense.__init__ = _patched_dense_init
keras.layers.Dense.__init__ = _patched_dense_init

# Load model relative to this file
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "best_efficientnetb0_model.keras")

try:
    model = keras.models.load_model(MODEL_PATH)
    print(f"SUCCESS: Model loaded successfully from: {os.path.abspath(MODEL_PATH)}")
    print(f"   Input shape: {model.input_shape}")
except Exception as e:
    print(f"ERROR: Error loading model: {e}")
    model = None


def preprocess_image(img: Image.Image):
    img = img.resize((224, 224))
    img_array = tf.keras.utils.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


@app.get("/")
def root():
    return {
        "status": "online",
        "model_loaded": model is not None,
        "model_path": os.path.abspath(MODEL_PATH)
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model gagal dimuat. Periksa log server untuk detail error."
        )

    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        processed_img = preprocess_image(img)

        preds = model.predict(processed_img)

        # Binary classification: sigmoid output
        # 0 = karies, 1 = non-karies
        confidence = float(preds[0][0])

        if confidence > 0.5:
            predicted_class = "non-karies"
            confidence_score = confidence
        else:
            predicted_class = "karies"
            confidence_score = 1.0 - confidence

        return {
            "prediction": predicted_class,
            "confidence": round(confidence_score * 100, 2),
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
