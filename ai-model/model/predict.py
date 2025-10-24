import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from utils import get_url_values, numeric_features, COMMON_TLDS  # Import all required functions

MODEL_FILE = Path(__file__).resolve().parent / 'url_pipeline.joblib'
if not MODEL_FILE.exists():
    print("Model not found. Run model/train.py first.")
    sys.exit(1)

pipeline = joblib.load(MODEL_FILE)

def predict_single(url):
    df = pd.DataFrame({'url': [url]})
    pred = pipeline.predict(df)
    prob = None
    clf = pipeline.named_steps['clf']
    if hasattr(clf, 'predict_proba'):
        prob = pipeline.predict_proba(df)[0][1]
    elif hasattr(clf, 'decision_function'):
        dfv = pipeline.decision_function(df)[0]
        prob = 1 / (1 + 2.71828 ** (-dfv/4.0))
    label = "malicious" if pred[0] == 1 else "benign"
    return label, prob

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python model/predict.py <url1> [url2] ...")
        sys.exit(0)
    for u in sys.argv[1:]:
        label, prob = predict_single(u)
        if prob is not None:
            print(f"{u} -> {label} (score={prob:.4f})")
        else:
            print(f"{u} -> {label}")