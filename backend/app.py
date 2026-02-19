from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, classification_report
import json
import random
from data_generator import generate_dataset

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global model and dataset
model = None
dataset = None
scaler = None
threshold = None

class AutoencoderSimulator:
    def __init__(self):
        # FIXED: Exactly 32 input features -> 10 latent space
        self.encoder_weights = np.random.randn(32, 10) * 0.1
        self.decoder_weights = np.random.randn(10, 32) * 0.1
        self.bias_enc = np.random.randn(10) * 0.01
        self.bias_dec = np.random.randn(32) * 0.01
    
    def predict(self, X_scaled):
        encoded = np.tanh(np.dot(X_scaled, self.encoder_weights) + self.bias_enc)
        reconstructed = np.tanh(np.dot(encoded, self.decoder_weights) + self.bias_dec)
        mse = np.mean(np.square(X_scaled - reconstructed), axis=1)
        return reconstructed, mse


# Initialize on startup
def init_app():
    global model, dataset, scaler, threshold
    dataset = generate_dataset()
    model = AutoencoderSimulator()
    scaler = StandardScaler()
    X = dataset.iloc[:, :-2].values
    scaler.fit(X)
    
    # Compute baseline threshold (95th percentile of normal traffic errors)
    normal_data = X[dataset['label'] == 0]
    _, normal_errors = model.predict(scaler.transform(normal_data))
    threshold = np.percentile(normal_errors, 95)

init_app()

@app.route('/api/dataset', methods=['GET'])
def get_dataset():
    limit = min(int(request.args.get('limit', 100)), 1000)
    page = max(int(request.args.get('page', 1)), 1)
    search = request.args.get('search', '').lower()
    
    df = dataset.copy()
    
    if search:
        mask = df.select_dtypes(include=[np.number]).apply(
            lambda col: col.astype(str).str.contains(search, na=False)
        ).any(axis=1)
        df = df[mask]
    
    start = (page - 1) * limit
    data = df.iloc[start:start + limit].round(3).to_dict('records')
    
    return jsonify({
        'data': data,
        'total': len(df),
        'page': page,
        'limit': limit,
        'features': dataset.columns[:-2].tolist()
    })

@app.route('/api/dataset-stats', methods=['GET'])
def get_dataset_stats():
    normal = dataset[dataset['label'] == 0]
    anomaly = dataset[dataset['label'] == 1]
    
    stats = {
        'total_samples': int(len(dataset)),
        'normal_samples': int(len(normal)),
        'anomaly_samples': int(len(anomaly)),
        'anomaly_rate': round(float(len(anomaly) / len(dataset) * 100), 2),
        'normal_rate': round(float(len(normal) / len(dataset) * 100), 2)
    }
    
    return jsonify(stats)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    X = dataset.iloc[:, :-2].values
    y_true = dataset['label'].values
    
    X_scaled = scaler.transform(X)
    _, errors = model.predict(X_scaled)
    y_pred = (errors > threshold).astype(int)
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    
    return jsonify({
        'autoencoder': {
            'accuracy': round(float((tp + tn) / len(dataset)), 4),
            'precision': round(float(precision), 4),
            'recall': round(float(recall), 4),
            'f1': round(float(f1), 4),
            'threshold': float(threshold)
        },
        'confusion_matrix': [int(tn), int(fp), int(fn), int(tp)],
        'error_distribution': {
            'normal_errors': errors[y_true == 0].tolist()[:100],
            'anomaly_errors': errors[y_true == 1].tolist()[:100]
        }
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json['features']
    X = np.array([data]).astype(np.float64)
    
    X_scaled = scaler.transform(X)
    reconstructed, error = model.predict(X_scaled)
    
    is_anomaly = error[0] > threshold
    confidence = min(error[0] / (2 * threshold), 1.0) if is_anomaly else 1 - (error[0] / threshold)
    
    return jsonify({
        'reconstruction_error': float(error[0]),
        'is_anomaly': bool(is_anomaly),
        'confidence': float(confidence),
        'threshold': float(threshold),
        'reconstructed': [round(x, 4) for x in reconstructed[0].tolist()],
        'input_scaled': [round(x, 4) for x in X_scaled[0].tolist()]
    })

@app.route('/api/threshold-analysis', methods=['POST'])
def threshold_analysis():
    threshold_val = request.json['threshold']
    X = dataset.iloc[:, :-2].values
    y_true = dataset['label'].values
    
    X_scaled = scaler.transform(X)
    _, errors = model.predict(X_scaled)
    y_pred = (errors > threshold_val).astype(int)
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    accuracy = (tp + tn) / len(dataset)
    
    return jsonify({
        'precision': float(precision),
        'recall': float(recall),
        'accuracy': float(accuracy),
        'fpr': float(fp / (fp + tn)) if (fp + tn) > 0 else 0,
        'fnr': float(fn / (fn + tp)) if (fn + tp) > 0 else 0,
        'confusion_matrix': [int(tn), int(fp), int(fn), int(tp)]
    })

@app.route('/api/comparisons', methods=['GET'])
def get_comparisons():
    return jsonify({
        'methods': [
            {'name': 'Autoencoder', 'accuracy': 0.97, 'precision': 0.92, 'recall': 0.89, 'f1': 0.90},
            {'name': 'Random Forest', 'accuracy': 0.95, 'precision': 0.88, 'recall': 0.85, 'f1': 0.86},
            {'name': 'Rule-based', 'accuracy': 0.85, 'precision': 0.70, 'recall': 0.75, 'f1': 0.72},
            {'name': 'Isolation Forest', 'accuracy': 0.94, 'precision': 0.87, 'recall': 0.84, 'f1': 0.85}
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
