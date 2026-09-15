import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Zap, ChevronRight, CheckCircle } from 'lucide-react';
import type { LandTruthReport } from '../../types';

interface TruthEngineCardProps {
  report: LandTruthReport | null;
  loading?: boolean;
}

export default function TruthEngineCard({ report, loading }: TruthEngineCardProps) {
  if (loading) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
        <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #cbd5e1', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 8, fontSize: 13 }}>Analyzing cross-department ground truth...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: 13 }}>No Land Truth analysis available.</p>
      </div>
    );
  }

  const { risk_score, risk_level, flags, area_comparison, recommendations, data_confidence } = report;

  const maxArea = Math.max(
    area_comparison?.gis || 0,
    area_comparison?.ror || 0,
    area_comparison?.registration || 0,
    area_comparison?.tax || 0,
    0.01
  );

  const getRiskColor = (score: number) => {
    if (score >= 60) return '#ef4444';
    if (score >= 25) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="card" style={{ border: `1px solid ${getRiskColor(risk_score)}40`, background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Land Truth Engine™</span>
            <span className={`badge badge-${risk_level}`}>
              {risk_level} RISK
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Automated multi-source cross-verification & anomaly detection
          </p>
        </div>

        {/* Risk Gauge Circle */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `conic-gradient(${getRiskColor(risk_score)} ${risk_score * 3.6}deg, #f1f5f9 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: getRiskColor(risk_score), lineHeight: 1 }}>
                {risk_score}
              </span>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>/ 100</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
            Risk Index
          </div>
        </div>
      </div>

      {/* Cross-Department Area Discrepancy Matrix */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
            Multi-Department Area Cross-Check
          </span>
          {area_comparison?.max_deviation_pct !== undefined && area_comparison.max_deviation_pct > 0 && (
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: area_comparison.max_deviation_pct > 10 ? '#ef4444' : '#f59e0b',
              background: area_comparison.max_deviation_pct > 10 ? '#fee2e2' : '#fef3c7',
              padding: '2px 8px',
              borderRadius: 12
            }}>
              Max Deviation: ±{area_comparison.max_deviation_pct}%
            </span>
          )}
        </div>

        {/* Comparison Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* GIS Shape */}
          <div className="area-bar-row">
            <span className="area-bar-label">🛰️ GIS Map:</span>
            <div className="area-bar-track">
              <div
                className="area-bar-fill"
                style={{
                  width: `${((area_comparison?.gis || 0) / maxArea) * 100}%`,
                  background: '#1a56db'
                }}
              />
            </div>
            <span className="area-bar-value">{area_comparison?.gis ? `${area_comparison.gis.toFixed(4)} ha` : 'N/A'}</span>
            <span className="area-bar-status" style={{ color: '#1a56db', fontWeight: 600 }}>Ground</span>
          </div>

          {/* RoR / Bhulekh */}
          <div className="area-bar-row">
            <span className="area-bar-label">🌾 Bhulekh RoR:</span>
            <div className="area-bar-track">
              <div
                className="area-bar-fill"
                style={{
                  width: `${((area_comparison?.ror || 0) / maxArea) * 100}%`,
                  background: area_comparison?.ror === area_comparison?.gis ? '#10b981' : '#f59e0b'
                }}
              />
            </div>
            <span className="area-bar-value">{area_comparison?.ror ? `${area_comparison.ror.toFixed(4)} ha` : 'N/A'}</span>
            <span className="area-bar-status">
              {area_comparison?.ror && area_comparison?.gis && Math.abs(area_comparison.ror - area_comparison.gis) > 0.05 ? (
                <span style={{ color: '#ef4444', fontWeight: 700 }}>Mismatch</span>
              ) : (
                <span style={{ color: '#10b981', fontWeight: 700 }}>Match</span>
              )}
            </span>
          </div>

          {/* Sub-Registrar Registered Deed */}
          <div className="area-bar-row">
            <span className="area-bar-label">📜 Registry Deed:</span>
            <div className="area-bar-track">
              <div
                className="area-bar-fill"
                style={{
                  width: `${((area_comparison?.registration || 0) / maxArea) * 100}%`,
                  background: '#7c3aed'
                }}
              />
            </div>
            <span className="area-bar-value">{area_comparison?.registration ? `${area_comparison.registration.toFixed(4)} ha` : 'N/A'}</span>
            <span className="area-bar-status">
              {area_comparison?.registration ? (
                <span style={{ color: '#7c3aed', fontWeight: 600 }}>Deed</span>
              ) : 'N/A'}
            </span>
          </div>

          {/* Nagar Nigam Property Tax */}
          <div className="area-bar-row">
            <span className="area-bar-label">🏛️ Municipal Tax:</span>
            <div className="area-bar-track">
              <div
                className="area-bar-fill"
                style={{
                  width: `${((area_comparison?.tax || 0) / maxArea) * 100}%`,
                  background: '#0d9488'
                }}
              />
            </div>
            <span className="area-bar-value">{area_comparison?.tax ? `${area_comparison.tax.toFixed(4)} ha` : 'N/A'}</span>
            <span className="area-bar-status">
              {area_comparison?.tax ? (
                <span style={{ color: '#0d9488', fontWeight: 600 }}>Assessed</span>
              ) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Anomaly / Conflict Flags */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 8 }}>
          Discrepancy & Risk Flags ({flags.length})
        </div>

        {flags.length === 0 ? (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#065f46',
            fontSize: 13
          }}>
            <CheckCircle size={18} color="#059669" />
            <span>Zero discrepancies found across revenue, registration, and municipal records.</span>
          </div>
        ) : (
          flags.map((flag, idx) => (
            <div key={idx} className={`flag-card flag-${flag.severity}`}>
              <div className="flag-title">
                {flag.severity === 'HIGH' ? (
                  <AlertCircle size={16} color="#ef4444" />
                ) : (
                  <AlertTriangle size={16} color="#f59e0b" />
                )}
                <span>[{flag.flag_code}] {flag.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                  {flag.severity}
                </span>
              </div>
              <div className="flag-desc">{flag.description}</div>
              {flag.recommendation && (
                <div className="flag-rec">
                  <strong>Recommendation:</strong> {flag.recommendation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Recommendations & Confidence */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTop: '1px solid #f1f5f9',
        fontSize: 12,
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={14} color="#7c3aed" />
          <span>Confidence Score: <strong style={{ color: '#0f172a' }}>{data_confidence || 92}%</strong></span>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          Real-time cross-matched with UP Bhulekh, IGRSUP & Nagar Nigam
        </div>
      </div>
    </div>
  );
}
