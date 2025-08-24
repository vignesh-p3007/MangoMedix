from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
import gdown  # to download from Google Drive

# Flask app
app = Flask(__name__)
CORS(app)

# Google Drive model file ID
MODEL_URL = "https://drive.google.com/uc?id=1IR_KaRTu36PF7MKqXWnoakgL6z2iGNpX"
MODEL_PATH = "disease_detector.h5"

# Download the model if not already present
if not os.path.exists(MODEL_PATH):
    print("Downloading model from Google Drive...")
    gdown.download(MODEL_URL, MODEL_PATH, quiet=False)

# Load the trained model
model = tf.keras.models.load_model(MODEL_PATH)

# Label mapping
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

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Save file temporarily
            filename = secure_filename(file.filename)
            filepath = os.path.join('uploads', filename)
            if not os.path.exists('uploads'):
                os.makedirs('uploads')
            file.save(filepath)

            # Preprocess image
            img = load_img(filepath, target_size=(224, 224))  # change if your model uses other size
            img_array = img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Predict
            predictions = model.predict(img_array)
            predicted_class = np.argmax(predictions)
            confidence = predictions[0][predicted_class]

            return jsonify({
                "predicted_class": label_map[predicted_class],
                "confidence": float(confidence)
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid file format. Only jpg, jpeg, png, gif allowed"}), 400

if __name__ == '__main__':
    app.run(debug=True)
