"""
Verification public endpoint and document intelligence router.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import VerificationReport, AuditLog
from ..schemas import DocumentAnalysisRequest
from ..services.document_service import analyze_document

router = APIRouter(tags=["Verification & Documents"])

# Max file size: 10 MB
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/webp",
}


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


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    ulpin: str = Form(...),
    document_type: str = Form("Sale Deed"),
    db: Session = Depends(get_db),
):
    """
    Accept a real file upload (PDF or image) from the user.
    Validates file type and size, then runs the document analysis
    service (simulated OCR cross-check) against BhoomiStack ground-truth records.
    """
    # 1. Validate MIME type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{content_type}'. Allowed: PDF, JPEG, PNG, TIFF, WebP."
        )

    # 2. Read file and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(contents) // 1024} KB). Maximum allowed: 10 MB."
        )

    # 3. (In a real system: run OCR here with pytesseract / Google Vision / AWS Textract)
    # For this demonstration prototype, we use the simulated analysis against DB records.
    result = analyze_document(ulpin.strip().upper(), document_type, db)

    # Augment result with upload metadata so the frontend knows a real file was processed
    return success({
        **result.model_dump(),
        "uploaded_file": {
            "filename": file.filename,
            "size_kb": round(len(contents) / 1024, 1),
            "content_type": content_type,
            "note": "File received and parsed via simulated OCR pipeline."
        }
    })




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
