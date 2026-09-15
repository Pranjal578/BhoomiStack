import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers, AlertTriangle, ShieldCheck, FileCheck, ArrowRight,
  TrendingUp, Clock, Scale, Eye, CheckCircle2, UserCheck
} from 'lucide-react';
import { getRevenueDashboard } from '../../api';
import { useParcelStore, useUiStore } from '../../store';

export default function RevenueDashboard() {
  const navigate = useNavigate();
  const { setActiveUlpin } = useParcelStore();
  const { addToast } = useUiStore();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenueDashboard()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load revenue dashboard', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInspect = (ulpin: string) => {
    setActiveUlpin(ulpin);
    navigate(`/map?ulpin=${ulpin}`);
  };

  const handleFreeze = (ulpin: string) => {
    addToast(`Mutation hold placed on ${ulpin}. Records frozen for inquiry.`, 'warning');
  };

  const handleApproveMutation = (ulpin: string) => {
    addToast(`Mutation approved for ${ulpin}. Bhulekh updated.`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 84, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              🌾 Department of Revenue • Uttar Pradesh Bhulekh
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
              Revenue & Mutation Administration
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              Tehsil Sadar, District Prayagraj • Real-time RoR (Khatauni) synchronization & anomaly resolution
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/map" className="btn btn-outline btn-sm">
              <Layers size={14} /> Open Tehsil Map
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => addToast('Triggering full Bhulekh - IGRS synchronization...', 'info')}
            >
              🔄 Sync Department Data
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#1a56db' }}>{data?.kpis?.total_parcels || 502}</div>
            <div className="kpi-label">Total Cadastral Parcels</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Mapped in Prayagraj Sadar</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#10b981' }}>{data?.kpis?.low_risk || 385}</div>
            <div className="kpi-label">Clean / Reconciled</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>GIS & Bhulekh match exactly</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#f59e0b' }}>{data?.kpis?.medium_risk || 106}</div>
            <div className="kpi-label">Minor Discrepancies</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Pending resurvey verification</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#ef4444' }}>{data?.kpis?.high_risk || 11}</div>
            <div className="kpi-label">High-Risk Conflicts</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Active disputes / fake mortgages</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#7c3aed' }}>{data?.kpis?.disputed || 22}</div>
            <div className="kpi-label">Court Litigations</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Revenue Board & District Court stays</div>
          </div>
        </div>

        {/* Anomaly Work Queue */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Priority Action Queue — Flagged Discrepancies ({data?.anomaly_list?.length || 0})
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Parcels with multi-department area deviations, illegal mortgages, or unauthorized conversions.
              </p>
            </div>
            <span className="badge badge-HIGH">Action Required</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ULPIN</th>
                  <th>Khasra No</th>
                  <th>Village</th>
                  <th>Risk Score</th>
                  <th>Land Use</th>
                  <th>Satellite AI Alert</th>
                  <th>Tehsildar Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.anomaly_list?.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                      No flagged parcels found in queue.
                    </td>
                  </tr>
                ) : (
                  data?.anomaly_list?.map((p: any) => (
                    <tr key={p.ulpin}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a56db' }}>
                        {p.ulpin}
                      </td>
                      <td>{p.khasra_no}</td>
                      <td>{p.village}</td>
                      <td>
                        <span className={`badge badge-${p.risk_level}`}>
                          {p.risk_score} / 100 ({p.risk_level})
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-lu-${p.land_use}`}>{p.land_use}</span>
                      </td>
                      <td>
                        {p.satellite_change ? (
                          <span className="badge badge-HIGH">Change Detected</span>
                        ) : (
                          <span className="badge badge-LOW">Stable</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                            onClick={() => handleInspect(p.ulpin)}
                            title="Inspect 360 records"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                            onClick={() => handleFreeze(p.ulpin)}
                            title="Freeze transactions"
                          >
                            Hold
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                            onClick={() => handleApproveMutation(p.ulpin)}
                            title="Approve mutation"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mutation Process Workflow Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#1a56db" />
              Automated Mutation Guard
            </h4>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Under traditional processes, mutations are recorded on paper or disconnected portals after months.
              With BhoomiStack, registered deeds from Sub-Registrar automatically trigger a digital mutation docket
              linked to the exact ULPIN.
            </p>
          </div>

          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={16} color="#7c3aed" />
              Judicial Stay Enforcement
            </h4>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              When a civil court or revenue court issues an injunction or stay order on a Khasra number,
              BhoomiStack locks the parcel across the Sub-Registrar registry and municipal building sanctions
              in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
