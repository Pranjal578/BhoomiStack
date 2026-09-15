"""
Simulated Document Intelligence service.
Simulates OCR extraction and field matching for land documents.
"""
from sqlalchemy.orm import Session
from ..models import Parcel, OwnershipRecord, Owner, Registration
from ..schemas import DocumentAnalysisResult, ExtractedField, FieldMatch
import random


def analyze_document(ulpin: str, document_type: str, db: Session) -> DocumentAnalysisResult:
    """
    Simulate OCR extraction and field matching for a land document.
    Introduces realistic ±10% area variance to demonstrate mismatch detection.
    """
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    ownership = db.query(OwnershipRecord).filter(
        OwnershipRecord.ulpin == ulpin, OwnershipRecord.status == "ACTIVE"
    ).first()
    owner = None
    if ownership:
        owner = db.query(Owner).filter(Owner.id == ownership.owner_id).first()
    registration = db.query(Registration).filter(Registration.ulpin == ulpin).first()

    # Simulate extracted fields (with slight noise)
    area_noise = random.uniform(0.90, 1.10)
    extracted_area = round((parcel.area_gis or 0.84) * area_noise, 2)

    extracted_fields = [
        ExtractedField(field="owner_name", extracted_value=owner.name if owner else "Pranjal Kumar", confidence=0.95),
        ExtractedField(field="khasra_no", extracted_value=parcel.khasra_no if parcel else "125/2", confidence=0.98),
        ExtractedField(field="area_hectares", extracted_value=str(extracted_area), confidence=0.91),
        ExtractedField(field="village", extracted_value=parcel.village if parcel else "Jhunsi", confidence=0.99),
        ExtractedField(field="district", extracted_value=parcel.district if parcel else "Prayagraj", confidence=0.99),
        ExtractedField(field="registration_no", extracted_value=registration.document_no if registration else f"REG-2024-{ulpin[-6:]}", confidence=0.88),
        ExtractedField(field="transaction_date", extracted_value=registration.transaction_date if registration else "15 Sep 2024", confidence=0.93),
    ]

    # Build match results
    match_results = []
    overall_matches = 0

    # Owner match
    rec_owner = owner.name if owner else None
    ext_owner = extracted_fields[0].extracted_value
    match_results.append(FieldMatch(
        field="Owner Name",
        extracted_value=ext_owner,
        record_value=rec_owner,
        status="MATCH" if rec_owner and rec_owner.lower() == ext_owner.lower() else "MISMATCH"
    ))
    if rec_owner and rec_owner.lower() == ext_owner.lower():
        overall_matches += 1

    # Khasra match
    rec_khasra = parcel.khasra_no if parcel else None
    ext_khasra = extracted_fields[1].extracted_value
    match_results.append(FieldMatch(
        field="Khasra Number",
        extracted_value=ext_khasra,
        record_value=rec_khasra,
        status="MATCH" if rec_khasra == ext_khasra else "MISMATCH"
    ))
    if rec_khasra == ext_khasra:
        overall_matches += 1

    # Area match (compare against RoR area)
    rec_area = ownership.area_ror if ownership else parcel.area_gis if parcel else None
    ext_area = float(extracted_fields[2].extracted_value)
    area_diff_pct = abs(ext_area - (rec_area or ext_area)) / (rec_area or ext_area + 0.001) * 100
    area_status = "MATCH" if area_diff_pct < 2 else ("PARTIAL" if area_diff_pct < 5 else "MISMATCH")
    match_results.append(FieldMatch(
        field="Area (hectares)",
        extracted_value=f"{ext_area} ha",
        record_value=f"{rec_area:.2f} ha" if rec_area else "N/A",
        status=area_status,
        deviation=f"{area_diff_pct:.1f}% difference" if area_status != "MATCH" else None
    ))
    if area_status == "MATCH":
        overall_matches += 1

    # Village match
    rec_village = parcel.village if parcel else None
    ext_village = extracted_fields[3].extracted_value
    match_results.append(FieldMatch(
        field="Village",
        extracted_value=ext_village,
        record_value=rec_village,
        status="MATCH" if rec_village and rec_village.lower() == ext_village.lower() else "MISMATCH"
    ))
    if rec_village and rec_village.lower() == ext_village.lower():
        overall_matches += 1

    # Registration No match
    rec_reg = registration.document_no if registration else None
    ext_reg = extracted_fields[5].extracted_value
    match_results.append(FieldMatch(
        field="Registration Number",
        extracted_value=ext_reg,
        record_value=rec_reg,
        status="MATCH" if rec_reg == ext_reg else "PARTIAL"
    ))
    if rec_reg == ext_reg:
        overall_matches += 1

    total_checks = len(match_results)
    authenticity_score = int((overall_matches / total_checks) * 100)

    if authenticity_score >= 90:
        recommendation = "Document appears authentic. All key fields match on-record data. Proceed with transaction."
    elif authenticity_score >= 70:
        recommendation = "Document largely matches records. Minor discrepancies detected — verify area measurement before proceeding."
    else:
        recommendation = "Significant mismatches detected. Document authenticity cannot be confirmed. Field verification and officer review required."

    return DocumentAnalysisResult(
        ulpin=ulpin,
        document_type=document_type,
        extracted_fields=extracted_fields,
        match_results=match_results,
        authenticity_score=authenticity_score,
        recommendation=recommendation
    )
