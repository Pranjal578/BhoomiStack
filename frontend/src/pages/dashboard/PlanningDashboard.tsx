import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, AlertTriangle, CheckCircle, ShieldAlert, Eye,
  FileCheck, Layers, Sparkles, Hammer
} from 'lucide-react';
import { getPlanningDashboard } from '../../api';
import { useParcelStore, useUiStore } from '../../store';

export default function PlanningDashboard() {
  const navigate = useNavigate();
  const { setActiveUlpin } = useParcelStore();
  const { addToast } = useUiStore();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlanningDashboard()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load planning dashboard', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInspect = (ulpin: string) => {
    setActiveUlpin(ulpin);
    navigate(`/map?ulpin=${ulpin}`);
  };

  const handleStopWork = (ulpin: string) => {
    addToast(`Stop-work & sealing notice dispatched for ${ulpin}.`, 'error');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 84, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#ede9fe', color: '#6d28d9', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              📐 Town & Country Planning • Prayagraj Development Authority (PDA)
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
              Zoning & Master Plan 2031 Administration
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              Cadastral-level master plan overlay, building sanction audits, and satellite AI unauthorized construction tracking
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/map" className="btn btn-outline btn-sm">
              <Layers size={14} /> View Master Plan Overlay
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#1a56db' }}>{data?.kpis?.total_parcels || 502}</div>
            <div className="kpi-label">Master Plan Parcels</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Covered under PDA Master Plan</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#ef4444' }}>{data?.kpis?.zoning_conflicts || 14}</div>
            <div className="kpi-label">Zoning Violations</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Ground use contradicts Master Plan</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#f59e0b' }}>{data?.kpis?.pending_building_permits || 9}</div>
            <div className="kpi-label">Sanctions in Review</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Architectural plans submitted</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#10b981' }}>{data?.kpis?.approved_permits || 68}</div>
            <div className="kpi-label">Approved Sanctions</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Compliant building permits</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#7c3aed' }}>{data?.kpis?.unauthorized_construction || 19}</div>
            <div className="kpi-label">Satellite AI Alerts</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Unapproved footprint expansion</div>
          </div>
        </div>

        {/* Land Use Breakdown & Zoning Conflict Queue */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 28 }}>
          {/* Land Use Mix */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              Planned Land Use Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.land_use_distribution && Object.entries(data.land_use_distribution).map(([lu, count]: [string, any]) => {
                const total = data.kpis?.total_parcels || 502;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={lu}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{lu}</span>
                      <span style={{ color: '#64748b' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: lu === 'Agricultural' ? '#10b981' : lu === 'Residential' ? '#3b82f6' : lu === 'Commercial' ? '#7c3aed' : '#ea580c'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zoning Violations Queue */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                  Master Plan Violations & Illegal Conversions ({data?.conflict_list?.length || 0})
                </h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>
                  Parcels where current commercial or residential ground footprint violates designated zoning.
                </p>
              </div>
              <span className="badge badge-HIGH">High Priority</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>ULPIN</th>
                  <th>Current Use</th>
                  <th>Permitted Master Plan Use</th>
                  <th>Zoning</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.conflict_list?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                      No zoning violations recorded.
                    </td>
                  </tr>
                ) : (
                  data?.conflict_list?.map((c: any) => (
                    <tr key={c.ulpin}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a56db' }}>
                        {c.ulpin}
                      </td>
                      <td>
                        <span className="badge badge-HIGH">{c.current_use}</span>
                      </td>
                      <td>
                        <span className="badge badge-VERIFIED">{c.permitted_use}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>{c.zoning}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleInspect(c.ulpin)}
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleStopWork(c.ulpin)}
                          >
                            <Hammer size={12} /> Notice
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
      </div>
    </div>
  );
}
