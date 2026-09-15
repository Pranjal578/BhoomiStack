"""
Dashboard router — aggregated KPIs for officer dashboards.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Parcel, Dispute, BuildingPermission, PropertyTax, Utility, LandUseRecord
from ..schemas import RevenueDashboard, PlanningDashboard, MunicipalDashboard

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def success(data):
    import datetime
    return {"success": True, "data": data, "timestamp": datetime.datetime.utcnow().isoformat(), "version": "1.0"}


@router.get("/revenue")
async def revenue_dashboard(db: Session = Depends(get_db)):
    total = db.query(Parcel).count()
    verified = db.query(Parcel).filter(Parcel.risk_level == "LOW").count()
    disputed = db.query(Dispute).filter(Dispute.status == "PENDING").count()
    anomalies = db.query(Parcel).filter(Parcel.risk_score > 60).count()
    high_risk = db.query(Parcel).filter(Parcel.risk_level == "HIGH").count()
    medium_risk = db.query(Parcel).filter(Parcel.risk_level == "MEDIUM").count()
    low_risk = db.query(Parcel).filter(Parcel.risk_level == "LOW").count()

    # Anomaly list
    anomaly_parcels = db.query(Parcel).filter(Parcel.risk_score > 30).order_by(Parcel.risk_score.desc()).limit(20).all()
    anomaly_list = [{
        "ulpin": p.ulpin, "khasra_no": p.khasra_no, "village": p.village,
        "risk_score": p.risk_score, "risk_level": p.risk_level,
        "satellite_change": bool(p.satellite_change_flag), "land_use": p.land_use
    } for p in anomaly_parcels]

    return success({
        "kpis": {
            "total_parcels": total,
            "verified": verified,
            "pending_mutations": 47,  # synthetic
            "disputed": disputed,
            "anomalies": anomalies,
            "high_risk": high_risk,
            "medium_risk": medium_risk,
            "low_risk": low_risk,
        },
        "anomaly_list": anomaly_list,
        "weekly_anomalies": [12, 8, 15, 23, 18, 31, 27],  # last 7 weeks
    })


@router.get("/planning")
async def planning_dashboard(db: Session = Depends(get_db)):
    total = db.query(Parcel).count()
    zoning_conflicts = db.query(LandUseRecord).filter(LandUseRecord.has_conflict == 1).count()
    pending_permits = db.query(BuildingPermission).filter(BuildingPermission.status == "PENDING").count()
    approved_permits = db.query(BuildingPermission).filter(BuildingPermission.status == "APPROVED").count()
    satellite_changes = db.query(Parcel).filter(Parcel.satellite_change_flag == 1).count()

    # Land use distribution
    land_uses = db.query(Parcel.land_use).all()
    dist = {}
    for (lu,) in land_uses:
        dist[lu or "Unknown"] = dist.get(lu or "Unknown", 0) + 1

    conflict_parcels = db.query(LandUseRecord).filter(LandUseRecord.has_conflict == 1).limit(10).all()

    return success({
        "kpis": {
            "total_parcels": total,
            "zoning_conflicts": zoning_conflicts,
            "pending_building_permits": pending_permits,
            "approved_permits": approved_permits,
            "unauthorized_construction": satellite_changes,
        },
        "land_use_distribution": dist,
        "conflict_list": [{
            "ulpin": c.ulpin, "current_use": c.current_use,
            "permitted_use": c.permitted_use, "zoning": c.zoning
        } for c in conflict_parcels],
    })


@router.get("/municipal")
async def municipal_dashboard(db: Session = Depends(get_db)):
    total = db.query(Parcel).count()
    tax_paid = db.query(PropertyTax).filter(PropertyTax.status == "PAID").count()
    tax_pending = db.query(PropertyTax).filter(PropertyTax.status == "PENDING").count()
    tax_overdue = db.query(PropertyTax).filter(PropertyTax.status == "OVERDUE").count()

    tax_records = db.query(PropertyTax).all()
    total_assessed = sum(t.annual_tax or 0 for t in tax_records)
    total_collected = sum(t.paid_amount or 0 for t in tax_records)

    # Utility coverage
    utility_types = ["Water", "Electricity", "Sewage", "Gas"]
    utility_coverage = {}
    for ut in utility_types:
        count = db.query(Utility).filter(Utility.utility_type == ut, Utility.status == "ACTIVE").count()
        utility_coverage[ut] = round(count / max(total, 1) * 100, 1)

    return success({
        "kpis": {
            "total_parcels": total,
            "tax_paid": tax_paid,
            "tax_pending": tax_pending,
            "tax_overdue": tax_overdue,
            "total_tax_assessed": round(total_assessed, 2),
            "total_tax_collected": round(total_collected, 2),
        },
        "utility_coverage": utility_coverage,
    })
