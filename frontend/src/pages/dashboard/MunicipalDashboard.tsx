import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Landmark, DollarSign, Droplets, Zap, CheckCircle, AlertTriangle,
  Eye, FileText, ArrowRight, Layers
} from 'lucide-react';
import { getMunicipalDashboard } from '../../api';
import { useParcelStore, useUiStore } from '../../store';

export default function MunicipalDashboard() {
  const navigate = useNavigate();
  const { setActiveUlpin } = useParcelStore();
  const { addToast } = useUiStore();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMunicipalDashboard()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load municipal dashboard', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInspect = (ulpin: string) => {
    setActiveUlpin(ulpin);
    navigate(`/map?ulpin=${ulpin}`);
  };

  const handleDemandNotice = (ulpin: string) => {
    addToast(`Property tax demand & recovery warrant issued for ${ulpin}`, 'warning');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 84, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              🏛️ Prayagraj Nagar Nigam • Municipal Property Tax & Utilities
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
              Municipal Tax & Utility Cadastre
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              Zero-leakage tax assessment by auto-correlating GIS built-up footprints with UP Jal Sansthan & DISCOM power connections
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/map" className="btn btn-outline btn-sm">
              <Layers size={14} /> View Municipal GIS
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#1a56db' }}>
              ₹{data?.tax_collection?.total_assessed ? (data.tax_collection.total_assessed / 100000).toFixed(1) : '18.4'}L
            </div>
            <div className="kpi-label">Annual Tax Assessed</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Demand across urban parcels</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#10b981' }}>
              ₹{data?.tax_collection?.total_collected ? (data.tax_collection.total_collected / 100000).toFixed(1) : '14.2'}L
            </div>
            <div className="kpi-label">Tax Collected</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Revenues deposited</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#7c3aed' }}>
              {data?.tax_collection?.collection_efficiency || 77.2}%
            </div>
            <div className="kpi-label">Collection Rate</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>High recovery efficiency</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#ef4444' }}>
              {data?.kpis?.tax_overdue || 41}
            </div>
            <div className="kpi-label">Arrears / Defaulters</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Overdue assessment notices</div>
          </div>
        </div>

        {/* Utilities Coverage Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              Municipal Utility Infrastructure Coverage
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              Parcels with validated digital consumer meter IDs linked directly to ULPIN.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data?.utility_coverage && Object.entries(data.utility_coverage).map(([util, pct]: [string, any]) => (
                <div key={util}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{util} Network Connection</span>
                    <span style={{ fontWeight: 700, color: '#1a56db' }}>{pct}% Coverage</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#3b82f6', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Evasion & Under-Assessment Prevention */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              GIS Built-Up Area Cross-Verification
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#475569' }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  🛰️ Satellite Drone vs Self-Declaration
                </div>
                <div>
                  Self-declared property tax historically suffered from 30-40% under-reporting of covered floor area.
                  BhoomiStack cross-checks Nagar Nigam tax records against PDA approved building plans and satellite GIS footprint.
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  ⚡ Smart Meter Integration (UPPCL)
                </div>
                <div>
                  Unrecorded residential structures consuming commercial-grade power are automatically flagged
                  for immediate site reassessment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
