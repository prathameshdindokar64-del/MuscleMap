"""
app.py
Flask microservice for MuscleMap ML risk assessment on port 5001.
Endpoints:
  GET  /health  - Health check and model readiness
  POST /predict - Risk level prediction with confidence and probability distribution
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)

MODEL = None
FEATURE_COLUMNS = None
CATEGORICAL_COLS = [
    'region', 'painType', 'duration', 'trigger', 'onset', 'previousEpisodes', 'sleepQuality'
]

def load_artifacts():
    global MODEL, FEATURE_COLUMNS
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'model.joblib')
    cols_path = os.path.join(base_dir, 'feature_columns.json')

    if os.path.exists(model_path):
        MODEL = joblib.load(model_path)
        print("Loaded model.joblib")
    if os.path.exists(cols_path):
        with open(cols_path, 'r') as f:
            FEATURE_COLUMNS = json.load(f)
        print(f"Loaded {len(FEATURE_COLUMNS)} feature columns")

# Initialize artifacts on startup
load_artifacts()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'modelLoaded': MODEL is not None and FEATURE_COLUMNS is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None or FEATURE_COLUMNS is None:
        load_artifacts()
        if MODEL is None:
            return jsonify({'error': 'Model not trained or loaded yet'}), 503

    data = request.get_json(force=True, silent=True) or {}

    # Extract aggravating factors list
    agg_list = data.get('aggravatedBy') or []
    if isinstance(agg_list, str):
        try:
            agg_list = json.loads(agg_list)
        except Exception:
            agg_list = []

    # Map input with sensible defaults
    row = {
        'region': data.get('region', 'lower_back'),
        'painType': data.get('painType', 'aching'),
        'duration': data.get('duration', '1_to_3_days'),
        'intensity': int(data.get('intensity', 5)),
        'stressLevel': int(data.get('stressLevel', 1) or 1),
        'trigger': data.get('trigger', 'unknown') or 'unknown',
        'onset': data.get('onset', 'gradual') or 'gradual',
        'radiating': 1 if data.get('radiating') else 0,
        'numbnessOrWeakness': 1 if data.get('numbnessOrWeakness') else 0,
        'nightPain': 1 if data.get('nightPain') else 0,
        'fever': 1 if data.get('fever') else 0,
        'bladderBowelChanges': 1 if data.get('bladderBowelChanges') else 0,
        'previousEpisodes': data.get('previousEpisodes', 'none') or 'none',
        'dailySittingHours': int(data.get('dailySittingHours', 4) or 4),
        'sleepQuality': data.get('sleepQuality', 'good') or 'good',
        'agg_bending': 1 if 'bending' in agg_list else 0,
        'agg_twisting': 1 if 'twisting' in agg_list else 0,
        'agg_walking': 1 if 'walking' in agg_list else 0,
        'agg_lifting': 1 if 'lifting' in agg_list else 0,
        'agg_sitting': 1 if 'sitting' in agg_list else 0,
        'agg_lying_down': 1 if 'lying_down' in agg_list else 0,
    }

    # Build single-row DataFrame and one-hot encode
    df = pd.DataFrame([row])
    df_encoded = pd.get_dummies(df, columns=CATEGORICAL_COLS, drop_first=False)

    # Reindex to match the training feature columns exactly
    X_input = df_encoded.reindex(columns=FEATURE_COLUMNS, fill_value=0)

    # Inference
    prediction = MODEL.predict(X_input)[0]
    probabilities_raw = MODEL.predict_proba(X_input)[0]
    classes = MODEL.classes_

    prob_dict = {cls: float(round(prob, 4)) for cls, prob in zip(classes, probabilities_raw)}
    confidence = float(round(max(probabilities_raw), 4))

    return jsonify({
        'riskLevel': str(prediction),
        'confidence': confidence,
        'probabilities': prob_dict
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting ML service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
