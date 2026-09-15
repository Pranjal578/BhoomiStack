"""
FastAPI application entry point — BhoomiStack API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import parcels, auth, dashboard, misc

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
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
