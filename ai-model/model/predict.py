import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Import from the same utils module used in training
from model.utils import get_url_values, numeric_features, COMMON_TLDS

MODEL_FILE = Path(__file__).resolve().parent / 'url_pipeline.joblib'

# Load model once at module level
if MODEL_FILE.exists():
    try:
        pipeline = joblib.load(MODEL_FILE)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        pipeline = None
else:
    pipeline = None
    print(f"WARNING: Model file not found at {MODEL_FILE}")

def predict_single(url):
    if pipeline is None:
        raise RuntimeError("Model not loaded. Please train the model first.")
    
    # Create DataFrame with the same structure used in training
    df = pd.DataFrame({'url': [url]})
    
    try:
        pred = pipeline.predict(df)
        prob = None
        
        # Get probability scores if available
        if hasattr(pipeline, 'predict_proba'):
            prob = pipeline.predict_proba(df)[0][1]
        else:
            # Fallback for models without predict_proba
            clf = pipeline.named_steps.get('clf')
            if clf and hasattr(clf, 'predict_proba'):
                prob = clf.predict_proba(df)[0][1]
        
        label = "malicious" if pred[0] == 1 else "benign"
        return label, prob
        
    except Exception as e:
        raise RuntimeError(f"Prediction failed: {str(e)}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python model/predict.py <url1> [url2] ...")
        sys.exit(0)
    for u in sys.argv[1:]:
        try:
            label, prob = predict_single(u)
            if prob is not None:
                print(f"{u} -> {label} (score={prob:.4f})")
            else:
                print(f"{u} -> {label}")
        except Exception as e:
            print(f"Error predicting {u}: {e}")