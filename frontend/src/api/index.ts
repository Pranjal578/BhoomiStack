import client from './client';
import type {
  Parcel, ParcelSearchResult, OwnershipRecord, Registration, Encumbrance,
  BuildingPermission, LandUseRecord, Dispute, PropertyTax, Utility,
  LandTruthReport, VerificationReport, DocumentAnalysisResult, AuditLog, ApiResponse
} from '../types';

// --- Parcel ---
export const getGeoJSON = async () => {
  const { data } = await client.get('/parcels/geojson');
  return data;
};

export const searchParcels = async (q: string): Promise<ParcelSearchResult[]> => {
  const { data } = await client.get<ApiResponse<ParcelSearchResult[]>>(`/parcels/search?q=${encodeURIComponent(q)}`);
  return data.data;
};

export const getParcel = async (ulpin: string): Promise<Parcel> => {
  const { data } = await client.get<ApiResponse<Parcel>>(`/parcels/${ulpin}`);
  return data.data;
};

export const getOwnership = async (ulpin: string): Promise<OwnershipRecord[]> => {
  const { data } = await client.get<ApiResponse<OwnershipRecord[]>>(`/parcels/${ulpin}/ownership`);
  return data.data;
};

export const getRegistrations = async (ulpin: string): Promise<Registration[]> => {
  const { data } = await client.get<ApiResponse<Registration[]>>(`/parcels/${ulpin}/registrations`);
  return data.data;
};

export const getEncumbrances = async (ulpin: string): Promise<Encumbrance[]> => {
  const { data } = await client.get<ApiResponse<Encumbrance[]>>(`/parcels/${ulpin}/encumbrances`);
  return data.data;
};

export const getPlanning = async (ulpin: string): Promise<LandUseRecord | null> => {
  const { data } = await client.get<ApiResponse<LandUseRecord | null>>(`/parcels/${ulpin}/planning`);
  return data.data;
};

export const getBuildings = async (ulpin: string): Promise<BuildingPermission[]> => {
  const { data } = await client.get<ApiResponse<BuildingPermission[]>>(`/parcels/${ulpin}/buildings`);
  return data.data;
};

export const getTax = async (ulpin: string): Promise<PropertyTax[]> => {
  const { data } = await client.get<ApiResponse<PropertyTax[]>>(`/parcels/${ulpin}/tax`);
  return data.data;
};

export const getDisputes = async (ulpin: string): Promise<Dispute[]> => {
  const { data } = await client.get<ApiResponse<Dispute[]>>(`/parcels/${ulpin}/disputes`);
  return data.data;
};

export const getUtilities = async (ulpin: string): Promise<Utility[]> => {
  const { data } = await client.get<ApiResponse<Utility[]>>(`/parcels/${ulpin}/utilities`);
  return data.data;
};

export const getLandTruth = async (ulpin: string): Promise<LandTruthReport> => {
  const { data } = await client.get<ApiResponse<LandTruthReport>>(`/parcels/${ulpin}/land-truth`);
  return data.data;
};

export const verifyParcel = async (ulpin: string): Promise<VerificationReport> => {
  const { data } = await client.post<ApiResponse<VerificationReport>>(`/parcels/${ulpin}/verify`);
  return data.data;
};

export const getChangeAnalysis = async (ulpin: string) => {
  const { data } = await client.get(`/parcels/${ulpin}/change-analysis`);
  return data.data;
};

export const getVerification = async (verificationId: string): Promise<VerificationReport> => {
  const { data } = await client.get<ApiResponse<VerificationReport>>(`/verify/${verificationId}`);
  return data.data;
};

// --- Documents ---
export const analyzeDocument = async (ulpin: string, documentType: string): Promise<DocumentAnalysisResult> => {
  const { data } = await client.post<ApiResponse<DocumentAnalysisResult>>('/documents/analyze', {
    ulpin, document_type: documentType
  });
  return data.data;
};

// --- Auth ---
export const login = async (email: string, password: string) => {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
};

// --- Dashboard ---
export const getRevenueDashboard = async () => {
  const { data } = await client.get('/dashboard/revenue');
  return data.data;
};

export const getPlanningDashboard = async () => {
  const { data } = await client.get('/dashboard/planning');
  return data.data;
};

export const getMunicipalDashboard = async () => {
  const { data } = await client.get('/dashboard/municipal');
  return data.data;
};

// --- Audit ---
export const getAuditLogs = async (params?: { ulpin?: string; action?: string; limit?: number }): Promise<AuditLog[]> => {
  const q = new URLSearchParams();
  if (params?.ulpin) q.set('ulpin', params.ulpin);
  if (params?.action) q.set('action', params.action);
  if (params?.limit) q.set('limit', String(params.limit));
  const { data } = await client.get<ApiResponse<AuditLog[]>>(`/audit-logs?${q}`);
  return data.data;
};
