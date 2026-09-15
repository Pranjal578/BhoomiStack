import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, AlertCircle,
  ArrowRight, RefreshCw, FileSearch, ShieldAlert
} from 'lucide-react';
import { analyzeDocument } from '../api';
import type { DocumentAnalysisResult } from '../types';
import { useUiStore } from '../store';

export default function DocumentIntelligencePage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useUiStore();

  const [ulpin, setUlpin] = useState(searchParams.get('ulpin') || 'UP-PRY-001245');
  const [docType, setDocType] = useState('Sale Deed');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!ulpin.trim()) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const result = await analyzeDocument(ulpin.trim().toUpperCase(), docType);
      setAnalysis(result);
      addToast('Document intelligence cross-check complete', 'success');
    } catch (err) {
      console.error('Document analysis failed', err);
      addToast('Failed to analyze document', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 14px',
            background: '#ede9fe',
            color: '#6d28d9',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12
          }}>
            <Sparkles size={16} />
            AI Document Cross-Check & Fraud Prevention
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
            Document Intelligence Engine
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 580, margin: '8px auto 0' }}>
            Compare uploaded deed texts and scanned physical records directly against BhoomiStack ground truth records to detect forged signatures, area inflations, and fake NOCs.
          </p>
        </div>

        {/* Input Card */}
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                Target Parcel ULPIN
              </label>
              <input
                id="doc-ai-ulpin"
                type="text"
                value={ulpin}
                onChange={(e) => setUlpin(e.target.value)}
                placeholder="e.g. UP-PRY-001245"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  fontWeight: 600
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                Document Category
              </label>
              <select
                id="doc-ai-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  background: '#ffffff'
                }}
              >
                <option value="Sale Deed">Sub-Registrar Registered Sale Deed</option>
                <option value="Khatauni RoR">Bhulekh RoR (Khatauni Extract)</option>
                <option value="Bank NOC">Bank Loan Clearance NOC</option>
                <option value="Building Plan">Prayagraj DA Building Sanction Plan</option>
              </select>
            </div>
          </div>

          {/* Upload Dropzone Preview */}
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 10,
            padding: '24px 20px',
            textAlign: 'center',
            background: '#f8fafc',
            marginBottom: 16
          }}>
            <FileSearch size={32} color="#7c3aed" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
              Sample Deed / Record Loaded for ULPIN {ulpin}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Deed scanned with OCR optical character recognition & parsed into structured entity fields.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              <button
                type="button"
                className="badge badge-ulpin"
                style={{ background: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5' }}
                onClick={() => { setUlpin('UP-PRY-001245'); }}
              >
                Anomalous: UP-PRY-001245
              </button>
              <button
                type="button"
                className="badge badge-ulpin"
                style={{ background: '#064e3b', borderColor: '#10b981', color: '#a7f3d0' }}
                onClick={() => { setUlpin('UP-PRY-000042'); }}
              >
                Clean: UP-PRY-000042
              </button>
            </div>
            <button
              id="btn-run-docai"
              type="button"
              className="btn btn-accent"
              disabled={loading}
              onClick={handleAnalyze}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" /> Cross-Checking...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Run Ground Truth Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Card */}
        {analysis && (
          <div className="card" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                  Cross-Verification Match Report
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  ULPIN: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a56db' }}>{analysis.ulpin}</span> • Document: {analysis.document_type}
                </div>
              </div>

              {/* Authenticity Score */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Document Consistency Score
                </div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: analysis.authenticity_score >= 80 ? '#10b981' : analysis.authenticity_score >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  {analysis.authenticity_score}%
                </div>
              </div>
            </div>

            {/* Field Match Matrix Table */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>
                Entity-By-Entity Ground Truth Comparison
              </h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Entity / Field</th>
                    <th>Document Extracted Value</th>
                    <th>BhoomiStack Ground Truth</th>
                    <th>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.match_results.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{m.field}</td>
                      <td style={{ fontFamily: 'monospace' }}>{m.extracted_value || '—'}</td>
                      <td style={{ fontFamily: 'monospace', color: '#1a56db' }}>{m.record_value || '—'}</td>
                      <td>
                        <span className={`badge badge-${m.status === 'MATCH' ? 'VERIFIED' : m.status === 'PARTIAL' ? 'MEDIUM' : 'HIGH'}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Recommendation Alert */}
            <div style={{
              background: analysis.authenticity_score < 70 ? '#fef2f2' : '#ecfdf5',
              border: `1px solid ${analysis.authenticity_score < 70 ? '#fecaca' : '#a7f3d0'}`,
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start'
            }}>
              {analysis.authenticity_score < 70 ? (
                <ShieldAlert size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: analysis.authenticity_score < 70 ? '#991b1b' : '#065f46' }}>
                  {analysis.authenticity_score < 70 ? 'Action Required: Discrepancies Detected' : 'Document Verified Clean'}
                </div>
                <div style={{ fontSize: 13, color: analysis.authenticity_score < 70 ? '#7f1d1d' : '#047857', marginTop: 4, lineHeight: 1.5 }}>
                  {analysis.recommendation}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
