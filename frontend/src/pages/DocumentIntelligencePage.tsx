import React, { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, AlertCircle,
  RefreshCw, FileSearch, ShieldAlert, X, File, FileImage, FileCheck
} from 'lucide-react';
import { analyzeDocument, uploadDocument } from '../api';
import type { DocumentAnalysisResult } from '../types';
import { useUiStore } from '../store';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
const ACCEPTED_EXT = '.pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp';
const MAX_SIZE_MB = 10;

function getFileIcon(type: string) {
  if (type === 'application/pdf') return <FileText size={28} color="#ef4444" />;
  if (type.startsWith('image/')) return <FileImage size={28} color="#7c3aed" />;
  return <File size={28} color="#1a56db" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type AnalysisResult = DocumentAnalysisResult & {
  uploaded_file?: { filename: string; size_kb: number; content_type: string; note: string };
};

export default function DocumentIntelligencePage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useUiStore();

  const [ulpin, setUlpin] = useState(searchParams.get('ulpin') || 'UP-PRY-001245');
  const [docType, setDocType] = useState('Sale Deed');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- File Validation ----
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type (${file.type}). Please upload a PDF or image (JPEG, PNG, TIFF, WebP).`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large (${formatSize(file.size)}). Maximum allowed size is ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      setUploadedFile(null);
      return;
    }
    setUploadedFile(file);
    setAnalysis(null);
  };

  // ---- Drag & Drop handlers ----
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = ''; // Reset so same file can be re-selected
  };

  // ---- Analysis trigger ----
  const handleAnalyze = async () => {
    if (!ulpin.trim()) {
      addToast('Please enter a ULPIN first.', 'error');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setUploadProgress(0);

    // Simulate upload progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress(p => (p >= 85 ? 85 : p + Math.random() * 15));
    }, 300);

    try {
      let result: AnalysisResult;

      if (uploadedFile) {
        // Real file upload path
        result = await uploadDocument(uploadedFile, ulpin.trim().toUpperCase(), docType);
      } else {
        // No file uploaded — use simulated demo mode
        result = await analyzeDocument(ulpin.trim().toUpperCase(), docType);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysis(result);
      addToast('Document intelligence cross-check complete', 'success');
    } catch (err: any) {
      clearInterval(progressInterval);
      const msg = err?.response?.data?.detail || 'Failed to analyze document';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 800);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 14px', background: '#ede9fe', color: '#6d28d9',
            borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 12
          }}>
            <Sparkles size={16} />
            AI Document Cross-Check &amp; Fraud Prevention
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
            Document Intelligence Engine
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 580, margin: '8px auto 0' }}>
            Upload your deed, Khatauni, NOC, or building plan. BhoomiStack will cross-check every field
            against ground-truth records to detect forgeries, area inflations, and fake NOCs.
          </p>
        </div>

        {/* Input Card */}
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label htmlFor="doc-ai-ulpin" style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                Target Parcel ULPIN
              </label>
              <input
                id="doc-ai-ulpin"
                type="text"
                value={ulpin}
                onChange={(e) => setUlpin(e.target.value)}
                placeholder="e.g. UP-PRY-001245"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #cbd5e1', fontSize: 14,
                  fontFamily: 'monospace', fontWeight: 600
                }}
              />
            </div>
            <div>
              <label htmlFor="doc-ai-type" style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                Document Category
              </label>
              <select
                id="doc-ai-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #cbd5e1', fontSize: 14, background: '#ffffff'
                }}
              >
                <option value="Sale Deed">Sub-Registrar Registered Sale Deed</option>
                <option value="Khatauni RoR">Bhulekh RoR (Khatauni Extract)</option>
                <option value="Bank NOC">Bank Loan Clearance NOC</option>
                <option value="Building Plan">Prayagraj DA Building Sanction Plan</option>
              </select>
            </div>
          </div>

          {/* ===== DRAG & DROP UPLOAD ZONE ===== */}
          <div
            id="doc-upload-dropzone"
            role="button"
            tabIndex={0}
            aria-label="Upload document — click or drag and drop a PDF or image"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !uploadedFile && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#7c3aed' : uploadedFile ? '#10b981' : fileError ? '#ef4444' : '#cbd5e1'}`,
              borderRadius: 12,
              padding: '28px 20px',
              textAlign: 'center',
              background: dragOver ? 'rgba(124,58,237,0.04)' : uploadedFile ? 'rgba(16,185,129,0.04)' : '#f8fafc',
              marginBottom: 16,
              cursor: uploadedFile ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              outline: 'none',
            }}
          >
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXT}
              onChange={onFileInputChange}
              style={{ display: 'none' }}
              aria-hidden="true"
            />

            {uploadedFile ? (
              /* ---- File Preview (after selection) ---- */
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10,
                  background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getFileIcon(uploadedFile.type)}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>
                    {uploadedFile.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {formatSize(uploadedFile.size)} &nbsp;·&nbsp;
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {uploadedFile.type.split('/')[1]}
                    </span>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    marginTop: 6, fontSize: 11, fontWeight: 600,
                    color: '#059669', background: '#dcfce7', padding: '2px 8px', borderRadius: 20
                  }}>
                    <CheckCircle2 size={11} /> Ready for OCR analysis
                  </div>
                </div>
                {/* Remove file button */}
                <button
                  type="button"
                  id="btn-remove-file"
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setAnalysis(null); setFileError(''); }}
                  title="Remove file"
                  style={{
                    background: '#fee2e2', border: 'none', borderRadius: 8,
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#dc2626', flexShrink: 0
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              /* ---- Empty State (prompt to upload) ---- */
              <div>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, margin: '0 auto 12px',
                  background: dragOver ? 'rgba(124,58,237,0.12)' : '#ede9fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}>
                  <Upload size={24} color="#7c3aed" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                  {dragOver ? 'Drop your document here' : 'Drag & drop your document here'}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                  or{' '}
                  <span style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'underline' }}>
                    click to browse files
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center'
                }}>
                  {['PDF', 'JPEG', 'PNG', 'TIFF', 'WebP'].map(ext => (
                    <span key={ext} style={{
                      background: '#f1f5f9', color: '#475569',
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                      border: '1px solid #e2e8f0'
                    }}>{ext}</span>
                  ))}
                  <span style={{
                    background: '#f1f5f9', color: '#475569',
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                    border: '1px solid #e2e8f0'
                  }}>Max {MAX_SIZE_MB} MB</span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
                  No file? Run in <strong>demo mode</strong> without uploading — uses sample records.
                </div>
              </div>
            )}
          </div>

          {/* File validation error */}
          {fileError && (
            <div className="field-error" role="alert" style={{ marginBottom: 12, fontSize: 13 }}>
              <AlertCircle size={14} /> {fileError}
            </div>
          )}

          {/* Upload progress bar */}
          {loading && uploadProgress > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                height: 4, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(90deg, #1a56db, #7c3aed)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                {uploadProgress < 90
                  ? `Uploading${uploadedFile ? ` "${uploadedFile.name}"` : ''}…`
                  : 'Running OCR & cross-check…'}
              </div>
            </div>
          )}

          {/* Bottom action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 12, flexWrap: 'wrap' }}>
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
                  <RefreshCw size={16} className="spin" />
                  {uploadedFile ? 'Uploading & Analysing…' : 'Cross-Checking…'}
                </>
              ) : (
                <>
                  {uploadedFile ? <FileCheck size={16} /> : <Sparkles size={16} />}
                  {uploadedFile ? 'Upload & Run Analysis' : 'Run Ground Truth Analysis'}
                </>
              )}
            </button>
          </div>

          {/* Upload-mode indicator */}
          {uploadedFile && (
            <div style={{
              marginTop: 14, padding: '10px 14px',
              background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 8, fontSize: 12, color: '#6d28d9', display: 'flex', gap: 8, alignItems: 'center'
            }}>
              <FileSearch size={14} />
              Your file will be sent to the OCR pipeline and cross-checked against BhoomiStack ground truth for ULPIN <strong>{ulpin}</strong>.
            </div>
          )}
        </div>

        {/* Results Card */}
        {analysis && (
          <div className="card" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 16, flexWrap: 'wrap', gap: 12
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                  Cross-Verification Match Report
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  ULPIN: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a56db' }}>{analysis.ulpin}</span>
                  {' '}• Document: {analysis.document_type}
                  {analysis.uploaded_file && (
                    <span style={{ marginLeft: 8, color: '#7c3aed', fontWeight: 600 }}>
                      📎 {analysis.uploaded_file.filename} ({analysis.uploaded_file.size_kb} KB)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Document Consistency Score
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 800,
                  color: analysis.authenticity_score >= 80 ? '#10b981'
                    : analysis.authenticity_score >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  {analysis.authenticity_score}%
                </div>
              </div>
            </div>

            {/* Uploaded file note */}
            {analysis.uploaded_file && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
                padding: '10px 14px', background: '#ede9fe', borderRadius: 8,
                fontSize: 12, color: '#6d28d9'
              }}>
                <FileCheck size={16} />
                <span><strong>File processed:</strong> {analysis.uploaded_file.note}</span>
              </div>
            )}

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
              borderRadius: 8, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start'
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
