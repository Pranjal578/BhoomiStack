"""
FastAPI application entry point — BhoomiStack API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, init_postgis
from .routers import parcels, auth, dashboard, misc

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend and root directories
backend_dir = Path(__file__).resolve().parent.parent
root_dir = backend_dir.parent
load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

# Initialize PostGIS extension on PostgreSQL before creating tables
init_postgis()

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BhoomiStack API",
    description="Integrated GIS-Based Digital Public Infrastructure for Land Governance. One Parcel. One Identity. Every Land Record Connected.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,*")
cors_origins = [orig.strip() for orig in cors_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(parcels.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(misc.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": "BhoomiStack API",
        "tagline": "One Parcel. One Identity. Every Land Record Connected.",
        "version": "1.0.0",
        "docs": "/api/docs",
        "status": "operational"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "bhoomistack-api"}
