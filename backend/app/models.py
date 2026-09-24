from sqlalchemy import Column, Integer, String, Float, Text, DateTime, event
from .database import Base, IS_POSTGRES
import datetime

# PostGIS integration via GeoAlchemy2
HAS_GEOALCHEMY = False
if IS_POSTGRES:
    try:
        from geoalchemy2 import Geometry
        HAS_GEOALCHEMY = True
    except ImportError:
        HAS_GEOALCHEMY = False


def now():
    return datetime.datetime.utcnow().isoformat()


class Parcel(Base):
    __tablename__ = "parcels"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, unique=True, index=True, nullable=False)
    khasra_no = Column(String, nullable=False)
    state = Column(String, default="Uttar Pradesh")
    district = Column(String, default="Prayagraj")
    tehsil = Column(String)
    village = Column(String)
    area_gis = Column(Float)  # hectares
    land_use = Column(String)  # Agricultural/Residential/Commercial/Industrial/Government
    land_type = Column(String, default="Private")  # Private/Government/Forest
    geometry = Column(Text)  # GeoJSON polygon as JSON string
    
    # PostGIS Spatial Column (SRID 4326: WGS84 GPS Coordinates)
    if HAS_GEOALCHEMY:
        geom = Column(Geometry(geometry_type='GEOMETRY', srid=4326, spatial_index=True), nullable=True)

    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="LOW")
    satellite_change_flag = Column(Integer, default=0)
    created_at = Column(String, default=now)
    updated_at = Column(String, default=now)


if HAS_GEOALCHEMY:
    @event.listens_for(Parcel, "before_insert")
    @event.listens_for(Parcel, "before_update")
    def sync_geom_from_geojson(mapper, connection, target):
        """Automatically keep PostGIS spatial geom in sync with GeoJSON text."""
        if target.geometry and not getattr(target, "geom", None):
            try:
                import json
                from shapely.geometry import shape
                import shapely.wkt
                geom_dict = json.loads(target.geometry)
                shply_geom = shape(geom_dict)
                target.geom = f"SRID=4326;{shapely.wkt.dumps(shply_geom)}"
            except Exception:
                pass


class Owner(Base):
    __tablename__ = "owners"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    aadhaar_hash = Column(String)
    mobile = Column(String)
    email = Column(String)


class OwnershipRecord(Base):
    __tablename__ = "ownership_records"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    owner_id = Column(Integer)
    ownership_type = Column(String, default="Sole")  # Sole/Joint/Inherited
    share = Column(Float, default=1.0)
    area_ror = Column(Float)  # area per RoR (may differ from GIS)
    valid_from = Column(String)
    valid_to = Column(String)
    status = Column(String, default="ACTIVE")  # ACTIVE/HISTORICAL


class Registration(Base):
    __tablename__ = "registrations"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    document_no = Column(String, unique=True)
    transaction_type = Column(String)  # Sale/Gift/Mortgage/Partition
    transaction_date = Column(String)
    seller = Column(String)
    buyer = Column(String)
    area_registered = Column(Float)
    amount = Column(Float)
    status = Column(String, default="REGISTERED")


class Encumbrance(Base):
    __tablename__ = "encumbrances"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    type = Column(String)  # Mortgage/Lien/Charge
    institution = Column(String)
    amount = Column(Float)
    start_date = Column(String)
    end_date = Column(String)
    status = Column(String, default="ACTIVE")  # ACTIVE/RELEASED


class BuildingPermission(Base):
    __tablename__ = "building_permissions"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    application_no = Column(String, unique=True)
    building_type = Column(String)  # Residential/Commercial/Industrial
    floors = Column(Integer, default=1)
    area_sqm = Column(Float)
    approval_date = Column(String)
    valid_until = Column(String)
    status = Column(String, default="APPROVED")  # APPROVED/PENDING/REJECTED/EXPIRED


class LandUseRecord(Base):
    __tablename__ = "land_use_records"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    current_use = Column(String)
    permitted_use = Column(String)
    zoning = Column(String)  # R1/R2/C1/C2/I1/AG
    master_plan_ref = Column(String)
    has_conflict = Column(Integer, default=0)


class Dispute(Base):
    __tablename__ = "disputes"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    case_no = Column(String, unique=True)
    type = Column(String)  # Boundary/Title/Inheritance/Encroachment
    status = Column(String, default="PENDING")  # PENDING/RESOLVED/APPEALED
    court = Column(String)
    filed_date = Column(String)


class PropertyTax(Base):
    __tablename__ = "property_tax"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    assessment_year = Column(String)
    area_taxed = Column(Float)  # may differ from GIS area
    annual_tax = Column(Float)
    paid_amount = Column(Float)
    payment_date = Column(String)
    status = Column(String, default="PAID")  # PAID/PENDING/OVERDUE


class Utility(Base):
    __tablename__ = "utilities"
    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String, index=True)
    utility_type = Column(String)  # Water/Electricity/Sewage/Gas
    provider = Column(String)
    connection_id = Column(String)
    status = Column(String, default="ACTIVE")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(String)
    actor_role = Column(String)
    action = Column(String)  # CREATE/UPDATE/DELETE/VIEW
    table_name = Column(String)
    ulpin = Column(String)
    old_value = Column(Text)
    new_value = Column(Text)
    ip_address = Column(String)
    created_at = Column(String, default=now)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # bcrypt hash
    name = Column(String)
    role = Column(String, nullable=False)
    department = Column(String)
    is_active = Column(Integer, default=1)
    created_at = Column(String, default=now)


class VerificationReport(Base):
    __tablename__ = "verification_reports"
    id = Column(Integer, primary_key=True, index=True)
    verification_id = Column(String, unique=True, index=True)
    ulpin = Column(String, index=True)
    status = Column(String)  # VERIFIED/PARTIALLY_VERIFIED/FLAGGED
    checks_passed = Column(Integer)
    checks_total = Column(Integer)
    report_data = Column(Text)  # JSON
    qr_data = Column(Text)  # base64 QR image
    created_at = Column(String, default=now)
