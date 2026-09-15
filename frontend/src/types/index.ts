// BhoomiStack TypeScript Types

export interface Parcel {
  id: number;
  ulpin: string;
  khasra_no: string;
  state: string;
  district: string;
  tehsil?: string;
  village?: string;
  area_gis?: number;
  land_use?: string;
  land_type?: string;
  risk_score?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  satellite_change_flag?: number;
  geometry?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ParcelSearchResult {
  ulpin: string;
  khasra_no: string;
  village?: string;
  district?: string;
  area_gis?: number;
  land_use?: string;
  risk_level?: string;
  owner_name?: string;
}

export interface OwnershipRecord {
  id: number;
  ulpin: string;
  owner_id: number;
  owner_name?: string;
  ownership_type?: string;
  share?: number;
  area_ror?: number;
  valid_from?: string;
  valid_to?: string;
  status?: string;
}

export interface Registration {
  id: number;
  ulpin: string;
  document_no?: string;
  transaction_type?: string;
  transaction_date?: string;
  seller?: string;
  buyer?: string;
  area_registered?: number;
  amount?: number;
  status?: string;
}

export interface Encumbrance {
  id: number;
  ulpin: string;
  type?: string;
  institution?: string;
  amount?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface BuildingPermission {
  id: number;
  ulpin: string;
  application_no?: string;
  building_type?: string;
  floors?: number;
  area_sqm?: number;
  approval_date?: string;
  valid_until?: string;
  status?: string;
}

export interface LandUseRecord {
  id: number;
  ulpin: string;
  current_use?: string;
  permitted_use?: string;
  zoning?: string;
  master_plan_ref?: string;
  has_conflict?: number;
}

export interface Dispute {
  id: number;
  ulpin: string;
  case_no?: string;
  type?: string;
  status?: string;
  court?: string;
  filed_date?: string;
}

export interface PropertyTax {
  id: number;
  ulpin: string;
  assessment_year?: string;
  area_taxed?: number;
  annual_tax?: number;
  paid_amount?: number;
  payment_date?: string;
  status?: string;
}

export interface Utility {
  id: number;
  ulpin: string;
  utility_type?: string;
  provider?: string;
  connection_id?: string;
  status?: string;
}

export interface LandTruthFlag {
  flag_code: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface AreaComparison {
  gis?: number;
  ror?: number;
  registration?: number;
  tax?: number;
  max_deviation_pct?: number;
}

export interface LandTruthReport {
  ulpin: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: LandTruthFlag[];
  area_comparison: AreaComparison;
  recommendations: string[];
  data_confidence: number;
}

export interface VerificationCheck {
  check_id: string;
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail?: string;
}

export interface VerificationReport {
  verification_id: string;
  ulpin: string;
  status: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'FLAGGED';
  checks: VerificationCheck[];
  checks_passed: number;
  checks_total: number;
  owner_name?: string;
  area_gis?: number;
  land_use?: string;
  encumbrance_status: string;
  dispute_status: string;
  qr_data?: string;
  created_at: string;
}

export interface ExtractedField {
  field: string;
  extracted_value?: string;
  confidence: number;
}

export interface FieldMatch {
  field: string;
  extracted_value?: string;
  record_value?: string;
  status: 'MATCH' | 'MISMATCH' | 'PARTIAL' | 'UNAVAILABLE';
  deviation?: string;
}

export interface DocumentAnalysisResult {
  ulpin: string;
  document_type: string;
  extracted_fields: ExtractedField[];
  match_results: FieldMatch[];
  authenticity_score: number;
  recommendation: string;
}

export interface User {
  email: string;
  name: string;
  role: string;
}

export interface AuditLog {
  id: number;
  actor_id?: string;
  actor_role?: string;
  action?: string;
  table_name?: string;
  ulpin?: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  version: string;
}
