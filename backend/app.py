from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS  # Import CORS

# Load the trained model
model = tf.keras.models.load_model("disease_detector.h5")

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)  # Allow all domains, or you can pass specific options like CORS(app, origins=["http://localhost"])

# Define label mapping (update this with your labels)
label_map = {0: "Anthracnose", 1: "Bacterial Canker", 2: "Cutting Weevil", 3: "Die Back", 
             4: "Gall Midge", 5: "Healthy", 6: "Powdery Mildew", 7: "Sooty Mould"}  # Update with actual class names

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Function to check if the file is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Homepage route
@app.route("/")
def index():
    return render_template("index.html")

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Save the file temporarily
            filename = secure_filename(file.filename)
            filepath = os.path.join('uploads', filename)  # Save in a directory called 'uploads'
            file.save(filepath)

            # Load and preprocess the image
            img = load_img(filepath, target_size=(224, 224))  # Update to match your model input size
            img_array = img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Make prediction
            predictions = model.predict(img_array)
            predicted_class = np.argmax(predictions)
            confidence = predictions[0][predicted_class]

            # Return result
            return jsonify({
                "predicted_class": label_map[predicted_class],
                "confidence": float(confidence)
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid file format. Only .jpg, .jpeg, .png, .gif are allowed"}), 400

if __name__ == '__main__':
    # Ensure the 'uploads' directory exists
    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    app.run(debug=True)
