import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ExternalLink, ShieldCheck, FileText, CheckCircle2,
  AlertTriangle, Building, Landmark, Scale, Zap, Clock,
  DollarSign, FileCheck, Layers
} from 'lucide-react';
import {
  getParcel, getOwnership, getRegistrations, getEncumbrances,
  getPlanning, getBuildings, getTax, getDisputes, getUtilities,
  getLandTruth
} from '../../api';
import type {
  Parcel, OwnershipRecord, Registration, Encumbrance,
  LandUseRecord, BuildingPermission, PropertyTax, Dispute,
  Utility, LandTruthReport
} from '../../types';
import TruthEngineCard from '../land-truth/TruthEngineCard';
import ConflictBadges from './ConflictBadges';
import { useParcelStore, useUiStore } from '../../store';

interface ParcelViewerProps {
  ulpin: string;
  onClose: () => void;
}

export default function ParcelViewer({ ulpin, onClose }: ParcelViewerProps) {
  const navigate = useNavigate();
  const { setActiveParcel } = useParcelStore();
  const { addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'ownership' | 'registration' | 'encumbrance' | 'planning' | 'tax' | 'disputes'>('overview');
  const [loading, setLoading] = useState(true);

  // Departmental state slices
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [ownerships, setOwnerships] = useState<OwnershipRecord[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [encumbrances, setEncumbrances] = useState<Encumbrance[]>([]);
  const [planning, setPlanning] = useState<LandUseRecord | null>(null);
  const [buildings, setBuildings] = useState<BuildingPermission[]>([]);
  const [tax, setTax] = useState<PropertyTax[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [landTruth, setLandTruth] = useState<LandTruthReport | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [
          pData, ownData, regData, encData, planData, bldData, taxData, dispData, utilData, truthData
        ] = await Promise.allSettled([
          getParcel(ulpin),
          getOwnership(ulpin),
          getRegistrations(ulpin),
          getEncumbrances(ulpin),
          getPlanning(ulpin),
          getBuildings(ulpin),
          getTax(ulpin),
          getDisputes(ulpin),
          getUtilities(ulpin),
          getLandTruth(ulpin)
        ]);

        if (!mounted) return;

        if (pData.status === 'fulfilled') {
          setParcel(pData.value);
          setActiveParcel(pData.value);
        }
        if (ownData.status === 'fulfilled') setOwnerships(ownData.value);
        if (regData.status === 'fulfilled') setRegistrations(regData.value);
        if (encData.status === 'fulfilled') setEncumbrances(encData.value);
        if (planData.status === 'fulfilled') setPlanning(planData.value);
        if (bldData.status === 'fulfilled') setBuildings(bldData.value);
        if (taxData.status === 'fulfilled') setTax(taxData.value);
        if (dispData.status === 'fulfilled') setDisputes(dispData.value);
        if (utilData.status === 'fulfilled') setUtilities(utilData.value);
        if (truthData.status === 'fulfilled') setLandTruth(truthData.value);
      } catch (err) {
        console.error('Failed to load 360 parcel records', err);
        addToast('Failed to load some departmental records', 'warning');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [ulpin]);

  return (
    <aside
      className="drawer"
      style={{
        position: 'fixed',
        top: 64,
        right: 0,
        bottom: 0,
        width: '580px',
        maxWidth: '100vw',
        background: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-10px 0 35px rgba(0,0,0,0.12)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 16,
              fontWeight: 700,
              color: '#60a5fa',
              letterSpacing: '0.04em'
            }}>
              {ulpin}
            </span>
            <span className={`badge badge-${parcel?.risk_level || 'LOW'}`}>
              {parcel?.risk_level || 'LOW'} RISK
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
            Khasra #{parcel?.khasra_no || '—'} • {parcel?.village || 'Prayagraj'}, {parcel?.district || 'UP'}
          </div>
        </div>

        <button
          onClick={onClose}
          id="btn-close-parcel-drawer"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#cbd5e1',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Close drawer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action shortcuts */}
      <div style={{
        padding: '10px 16px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: 8
      }}>
        <button
          id="btn-drawer-verify"
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/verify?ulpin=${ulpin}`)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <ShieldCheck size={14} />
          Generate Verifiable Cert
        </button>
        <button
          id="btn-drawer-docai"
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/documents?ulpin=${ulpin}`)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <FileText size={14} />
          Doc Intelligence Check
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ background: '#ffffff', padding: '0 12px' }}>
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'ownership' ? 'active' : ''}`}
          onClick={() => setActiveTab('ownership')}
        >
          Bhulekh ({ownerships.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'registration' ? 'active' : ''}`}
          onClick={() => setActiveTab('registration')}
        >
          IGRS Registry ({registrations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'encumbrance' ? 'active' : ''}`}
          onClick={() => setActiveTab('encumbrance')}
        >
          Lien/Bank ({encumbrances.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`}
          onClick={() => setActiveTab('planning')}
        >
          Planning & Zoning
        </button>
        <button
          className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          Tax & Utilities
        </button>
        <button
          className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          Disputes ({disputes.length})
        </button>
      </div>

      {/* Tab Content Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #cbd5e1', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 12, fontSize: 14 }}>Aggregating 360° departmental records...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Land Truth Engine Analysis */}
                <TruthEngineCard report={landTruth} />

                {/* Quick Attributes Card */}
                <div className="card">
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                    Parcel Geospatial Attributes
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: '#64748b' }}>ULPIN:</span>
                      <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{ulpin}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Khasra No:</span>
                      <div style={{ fontWeight: 600 }}>{parcel?.khasra_no || '—'}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>GIS Surface Area:</span>
                      <div style={{ fontWeight: 600, color: '#1a56db' }}>
                        {parcel?.area_gis ? `${parcel.area_gis.toFixed(4)} ha (${(parcel.area_gis * 2.471).toFixed(2)} acres)` : '—'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Land Use / Zoning:</span>
                      <div>
                        <span className={`badge badge-lu-${parcel?.land_use || 'Agricultural'}`}>
                          {parcel?.land_use || 'Agricultural'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Tehsil / Village:</span>
                      <div style={{ fontWeight: 600 }}>{parcel?.tehsil || 'Sadar'} / {parcel?.village || 'Jhunsi'}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Satellite Change Flag:</span>
                      <div>
                        {parcel?.satellite_change_flag ? (
                          <span className="badge badge-HIGH">Significant AI Shift</span>
                        ) : (
                          <span className="badge badge-LOW">Stable Ground</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connected Departments Checklist */}
                <div className="card" style={{ background: '#f8fafc' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>
                    Connected Department Repositories
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🌾 Revenue Dept (UP Bhulekh RoR)</span>
                      <span style={{ fontWeight: 600, color: ownerships.length ? '#10b981' : '#f59e0b' }}>
                        {ownerships.length ? `${ownerships.length} Owners Linked` : 'No Record'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📜 Registration Dept (IGRS UP)</span>
                      <span style={{ fontWeight: 600, color: registrations.length ? '#10b981' : '#64748b' }}>
                        {registrations.length ? `${registrations.length} Deeds Registered` : 'No Deeds'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🏦 Financial / Banking Liens</span>
                      <span style={{ fontWeight: 600, color: encumbrances.length ? '#ef4444' : '#10b981' }}>
                        {encumbrances.length ? `${encumbrances.length} Active Liens` : 'Lien-Free'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📐 Town Planning & Building</span>
                      <span style={{ fontWeight: 600, color: planning?.has_conflict ? '#ef4444' : '#10b981' }}>
                        {planning ? (planning.has_conflict ? 'Zoning Conflict' : 'Zoned Permitted') : 'Unzoned'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🏛️ Prayagraj Municipal Tax</span>
                      <span style={{ fontWeight: 600, color: tax.some((t) => t.status === 'OVERDUE') ? '#ef4444' : '#10b981' }}>
                        {tax.length ? `${tax.length} Assessment Cycles` : 'Not Assessed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OWNERSHIP TAB */}
            {activeTab === 'ownership' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  UP Bhulekh Record of Rights (Khatauni)
                </h4>
                {ownerships.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No ownership records linked to this ULPIN.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ownerships.map((o) => (
                      <div key={o.id} className="card card-sm" style={{ borderLeft: '4px solid #1a56db' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                            {o.owner_name}
                          </span>
                          <span className={`badge badge-${o.status || 'ACTIVE'}`}>
                            {o.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, fontSize: 12, color: '#64748b' }}>
                          <div>Share: <strong style={{ color: '#0f172a' }}>{(o.share || 1) * 100}%</strong></div>
                          <div>RoR Area: <strong style={{ color: '#0f172a' }}>{o.area_ror ? `${o.area_ror} ha` : '—'}</strong></div>
                          <div>Type: <strong>{o.ownership_type || 'Sole Owner'}</strong></div>
                          <div>From: <strong>{o.valid_from || '2018-04-01'}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REGISTRATION TAB */}
            {activeTab === 'registration' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Sub-Registrar (IGRSUP) Registered Deeds
                </h4>
                {registrations.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No registry deeds on file.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {registrations.map((r) => (
                      <div key={r.id} className="card card-sm">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>
                            Deed #{r.document_no}
                          </span>
                          <span className="badge badge-VERIFIED">{r.status || 'REGISTERED'}</span>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div><strong>Seller:</strong> {r.seller || 'State Allotment'}</div>
                          <div><strong>Buyer:</strong> {r.buyer || 'Sudha Rani'}</div>
                          <div><strong>Registered Area:</strong> {r.area_registered ? `${r.area_registered} ha` : '—'}</div>
                          <div><strong>Transaction Value:</strong> ₹{r.amount ? r.amount.toLocaleString('en-IN') : '—'}</div>
                          <div><strong>Date:</strong> {r.transaction_date || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ENCUMBRANCE TAB */}
            {activeTab === 'encumbrance' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Financial Encumbrances & Bank Mortgages
                </h4>
                {encumbrances.length === 0 ? (
                  <div style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 8,
                    padding: 16,
                    color: '#065f46',
                    fontSize: 13
                  }}>
                    <CheckCircle2 size={20} color="#059669" style={{ marginBottom: 6 }} />
                    <div style={{ fontWeight: 700 }}>Clean Title - No Encumbrances Found</div>
                    <div style={{ color: '#047857', marginTop: 4 }}>
                      No commercial mortgages, bank hypothecations, or judicial liens are active against this ULPIN.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {encumbrances.map((e) => (
                      <div key={e.id} className="card card-sm" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, color: '#991b1b' }}>{e.type || 'Bank Mortgage'}</span>
                          <span className={`badge badge-${e.status}`}>{e.status}</span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
                          <div><strong>Institution:</strong> {e.institution || 'State Bank of India'}</div>
                          <div><strong>Lien Amount:</strong> ₹{e.amount ? e.amount.toLocaleString('en-IN') : '—'}</div>
                          <div><strong>Period:</strong> {e.start_date || '—'} to {e.end_date || 'Present'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PLANNING TAB */}
            {activeTab === 'planning' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Town & Country Planning Master Plan 2031
                </h4>
                {planning && (
                  <div className="card card-sm" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                      <div>Master Plan Ref: <strong>{planning.master_plan_ref || 'Prayagraj 2031'}</strong></div>
                      <div>Zoning: <strong>{planning.zoning || 'Residential-2'}</strong></div>
                      <div>Permitted Use: <strong>{planning.permitted_use || 'Residential'}</strong></div>
                      <div>Current Ground Use: <strong>{planning.current_use || parcel?.land_use}</strong></div>
                    </div>
                    {planning.has_conflict ? (
                      <div style={{ marginTop: 10, background: '#fee2e2', padding: 8, borderRadius: 6, color: '#991b1b', fontSize: 12, fontWeight: 600 }}>
                        ⚠️ Zoning Violation: Current ground activity does not conform with Master Plan!
                      </div>
                    ) : (
                      <div style={{ marginTop: 10, background: '#d1fae5', padding: 8, borderRadius: 6, color: '#065f46', fontSize: 12, fontWeight: 600 }}>
                        ✓ Permitted conformant use under Prayagraj Development Master Plan
                      </div>
                    )}
                  </div>
                )}

                <h5 style={{ fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                  Building Sanctions & Approvals ({buildings.length})
                </h5>
                {buildings.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No building permits on record for this parcel.</p>
                ) : (
                  buildings.map((b) => (
                    <div key={b.id} className="card card-sm" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>Sanction #{b.application_no}</span>
                        <span className="badge badge-APPROVED">{b.status}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        <div>Type: {b.building_type}</div>
                        <div>Floors: {b.floors} storeys</div>
                        <div>Covered Area: {b.area_sqm} m²</div>
                        <div>Valid Until: {b.valid_until}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAX & UTILITIES TAB */}
            {activeTab === 'tax' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Nagar Nigam Prayagraj Property Tax
                </h4>
                {tax.map((t) => (
                  <div key={t.id} className="card card-sm" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>Assessment Year: {t.assessment_year}</span>
                      <span className={`badge badge-${t.status}`}>{t.status}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      <div>Annual Tax: ₹{t.annual_tax}</div>
                      <div>Paid Amount: ₹{t.paid_amount}</div>
                      <div>Assessed Area: {t.area_taxed} m²</div>
                      <div>Payment Date: {t.payment_date || 'Pending'}</div>
                    </div>
                  </div>
                ))}

                <h5 style={{ fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
                  Utility Service Connections ({utilities.length})
                </h5>
                {utilities.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No utilities registered.</p>
                ) : (
                  utilities.map((u) => (
                    <div key={u.id} className="card card-sm" style={{ marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span><strong>{u.utility_type}:</strong> {u.provider}</span>
                        <span style={{ fontFamily: 'monospace', color: '#1a56db' }}>#{u.connection_id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* DISPUTES TAB */}
            {activeTab === 'disputes' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Litigations & Court Proceedings
                </h4>
                {disputes.length === 0 ? (
                  <div style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 8,
                    padding: 16,
                    color: '#065f46',
                    fontSize: 13
                  }}>
                    <CheckCircle2 size={20} color="#059669" style={{ marginBottom: 6 }} />
                    <div style={{ fontWeight: 700 }}>Zero Active Disputes</div>
                    <div style={{ color: '#047857', marginTop: 4 }}>
                      No pending title lawsuits, partition disputes, or civil stays identified in District Court / Revenue Board records.
                    </div>
                  </div>
                ) : (
                  disputes.map((d) => (
                    <div key={d.id} className="card card-sm" style={{ borderLeft: '4px solid #ef4444', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: '#991b1b' }}>Case #{d.case_no}</span>
                        <span className="badge badge-HIGH">{d.status}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
                        <div><strong>Type:</strong> {d.type}</div>
                        <div><strong>Court:</strong> {d.court}</div>
                        <div><strong>Filing Date:</strong> {d.filed_date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
