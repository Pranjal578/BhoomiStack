import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Printer,
  Share2, ArrowRight, ExternalLink, Download, FileText, Search, RefreshCw
} from 'lucide-react';
import { verifyParcel } from '../api';
import type { VerificationReport } from '../types';
import { useUiStore } from '../store';

export default function VerificationPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useUiStore();

  const [inputUlpin, setInputUlpin] = useState(searchParams.get('ulpin') || 'UP-PRY-000042');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [animationStep, setAnimationStep] = useState<number>(0);

  const runVerification = async (targetUlpin: string) => {
    if (!targetUlpin.trim()) return;
    setLoading(true);
    setReport(null);
    setAnimationStep(0);

    try {
      const data = await verifyParcel(targetUlpin.trim().toUpperCase());
      setReport(data);

      // Animate the verification checks appearing sequentially
      for (let i = 1; i <= data.checks.length; i++) {
        setTimeout(() => {
          setAnimationStep(i);
        }, i * 220);
      }
      addToast(`Verification complete for ${targetUlpin.trim()}`, 'success');
    } catch (err) {
      console.error('Verification failed', err);
      addToast('Verification failed. Check ULPIN.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryUlpin = searchParams.get('ulpin');
    if (queryUlpin) {
      setInputUlpin(queryUlpin);
      runVerification(queryUlpin);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'VERIFIED') {
      return (
        <span className="badge badge-VERIFIED" style={{ fontSize: 13, padding: '4px 12px' }}>
          <CheckCircle2 size={14} /> CERTIFIED TITLE (CLEAN)
        </span>
      );
    }
    if (status === 'PARTIALLY_VERIFIED') {
      return (
        <span className="badge badge-PARTIALLY_VERIFIED" style={{ fontSize: 13, padding: '4px 12px' }}>
          <AlertTriangle size={14} /> CONDITIONAL / PARTIAL
        </span>
      );
    }
    return (
      <span className="badge badge-FLAGGED" style={{ fontSize: 13, padding: '4px 12px' }}>
        <AlertCircle size={14} /> FLAGGED / HIGH RISK
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px' }}>
        {/* Page Title & Pitch */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 14px',
            background: '#e0e7ff',
            color: '#3730a3',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12
          }}>
            <ShieldCheck size={16} />
            Single-Window Public Land Verification Portal
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
            Instant Land Title Verification
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 540, margin: '8px auto 0' }}>
            Enter any ULPIN to generate a legally verifiable, multi-department verified title certificate with cryptographic QR.
          </p>
        </div>

        {/* Input Bar */}
        <div className="card" style={{ marginBottom: 32, padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                id="verify-ulpin-input"
                type="text"
                value={inputUlpin}
                onChange={(e) => setInputUlpin(e.target.value)}
                placeholder="Enter ULPIN (e.g. UP-PRY-000042 or UP-PRY-001245)..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
            <button
              id="btn-run-verify"
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={() => runVerification(inputUlpin)}
              style={{ minWidth: 160, justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Verify Records
                </>
              )}
            </button>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 12, color: '#64748b', alignItems: 'center' }}>
            <span>Presets:</span>
            <button
              type="button"
              className="badge badge-ulpin"
              style={{ background: '#064e3b', borderColor: '#10b981', color: '#a7f3d0' }}
              onClick={() => { setInputUlpin('UP-PRY-000042'); runVerification('UP-PRY-000042'); }}
            >
              Clean Title: UP-PRY-000042
            </button>
            <button
              type="button"
              className="badge badge-ulpin"
              style={{ background: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5' }}
              onClick={() => { setInputUlpin('UP-PRY-001245'); runVerification('UP-PRY-001245'); }}
            >
              Flagged Risk: UP-PRY-001245
            </button>
          </div>
        </div>

        {/* Certificate Display */}
        {report && (
          <div>
            <div className="certificate" id="printable-certificate">
              {/* Certificate Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                color: '#ffffff',
                padding: '24px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: '#3b82f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14
                    }}>
                      भू
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
                      BhoomiStack Title Verification Certificate
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#93c5fd', marginTop: 4 }}>
                    Government of Uttar Pradesh • Land Governance Digital Public Infrastructure
                  </div>
                  <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 6, fontFamily: 'monospace' }}>
                    Verification ID: {report.verification_id}
                  </div>
                </div>

                {/* Scannable QR */}
                <div style={{
                  background: '#ffffff',
                  padding: 8,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${report.verification_id}`}
                    size={84}
                    level="H"
                  />
                  <div style={{ fontSize: 9, color: '#0f172a', textAlign: 'center', marginTop: 3, fontWeight: 700 }}>
                    SCAN TO VERIFY
                  </div>
                </div>
              </div>

              {/* Certificate Body */}
              <div style={{ padding: '24px 28px' }}>
                {/* Status Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  marginBottom: 20
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      Certification Status
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      Automated Checks Passed
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                      {report.checks_passed} / {report.checks_total}
                    </div>
                  </div>
                </div>

                {/* Parcel Particulars */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 12, letterSpacing: '0.05em' }}>
                    Parcel Identity & Particulars
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 11 }}>ULPIN (Bhu-Aadhaar):</span>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#1a56db' }}>{report.ulpin}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 11 }}>Primary Title Holder:</span>
                      <div style={{ fontWeight: 700 }}>{report.owner_name || 'Sudha Rani'}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 11 }}>GIS Cadastral Area:</span>
                      <div style={{ fontWeight: 700 }}>{report.area_gis ? `${report.area_gis.toFixed(4)} ha` : '—'}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 11 }}>Encumbrance/Lien Status:</span>
                      <div style={{ fontWeight: 700, color: report.encumbrance_status.includes('Active') ? '#ef4444' : '#10b981' }}>
                        {report.encumbrance_status}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 11 }}>Dispute / Court Status:</span>
                      <div style={{ fontWeight: 700, color: report.dispute_status.includes('Active') ? '#ef4444' : '#10b981' }}>
                        {report.dispute_status}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 11 }}>Issued Timestamp:</span>
                      <div style={{ fontWeight: 600 }}>{new Date(report.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Automated Checks List */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 12, letterSpacing: '0.05em' }}>
                    Multi-Repository Verification Checklist
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {report.checks.map((c, idx) => {
                      const isVisible = idx < animationStep;
                      return (
                        <div
                          key={c.check_id}
                          className={`verify-step ${isVisible ? 'show' : ''}`}
                        >
                          <div className={`verify-step-icon ${isVisible ? c.status : 'pending'}`}>
                            {c.status === 'PASS' && <CheckCircle2 size={16} />}
                            {c.status === 'WARN' && <AlertTriangle size={16} />}
                            {c.status === 'FAIL' && <AlertCircle size={16} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                              {c.label}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {c.detail}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: c.status === 'PASS' ? '#059669' : c.status === 'WARN' ? '#d97706' : '#dc2626'
                          }}>
                            {c.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Security Footer Notice */}
                <div style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: '1px solid #e2e8f0',
                  fontSize: 11,
                  color: '#94a3b8',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    Digitally signed & hashed via BhoomiStack DPI core.
                  </div>
                  <div>
                    Public verification URL: <Link to={`/verify/${report.verification_id}`} style={{ color: '#1a56db' }}>verify/{report.verification_id}</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePrint}
              >
                <Printer size={16} /> Print / Save Certificate PDF
              </button>
              <Link
                to={`/map?ulpin=${report.ulpin}`}
                className="btn btn-ghost"
              >
                Inspect on GIS Map <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
