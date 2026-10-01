"""
Verification Service — generates land verification reports with QR codes.
"""
import json
import random
import re
import string
import secrets
import base64
import io
import os
import datetime
from sqlalchemy.orm import Session
from ..models import Parcel, OwnershipRecord, Owner, Registration, Encumbrance, Dispute
from ..schemas import VerificationReportSchema, VerificationCheck
from ..models import VerificationReport
from .. import models

try:
    import qrcode as _qrcode
    _HAS_QRCODE = True
except ImportError:
    _HAS_QRCODE = False


def generate_verification_id(db: Session) -> str:
    """Generate a unique verification ID in format LV-2026-XXXXXX."""
    for _ in range(10):  # retry up to 10 times to avoid collisions
        suffix = secrets.token_hex(3).upper()  # 16M+ possibilities, cryptographically random
        vid = f"LV-2026-{suffix}"
        exists = db.query(VerificationReport).filter(
            VerificationReport.verification_id == vid
        ).first()
        if not exists:
            return vid
    raise RuntimeError("Unable to generate a unique verification ID after 10 attempts")


def generate_qr_code(data: str) -> str:
    """Generate QR code and return as base64 PNG string."""
    if not _HAS_QRCODE:
        return ""
    try:
        qr = _qrcode.QRCode(version=1, box_size=6, border=2)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception:
        return ""


def run_verification(ulpin: str, db: Session) -> VerificationReportSchema:
    """
    Run all verification checks for a parcel and generate a report.
    """
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    ownership = db.query(OwnershipRecord).filter(
        OwnershipRecord.ulpin == ulpin, OwnershipRecord.status == "ACTIVE"
    ).first()
    owner = None
    if ownership:
        owner = db.query(Owner).filter(Owner.id == ownership.owner_id).first()
    registration = db.query(Registration).filter(Registration.ulpin == ulpin).first()
    active_enc = db.query(Encumbrance).filter(
        Encumbrance.ulpin == ulpin, Encumbrance.status == "ACTIVE"
    ).first()
    active_dispute = db.query(Dispute).filter(
        Dispute.ulpin == ulpin, Dispute.status == "PENDING"
    ).first()

    checks = []

    # Check 1: Parcel exists in GIS
    checks.append(VerificationCheck(
        check_id="GIS_EXISTS",
        label="Parcel exists in GIS registry",
        status="PASS" if parcel else "FAIL",
        detail=f"ULPIN {ulpin} found in cadastral registry" if parcel else "Parcel not found"
    ))

    # Check 2: ULPIN is valid (format + exists in DB)
    _ULPIN_RE = re.compile(r'^[A-Z0-9]{2,4}-\d{6,}$')
    ulpin_valid = bool(_ULPIN_RE.match(ulpin)) and parcel is not None
    checks.append(VerificationCheck(
        check_id="ULPIN_VALID",
        label="ULPIN is registered and valid",
        status="PASS" if ulpin_valid else "FAIL",
        detail=f"ULPIN format valid: {ulpin}" if ulpin_valid else f"Invalid or unregistered ULPIN: {ulpin}"
    ))

    # Check 3: RoR available
    checks.append(VerificationCheck(
        check_id="ROR_AVAILABLE",
        label="Record of Rights (RoR) available",
        status="PASS" if ownership else "WARN",
        detail="RoR record found" if ownership else "No active RoR record found"
    ))

    # Check 4: Owner information
    checks.append(VerificationCheck(
        check_id="OWNER_INFO",
        label="Owner information on record",
        status="PASS" if owner else "WARN",
        detail=f"Owner: {owner.name}" if owner else "Owner details unavailable"
    ))

    # Check 5: Registration record
    checks.append(VerificationCheck(
        check_id="REGISTRATION",
        label="Registration record found",
        status="PASS" if registration else "WARN",
        detail=f"Deed No: {registration.document_no}" if registration else "No registration deed on record"
    ))

    # Check 6: No active dispute
    checks.append(VerificationCheck(
        check_id="NO_DISPUTE",
        label="No active legal dispute",
        status="FAIL" if active_dispute else "PASS",
        detail=f"Dispute case {active_dispute.case_no} pending" if active_dispute else "No active disputes detected"
    ))

    # Check 7: No encumbrance
    checks.append(VerificationCheck(
        check_id="NO_ENCUMBRANCE",
        label="No mortgage or lien detected",
        status="WARN" if active_enc else "PASS",
        detail=f"Active {active_enc.type} with {active_enc.institution}" if active_enc else "No active encumbrances"
    ))

    # Check 8: Land use verified
    checks.append(VerificationCheck(
        check_id="LAND_USE",
        label="Land use classification verified",
        status="PASS" if (parcel and parcel.land_use) else "WARN",
        detail=f"Land use: {parcel.land_use}" if parcel and parcel.land_use else "Land use not classified"
    ))

    # Check 9: Area consistency
    area_ok = True
    if ownership and parcel and parcel.area_gis:
        if ownership.area_ror and abs(parcel.area_gis - ownership.area_ror) / parcel.area_gis > 0.10:
            area_ok = False
    checks.append(VerificationCheck(
        check_id="AREA_CONSISTENT",
        label="Area consistency across records",
        status="WARN" if not area_ok else "PASS",
        detail="Minor area discrepancy noted between GIS and RoR" if not area_ok else "Area consistent across records"
    ))

    # Check 10: Parcel not government land
    checks.append(VerificationCheck(
        check_id="NOT_GOVT_LAND",
        label="Parcel not classified as restricted government land",
        status="WARN" if (parcel and parcel.land_type == "Government") else "PASS",
        detail="Government land — private transactions restricted" if (parcel and parcel.land_type == "Government") else "Private land — transactions permitted"
    ))

    passed = sum(1 for c in checks if c.status == "PASS")
    total = len(checks)

    if active_dispute:
        status = "FLAGGED"
    elif passed < total * 0.7:
        status = "FLAGGED"
    elif passed < total:
        status = "PARTIALLY_VERIFIED"
    else:
        status = "VERIFIED"

    verification_id = generate_verification_id(db)
    _base_url = os.getenv("PUBLIC_API_BASE_URL", "http://localhost:8000").rstrip("/")
    qr_url = f"{_base_url}/api/v1/verify/{verification_id}"
    qr_data = generate_qr_code(qr_url)

    report = VerificationReportSchema(
        verification_id=verification_id,
        ulpin=ulpin,
        status=status,
        checks=checks,
        checks_passed=passed,
        checks_total=total,
        owner_name=owner.name if owner else None,
        area_gis=parcel.area_gis if parcel else None,
        land_use=parcel.land_use if parcel else None,
        encumbrance_status="ACTIVE" if active_enc else "NONE",
        dispute_status="PENDING" if active_dispute else "NONE",
        qr_data=qr_data,
        created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )

    # Persist to DB
    db_report = VerificationReport(
        verification_id=verification_id,
        ulpin=ulpin,
        status=status,
        checks_passed=passed,
        checks_total=total,
        report_data=json.dumps(report.model_dump()),
        qr_data=qr_data
    )
    db.add(db_report)
    db.commit()

    return report
