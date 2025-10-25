# db.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Read your Supabase connection string from env
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

def get_db_connection():
    if not SUPABASE_DB_URL:
        raise ValueError("SUPABASE_DB_URL not set in environment variables")
    conn = psycopg2.connect(SUPABASE_DB_URL, cursor_factory=RealDictCursor)
    return conn
