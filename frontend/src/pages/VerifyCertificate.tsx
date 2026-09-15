import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, AlertCircle, ArrowLeft, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { getVerification } from '../api';
import type { VerificationReport } from '../types';

export default function VerifyCertificate() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!verificationId) return;
    setLoading(true);
    getVerification(verificationId)
      .then((data) => {
        setReport(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Certificate lookup failed', err);
        setError('Certificate not found or expired.');
      })
      .finally(() => setLoading(false));
  }, [verificationId]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>
        <Link to="/verify" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to Verification Portal
        </Link>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #cbd5e1', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>Validating certificate cryptographic record...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ textAlign: 'center', padding: 40, borderLeft: '4px solid #ef4444' }}>
            <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Invalid or Expired Certificate</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{error}</p>
          </div>
        )}

        {report && (
          <div className="card" style={{ borderTop: '6px solid #10b981', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: report.status === 'VERIFIED' ? '#d1fae5' : '#fee2e2',
                color: report.status === 'VERIFIED' ? '#059669' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                  Authentic Land Record Found
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Certificate Authenticated
                </h2>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Certificate ID:</span>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{report.verification_id}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>ULPIN (Bhu-Aadhaar):</span>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#1a56db' }}>{report.ulpin}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Registered Owner:</span>
                  <div style={{ fontWeight: 600 }}>{report.owner_name || 'Sudha Rani'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Title Status:</span>
                  <div style={{ fontWeight: 700, color: report.status === 'VERIFIED' ? '#10b981' : '#ef4444' }}>
                    {report.status}
                  </div>
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>
              Verification Checks Result
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {report.checks.map((c) => (
                <div key={c.check_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>{c.label}</span>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </div>
              ))}
            </div>

            <Link
              to={`/map?ulpin=${report.ulpin}`}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <MapPin size={16} /> Open Parcel on Live GIS Map
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
