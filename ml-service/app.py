import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'crop_model.pkl')
model = None

def load_ml_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print(f"[ML Service] Successfully loaded model from {MODEL_PATH}")
        except Exception as e:
            print(f"[ML Service Error] Failed to load model: {str(e)}")
    else:
        print(f"[ML Service Warning] Model file not found at {MODEL_PATH}. Please run train_model.py first.")

# Load model on startup
load_ml_model()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy" if model is not None else "degraded",
        "model_loaded": model is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "ML model is not loaded. Please train the model first."}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input JSON data provided."}), 400

    required_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    missing_features = [feat for feat in required_features if feat not in data or data[feat] is None]

    if missing_features:
        return jsonify({
            "error": f"Missing required parameters: {', '.join(missing_features)}"
        }), 400

    try:
        # Create DataFrame with feature names matching training data
        import pandas as pd
        features_df = pd.DataFrame([{
            'N': float(data['N']),
            'P': float(data['P']),
            'K': float(data['K']),
            'temperature': float(data['temperature']),
            'humidity': float(data['humidity']),
            'ph': float(data['ph']),
            'rainfall': float(data['rainfall'])
        }])

        # Predict using Random Forest Model
        prediction = model.predict(features_df)
        predicted_crop = str(prediction[0])

        return jsonify({
            "predicted_crop": predicted_crop
        }), 200

    except Exception as e:
        return jsonify({"error": f"Prediction model execution error: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"[ML Service] Starting Flask service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
