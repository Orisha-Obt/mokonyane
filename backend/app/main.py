from urllib import parse
from pathlib import Path
import sys
from fastapi import FastAPI, HTTPException, Form, File, UploadFile
from fastapi.responses import JSONResponse
from typing import Optional, List
from pydantic import BaseModel, HttpUrl, constr
from db import get_db_connection
import json
import os


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

class ReportForm(BaseModel):
    url: HttpUrl
    description: constr(strip_whitespace=True, min_length=5)
    headers: Optional[str] = None
    severity: constr(strip_whitespace=True, min_length=3, max_length=20)
    anonymous: bool
    reporter_name: Optional[constr(strip_whitespace=True, max_length=100)] = None
    reporter_contact: Optional[constr(strip_whitespace=True, max_length=100)] = None


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
    

@app.post("/api/report")
async def submit_report(
    url: str = Form(...),
    description: str = Form(...),
    headers: str = Form(""),
    severity: str = Form(...),
    anonymous: str = Form(...),
    reporter_name: Optional[str] = Form(None),
    reporter_contact: Optional[str] = Form(None),
    attachments: List[UploadFile] = File(default=[])
):
    try:
        # Validate input via Pydantic
        form_data = ReportForm(
            url=url,
            description=description,
            headers=headers,
            severity=severity,
            anonymous=anonymous.lower() == "true",
            reporter_name=reporter_name,
            reporter_contact=reporter_contact,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e}")

    # Save files (optional)
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_names = []
    for file in attachments:
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        file_names.append(file.filename)

    # Insert into DB safely using parameterized query
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reports (
                url, description, headers, severity,
                anonymous, reporter_name, reporter_contact, attachments
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            form_data.url,
            form_data.description,
            form_data.headers,
            form_data.severity,
            form_data.anonymous,
            form_data.reporter_name,
            form_data.reporter_contact,
            json.dumps(file_names)
        ))
        new_id = cur.fetchone()["id"]
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    return JSONResponse(content={
        "status": "success",
        "report_id": new_id,
        "attachments": file_names
    })