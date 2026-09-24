from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "bhoomistack.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

# sqlite requires check_same_thread=False; PostgreSQL does not support it
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


IS_POSTGRES = not DATABASE_URL.startswith("sqlite")


def init_postgis():
    """Ensure PostGIS extension exists when running PostgreSQL."""
    if IS_POSTGRES:
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
                print("✅ PostGIS extension confirmed on PostgreSQL")
        except Exception as e:
            print(f"ℹ️ PostGIS init note: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_now():
    return datetime.datetime.utcnow().isoformat()
