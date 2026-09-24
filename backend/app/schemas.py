from pydantic import BaseModel
from typing import Optional, List, Any
import datetime


# --- Generic Envelope ---
class ApiResponse(BaseModel):
    success: bool = True
    data: Any
    timestamp: str = datetime.datetime.utcnow().isoformat()
    version: str = "1.0"


class ErrorResponse(BaseModel):
    success: bool = False
    error: dict


# --- Auth ---
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


# --- Parcel ---
class ParcelBase(BaseModel):
    ulpin: str
    khasra_no: str
    state: Optional[str] = "Uttar Pradesh"
    district: Optional[str] = "Prayagraj"
    tehsil: Optional[str] = None
    village: Optional[str] = None
    area_gis: Optional[float] = None
    land_use: Optional[str] = None
    land_type: Optional[str] = "Private"
    risk_score: Optional[int] = 0
    risk_level: Optional[str] = "LOW"
    satellite_change_flag: Optional[int] = 0


class ParcelSchema(ParcelBase):
    id: int
    geometry: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ParcelSearchResult(BaseModel):
    ulpin: str
    khasra_no: str
    village: Optional[str]
    district: Optional[str]
    area_gis: Optional[float]
    land_use: Optional[str]
    risk_level: Optional[str]
    owner_name: Optional[str] = None


# --- Ownership ---
class OwnerSchema(BaseModel):
    id: int
    name: str
    mobile: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


class OwnershipRecordSchema(BaseModel):
    id: int
    ulpin: str
    owner_id: int
    owner_name: Optional[str] = None
    ownership_type: Optional[str] = None
    share: Optional[float] = 1.0
    area_ror: Optional[float] = None
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None
    status: Optional[str] = "ACTIVE"

    class Config:
        from_attributes = True


# --- Registration ---
class RegistrationSchema(BaseModel):
    id: int
    ulpin: str
    document_no: Optional[str] = None
    transaction_type: Optional[str] = None
    transaction_date: Optional[str] = None
    seller: Optional[str] = None
    buyer: Optional[str] = None
    area_registered: Optional[float] = None
    amount: Optional[float] = None
    status: Optional[str] = "REGISTERED"

    class Config:
        from_attributes = True


# --- Encumbrance ---
class EncumbranceSchema(BaseModel):
    id: int
    ulpin: str
    type: Optional[str] = None
    institution: Optional[str] = None
    amount: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = "ACTIVE"

    class Config:
        from_attributes = True


# --- Building Permission ---
class BuildingPermissionSchema(BaseModel):
    id: int
    ulpin: str
    application_no: Optional[str] = None
    building_type: Optional[str] = None
    floors: Optional[int] = 1
    area_sqm: Optional[float] = None
    approval_date: Optional[str] = None
    valid_until: Optional[str] = None
    status: Optional[str] = "APPROVED"

    class Config:
        from_attributes = True


# --- Land Use ---
class LandUseSchema(BaseModel):
    id: int
    ulpin: str
    current_use: Optional[str] = None
    permitted_use: Optional[str] = None
    zoning: Optional[str] = None
    master_plan_ref: Optional[str] = None
    has_conflict: Optional[int] = 0

    class Config:
        from_attributes = True


# --- Dispute ---
class DisputeSchema(BaseModel):
    id: int
    ulpin: str
    case_no: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = "PENDING"
    court: Optional[str] = None
    filed_date: Optional[str] = None

    class Config:
        from_attributes = True


# --- Property Tax ---
class PropertyTaxSchema(BaseModel):
    id: int
    ulpin: str
    assessment_year: Optional[str] = None
    area_taxed: Optional[float] = None
    annual_tax: Optional[float] = None
    paid_amount: Optional[float] = None
    payment_date: Optional[str] = None
    status: Optional[str] = "PAID"

    class Config:
        from_attributes = True


# --- Utility ---
class UtilitySchema(BaseModel):
    id: int
    ulpin: str
    utility_type: Optional[str] = None
    provider: Optional[str] = None
    connection_id: Optional[str] = None
    status: Optional[str] = "ACTIVE"

    class Config:
        from_attributes = True


# --- Land Truth Engine ---
class LandTruthFlag(BaseModel):
    flag_code: str
    title: str
    description: str
    severity: str  # HIGH/MEDIUM/LOW
    recommendation: str


class AreaComparison(BaseModel):
    gis: Optional[float] = None
    ror: Optional[float] = None
    registration: Optional[float] = None
    tax: Optional[float] = None
    max_deviation_pct: Optional[float] = None


class LandTruthReport(BaseModel):
    ulpin: str
    risk_score: int
    risk_level: str  # LOW/MEDIUM/HIGH
    flags: List[LandTruthFlag]
    area_comparison: AreaComparison
    recommendations: List[str]
    data_confidence: int  # 0-100


# --- Verification ---
class VerificationCheck(BaseModel):
    check_id: str
    label: str
    status: str  # PASS/WARN/FAIL
    detail: Optional[str] = None


class VerificationReportSchema(BaseModel):
    verification_id: str
    ulpin: str
    status: str  # VERIFIED/PARTIALLY_VERIFIED/FLAGGED
    checks: List[VerificationCheck]
    checks_passed: int
    checks_total: int
    owner_name: Optional[str] = None
    area_gis: Optional[float] = None
    land_use: Optional[str] = None
    encumbrance_status: str
    dispute_status: str
    qr_data: Optional[str] = None  # base64 PNG
    created_at: str


# --- Audit ---
class AuditLogSchema(BaseModel):
    id: int
    actor_id: Optional[str] = None
    actor_role: Optional[str] = None
    action: Optional[str] = None
    table_name: Optional[str] = None
    ulpin: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# --- Dashboard ---
class RevenueDashboard(BaseModel):
    total_parcels: int
    verified: int
    pending_mutations: int
    disputed: int
    anomalies: int
    high_risk: int
    medium_risk: int
    low_risk: int


class PlanningDashboard(BaseModel):
    total_parcels: int
    zoning_conflicts: int
    pending_building_permits: int
    approved_permits: int
    unauthorized_construction: int
    land_use_distribution: dict


class MunicipalDashboard(BaseModel):
    total_parcels: int
    tax_paid: int
    tax_pending: int
    tax_overdue: int
    total_tax_assessed: float
    total_tax_collected: float
    utility_coverage: dict


# --- Document Intelligence ---
class DocumentAnalysisRequest(BaseModel):
    ulpin: str
    document_type: str = "Sale Deed"


class ExtractedField(BaseModel):
    field: str
    extracted_value: Optional[str]
    confidence: float  # 0-1


class FieldMatch(BaseModel):
    field: str
    extracted_value: Optional[str]
    record_value: Optional[str]
    status: str  # MATCH/MISMATCH/PARTIAL/UNAVAILABLE
    deviation: Optional[str] = None


class DocumentAnalysisResult(BaseModel):
    ulpin: str
    document_type: str
    extracted_fields: List[ExtractedField]
    match_results: List[FieldMatch]
    authenticity_score: int  # 0-100
    recommendation: str


# --- User Schemas ---
class UserSchema(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    role: str
    department: Optional[str] = None
    is_active: int = 1
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    is_active: Optional[int] = None

