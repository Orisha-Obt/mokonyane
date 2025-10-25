from typing import Union
from urllib import parse
from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException

# Add project root to Python path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Import from model
try:
    from model.predict import predict_single
except ImportError as e:
    print(f"Import error: {e}")
    raise

app = FastAPI(docs_url="/docs", redoc_url="/redoc")

@app.get("/")
def read_root():
    return {"message": "Use GET /check-url?url=<your_url> to check if URL is malicious"}

@app.get("/check-url")
def check_url(url: str):
    """
    Accepts a URL via query string and returns prediction:
    - Returns JSON with prediction and confidence score
    Example: GET /check-url?url=https://example.com
    """
    try:
        # Validate URL format
        parsed = parse.urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            raise HTTPException(status_code=400, detail="Invalid URL format")

        # Get prediction
        label, probability = predict_single(url)
        
        return {
            "url": url,
            "is_malicious": label == "malicious",
            "label": label,
            "confidence": float(probability) if probability is not None else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")