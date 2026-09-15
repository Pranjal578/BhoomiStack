"""
Land Truth Engine — Rule-based risk scoring across all departmental records.
"""
from typing import Optional
from sqlalchemy.orm import Session
from ..models import Parcel, OwnershipRecord, Registration, Encumbrance, BuildingPermission
from ..models import LandUseRecord, Dispute, PropertyTax
from ..schemas import LandTruthReport, LandTruthFlag, AreaComparison


def compute_risk_score(ulpin: str, db: Session) -> LandTruthReport:
    """
    Compute the Land Truth Engine risk score for a parcel.
    Cross-validates GIS, RoR, Registration, Tax data and flags anomalies.
    """
    flags = []
    score = 0

    # --- Fetch all records ---
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    if not parcel:
        return LandTruthReport(
            ulpin=ulpin, risk_score=0, risk_level="LOW", flags=[],
            area_comparison=AreaComparison(), recommendations=[], data_confidence=0
        )

    ownership = db.query(OwnershipRecord).filter(
        OwnershipRecord.ulpin == ulpin, OwnershipRecord.status == "ACTIVE"
    ).first()

    registration = db.query(Registration).filter(
        Registration.ulpin == ulpin
    ).order_by(Registration.id.desc()).first()

    tax = db.query(PropertyTax).filter(
        PropertyTax.ulpin == ulpin
    ).order_by(PropertyTax.id.desc()).first()

    active_encumbrances = db.query(Encumbrance).filter(
        Encumbrance.ulpin == ulpin, Encumbrance.status == "ACTIVE"
    ).all()

    active_disputes = db.query(Dispute).filter(
        Dispute.ulpin == ulpin, Dispute.status == "PENDING"
    ).all()

    land_use = db.query(LandUseRecord).filter(LandUseRecord.ulpin == ulpin).first()

    building_perm = db.query(BuildingPermission).filter(
        BuildingPermission.ulpin == ulpin
    ).order_by(BuildingPermission.id.desc()).first()

    # Count recent registrations (proxy for transaction frequency)
    recent_registrations = db.query(Registration).filter(
        Registration.ulpin == ulpin
    ).count()

    # --- Area Cross-validation ---
    gis_area = parcel.area_gis
    ror_area = ownership.area_ror if ownership else None
    reg_area = registration.area_registered if registration else None
    tax_area = tax.area_taxed if tax else None

    areas = {k: v for k, v in {"GIS": gis_area, "RoR": ror_area,
              "Registration": reg_area, "Tax": tax_area}.items() if v is not None}
    max_dev = 0.0

    if gis_area and ror_area:
        dev = abs(gis_area - ror_area) / gis_area
        max_dev = max(max_dev, dev)
        if dev > 0.10:
            score += 25
            flags.append(LandTruthFlag(
                flag_code="AREA_MISMATCH_ROR_HIGH",
                title="Severe Area Mismatch: GIS vs Revenue Record",
                description=f"GIS area ({gis_area:.2f} ha) differs from RoR area ({ror_area:.2f} ha) by {dev*100:.1f}%. This exceeds the 10% threshold.",
                severity="HIGH",
                recommendation="Initiate field measurement survey and cross-verify with survey department records."
            ))
        elif dev > 0.02:
            score += 15
            flags.append(LandTruthFlag(
                flag_code="AREA_MISMATCH_ROR",
                title="Area Mismatch: GIS vs Revenue Record",
                description=f"GIS area ({gis_area:.2f} ha) differs from RoR area ({ror_area:.2f} ha) by {dev*100:.1f}%.",
                severity="MEDIUM",
                recommendation="Schedule field verification to reconcile area discrepancy."
            ))

    if gis_area and tax_area:
        dev = abs(gis_area - tax_area) / gis_area
        max_dev = max(max_dev, dev)
        if dev > 0.05:
            score += 20
            flags.append(LandTruthFlag(
                flag_code="AREA_MISMATCH_TAX",
                title="Area Mismatch: GIS vs Property Tax Record",
                description=f"GIS area ({gis_area:.2f} ha) differs from taxed area ({tax_area:.2f} ha) by {dev*100:.1f}%. Potential tax evasion on {abs(gis_area-tax_area):.2f} ha.",
                severity="MEDIUM",
                recommendation="Municipal officer should update tax assessment to match GIS area."
            ))

    if gis_area and reg_area:
        dev = abs(gis_area - reg_area) / gis_area
        max_dev = max(max_dev, dev)
        if dev > 0.03:
            score += 10
            flags.append(LandTruthFlag(
                flag_code="AREA_MISMATCH_REG",
                title="Area Mismatch: GIS vs Registration Record",
                description=f"GIS area ({gis_area:.2f} ha) differs from registered area ({reg_area:.2f} ha) by {dev*100:.1f}%.",
                severity="LOW",
                recommendation="Review registration deed and cross-check with current survey."
            ))

    # --- Transaction Frequency ---
    if recent_registrations >= 3:
        score += 15
        flags.append(LandTruthFlag(
            flag_code="HIGH_TRANSACTION_FREQUENCY",
            title="High Transaction Frequency",
            description=f"This parcel has {recent_registrations} registration transactions recorded. High frequency may indicate subdivision, dispute, or fraudulent activity.",
            severity="HIGH",
            recommendation="Review all transaction records for legitimacy. Check for benami transactions."
        ))
    elif recent_registrations >= 2:
        score += 8
        flags.append(LandTruthFlag(
            flag_code="MULTIPLE_TRANSACTIONS",
            title="Multiple Transactions Detected",
            description=f"This parcel has {recent_registrations} registration records. Moderate frequency warrants attention.",
            severity="MEDIUM",
            recommendation="Verify all transactions are legitimate and properly authorized."
        ))

    # --- Zoning Conflict ---
    if land_use and building_perm:
        permitted = (land_use.permitted_use or "").lower()
        built = (building_perm.building_type or "").lower()
        conflict = False
        if permitted in ["residential", "r1", "r2"] and built in ["commercial", "industrial"]:
            conflict = True
        elif permitted in ["agricultural", "ag"] and built in ["residential", "commercial", "industrial"]:
            conflict = True
        if land_use.has_conflict or conflict:
            score += 20
            flags.append(LandTruthFlag(
                flag_code="ZONING_CONFLICT",
                title="Zoning Conflict Detected",
                description=f"Master Plan permits '{land_use.permitted_use}' use, but building permission granted for '{building_perm.building_type}'. Unauthorized land use conversion.",
                severity="HIGH",
                recommendation="Planning authority should review building permission and initiate regularization or demolition proceedings."
            ))

    # --- Encumbrance ---
    if active_encumbrances:
        enc = active_encumbrances[0]
        score += 10
        flags.append(LandTruthFlag(
            flag_code="ACTIVE_ENCUMBRANCE",
            title="Active Mortgage/Lien Detected",
            description=f"Parcel has an active {enc.type} with {enc.institution} for ₹{enc.amount:,.0f}. Any transaction may be legally restricted.",
            severity="LOW",
            recommendation="Buyer/transferee should obtain NOC from {enc.institution} before any registration."
        ))

    # --- Active Dispute ---
    if active_disputes:
        d = active_disputes[0]
        score += 30
        flags.append(LandTruthFlag(
            flag_code="ACTIVE_DISPUTE",
            title="Active Legal Dispute",
            description=f"Case {d.case_no} ({d.type}) is PENDING at {d.court}. Filed on {d.filed_date}. Parcel cannot be freely transacted.",
            severity="HIGH",
            recommendation="All transactions on this parcel are legally restricted pending dispute resolution."
        ))

    # --- Satellite Change ---
    if parcel.satellite_change_flag:
        score += 25
        flags.append(LandTruthFlag(
            flag_code="SATELLITE_CHANGE_DETECTED",
            title="Satellite Change Detection Alert",
            description="Satellite imagery analysis detected significant land-use change on this parcel that is not reflected in official records. Possible unauthorized construction or encroachment.",
            severity="HIGH",
            recommendation="Field inspection required. Revenue officer should initiate site visit and update records."
        ))

    # --- Cap and classify ---
    final_score = min(score, 100)
    if final_score <= 30:
        risk_level = "LOW"
    elif final_score <= 60:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # Update parcel risk score in DB
    parcel.risk_score = final_score
    parcel.risk_level = risk_level
    db.commit()

    # --- Build recommendations ---
    recommendations = []
    if not flags:
        recommendations.append("All records are consistent. No action required.")
    else:
        if any(f.severity == "HIGH" for f in flags):
            recommendations.append("Immediate officer review required for HIGH severity flags.")
        if any(f.flag_code.startswith("AREA_MISMATCH") for f in flags):
            recommendations.append("Commission a fresh survey to reconcile area discrepancies.")
        if any(f.flag_code == "ACTIVE_DISPUTE" for f in flags):
            recommendations.append("Place a hold on all transactions until dispute is resolved.")
        if any(f.flag_code == "ZONING_CONFLICT" for f in flags):
            recommendations.append("Refer to Planning Authority for land-use regularization review.")
        if any(f.flag_code == "SATELLITE_CHANGE_DETECTED" for f in flags):
            recommendations.append("Schedule field inspection within 30 days.")

    # Data confidence (inverse of issues)
    data_confidence = max(10, 100 - (len(flags) * 15))

    area_comparison = AreaComparison(
        gis=gis_area,
        ror=ror_area,
        registration=reg_area,
        tax=tax_area,
        max_deviation_pct=round(max_dev * 100, 2)
    )

    return LandTruthReport(
        ulpin=ulpin,
        risk_score=final_score,
        risk_level=risk_level,
        flags=flags,
        area_comparison=area_comparison,
        recommendations=recommendations,
        data_confidence=data_confidence
    )
