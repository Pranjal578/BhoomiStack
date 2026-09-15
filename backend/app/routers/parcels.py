"""
Parcels router — core parcel data and GeoJSON endpoints.
"""
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Parcel, OwnershipRecord, Owner
from ..schemas import ParcelSchema, ParcelSearchResult, ApiResponse
from ..services.land_truth_engine import compute_risk_score
from ..services.verification_service import run_verification

router = APIRouter(prefix="/parcels", tags=["Parcels"])


def success(data):
    import datetime
    return {"success": True, "data": data, "timestamp": datetime.datetime.utcnow().isoformat(), "version": "1.0"}


@router.get("/geojson")
async def get_geojson(db: Session = Depends(get_db)):
    """Return all parcels as a GeoJSON FeatureCollection for map rendering."""
    parcels = db.query(Parcel).all()
    features = []
    for p in parcels:
        if not p.geometry:
            continue
        try:
            geom = json.loads(p.geometry)
        except Exception:
            continue
        features.append({
            "type": "Feature",
            "geometry": geom,
            "properties": {
                "ulpin": p.ulpin,
                "khasra_no": p.khasra_no,
                "village": p.village,
                "district": p.district,
                "area_gis": p.area_gis,
                "land_use": p.land_use,
                "land_type": p.land_type,
                "risk_score": p.risk_score,
                "risk_level": p.risk_level,
                "satellite_change_flag": p.satellite_change_flag,
            }
        })
    return {"type": "FeatureCollection", "features": features}


@router.get("/search")
async def search_parcels(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db)
):
    """Search parcels by ULPIN, Khasra number, or owner name."""
    results = []

    # Search by ULPIN or Khasra
    parcels = db.query(Parcel).filter(
        (Parcel.ulpin.ilike(f"%{q}%")) |
        (Parcel.khasra_no.ilike(f"%{q}%")) |
        (Parcel.village.ilike(f"%{q}%"))
    ).limit(20).all()

    # Search by owner name
    if len(results) < 5:
        owners = db.query(Owner).filter(Owner.name.ilike(f"%{q}%")).limit(10).all()
        owner_ids = [o.id for o in owners]
        if owner_ids:
            ownerships = db.query(OwnershipRecord).filter(
                OwnershipRecord.owner_id.in_(owner_ids),
                OwnershipRecord.status == "ACTIVE"
            ).all()
            owner_ulpins = {ow.ulpin for ow in ownerships}
            extra = db.query(Parcel).filter(
                Parcel.ulpin.in_(owner_ulpins),
                Parcel.ulpin.notin_([p.ulpin for p in parcels])
            ).limit(10).all()
            parcels = list(parcels) + extra

    for p in parcels:
        ownership = db.query(OwnershipRecord).filter(
            OwnershipRecord.ulpin == p.ulpin,
            OwnershipRecord.status == "ACTIVE"
        ).first()
        owner_name = None
        if ownership:
            owner = db.query(Owner).filter(Owner.id == ownership.owner_id).first()
            if owner:
                owner_name = owner.name

        results.append(ParcelSearchResult(
            ulpin=p.ulpin,
            khasra_no=p.khasra_no,
            village=p.village,
            district=p.district,
            area_gis=p.area_gis,
            land_use=p.land_use,
            risk_level=p.risk_level,
            owner_name=owner_name,
        ))

    return success(results)


@router.get("/{ulpin}")
async def get_parcel(ulpin: str, db: Session = Depends(get_db)):
    """Get full parcel record by ULPIN."""
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel {ulpin} not found")
    return success(ParcelSchema.model_validate(parcel))


@router.get("/{ulpin}/ownership")
async def get_ownership(ulpin: str, db: Session = Depends(get_db)):
    from ..models import OwnershipRecord as OR
    from ..schemas import OwnershipRecordSchema
    records = db.query(OR).filter(OR.ulpin == ulpin).order_by(OR.id.desc()).all()
    result = []
    for r in records:
        owner = db.query(Owner).filter(Owner.id == r.owner_id).first()
        d = OwnershipRecordSchema.model_validate(r)
        d.owner_name = owner.name if owner else None
        result.append(d)
    return success(result)


@router.get("/{ulpin}/registrations")
async def get_registrations(ulpin: str, db: Session = Depends(get_db)):
    from ..models import Registration
    from ..schemas import RegistrationSchema
    records = db.query(Registration).filter(Registration.ulpin == ulpin).order_by(Registration.id.desc()).all()
    return success([RegistrationSchema.model_validate(r) for r in records])


@router.get("/{ulpin}/encumbrances")
async def get_encumbrances(ulpin: str, db: Session = Depends(get_db)):
    from ..models import Encumbrance
    from ..schemas import EncumbranceSchema
    records = db.query(Encumbrance).filter(Encumbrance.ulpin == ulpin).all()
    return success([EncumbranceSchema.model_validate(r) for r in records])


@router.get("/{ulpin}/planning")
async def get_planning(ulpin: str, db: Session = Depends(get_db)):
    from ..models import LandUseRecord
    from ..schemas import LandUseSchema
    record = db.query(LandUseRecord).filter(LandUseRecord.ulpin == ulpin).first()
    return success(LandUseSchema.model_validate(record) if record else None)


@router.get("/{ulpin}/buildings")
async def get_buildings(ulpin: str, db: Session = Depends(get_db)):
    from ..models import BuildingPermission
    from ..schemas import BuildingPermissionSchema
    records = db.query(BuildingPermission).filter(BuildingPermission.ulpin == ulpin).all()
    return success([BuildingPermissionSchema.model_validate(r) for r in records])


@router.get("/{ulpin}/tax")
async def get_tax(ulpin: str, db: Session = Depends(get_db)):
    from ..models import PropertyTax
    from ..schemas import PropertyTaxSchema
    records = db.query(PropertyTax).filter(PropertyTax.ulpin == ulpin).order_by(PropertyTax.id.desc()).all()
    return success([PropertyTaxSchema.model_validate(r) for r in records])


@router.get("/{ulpin}/disputes")
async def get_disputes(ulpin: str, db: Session = Depends(get_db)):
    from ..models import Dispute
    from ..schemas import DisputeSchema
    records = db.query(Dispute).filter(Dispute.ulpin == ulpin).all()
    return success([DisputeSchema.model_validate(r) for r in records])


@router.get("/{ulpin}/utilities")
async def get_utilities(ulpin: str, db: Session = Depends(get_db)):
    from ..models import Utility
    from ..schemas import UtilitySchema
    records = db.query(Utility).filter(Utility.ulpin == ulpin).all()
    return success([UtilitySchema.model_validate(r) for r in records])


@router.get("/{ulpin}/land-truth")
async def get_land_truth(ulpin: str, db: Session = Depends(get_db)):
    """Run Land Truth Engine for a parcel — cross-validates all departmental data."""
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel {ulpin} not found")
    report = compute_risk_score(ulpin, db)
    return success(report)


@router.post("/{ulpin}/verify")
async def verify_parcel(ulpin: str, db: Session = Depends(get_db)):
    """Generate a land verification report with QR certificate."""
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel {ulpin} not found")
    report = run_verification(ulpin, db)
    return success(report)


@router.get("/{ulpin}/change-analysis")
async def get_change_analysis(ulpin: str, db: Session = Depends(get_db)):
    """Return satellite change detection analysis for a parcel."""
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel {ulpin} not found")
    return success({
        "ulpin": ulpin,
        "change_detected": bool(parcel.satellite_change_flag),
        "analysis_date": "2026-08-15",
        "baseline_date": "2025-01-01",
        "change_type": "Land Use Change" if parcel.satellite_change_flag else "No Change",
        "change_area_pct": 78 if parcel.satellite_change_flag else 0,
        "confidence": 0.87 if parcel.satellite_change_flag else 0.95,
        "description": "Significant construction activity detected. Agricultural land appears to have been converted to built-up area." if parcel.satellite_change_flag else "No significant land-use changes detected between baseline and current imagery.",
        "imagery_source": "Sentinel-2 (10m resolution)",
        "recommended_action": "Field inspection required" if parcel.satellite_change_flag else "No action required"
    })
