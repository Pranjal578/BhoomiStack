"""
Verification public endpoint and document intelligence router.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import VerificationReport, AuditLog
from ..schemas import DocumentAnalysisRequest
from ..services.document_service import analyze_document

router = APIRouter(tags=["Verification & Documents"])


def success(data):
    import datetime
    return {"success": True, "data": data, "timestamp": datetime.datetime.utcnow().isoformat(), "version": "1.0"}


@router.get("/verify/{verification_id}")
async def get_verification(verification_id: str, db: Session = Depends(get_db)):
    """Public endpoint for QR code scanning — returns verification summary."""
    report = db.query(VerificationReport).filter(
        VerificationReport.verification_id == verification_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Verification report not found")
    import json
    return success(json.loads(report.report_data))


@router.post("/documents/analyze")
async def analyze_document_endpoint(req: DocumentAnalysisRequest, db: Session = Depends(get_db)):
    """Simulate OCR document extraction and field matching against parcel record."""
    result = analyze_document(req.ulpin, req.document_type, db)
    return success(result)


@router.get("/audit-logs")
async def get_audit_logs(
    ulpin: str = None,
    action: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get audit log entries with optional filters."""
    query = db.query(AuditLog)
    if ulpin:
        query = query.filter(AuditLog.ulpin == ulpin)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.id.desc()).limit(limit).all()
    from ..schemas import AuditLogSchema
    return success([AuditLogSchema.model_validate(l) for l in logs])
