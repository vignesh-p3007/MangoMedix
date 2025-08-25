from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
import gdown

# Flask app
app = Flask(__name__)
CORS(app)

# Google Drive model file (✅ use direct download link)
MODEL_URL = "https://drive.google.com/uc?id=1XaKARuL5HE9cZdvGKUKmNqjYrnWLzqdp"
MODEL_PATH = "disease_detector.keras"

# Download model if not exists
if not os.path.exists(MODEL_PATH):
    print("Downloading model from Google Drive...")
    gdown.download(MODEL_URL, MODEL_PATH, quiet=False)

# Load model (disable compile to avoid warnings)
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# Label map
label_map = {
    0: "Anthracnose", 
    1: "Bacterial Canker", 
    2: "Cutting Weevil", 
    3: "Die Back",
    4: "Gall Midge", 
    5: "Healthy", 
    6: "Powdery Mildew", 
    7: "Sooty Mould"
}

# Allowed file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join('uploads', filename)
            os.makedirs('uploads', exist_ok=True)
            file.save(filepath)

            # Preprocess image
            img = load_img(filepath, target_size=(224, 224))
            img_array = img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Predict
            predictions = model.predict(img_array)
            predicted_class = int(np.argmax(predictions))
            confidence = float(predictions[0][predicted_class])

            return jsonify({
                "predicted_class": label_map.get(predicted_class, "Unknown"),
                "confidence": round(confidence, 4)
            })
        else:
            return jsonify({"error": "Invalid file format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
