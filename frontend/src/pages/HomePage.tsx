import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ShieldCheck, MapPin, Layers, FileCheck, ArrowRight,
  Database, Scale, Landmark, Building2, AlertTriangle, CheckCircle2,
  Lock, Sparkles, Cpu, ExternalLink
} from 'lucide-react';
import { useParcelStore } from '../store';

export default function HomePage() {
  const navigate = useNavigate();
  const { setActiveUlpin } = useParcelStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const target = searchQuery.trim().toUpperCase();
    setActiveUlpin(target);
    navigate(`/map?ulpin=${target}`);
  };

  const selectDemoParcel = (ulpin: string) => {
    setActiveUlpin(ulpin);
    navigate(`/map?ulpin=${ulpin}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -80,
          left: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 86, 219, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* DPI Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 30,
            fontSize: 13,
            fontWeight: 600,
            color: '#93c5fd',
            marginBottom: 24,
            backdropFilter: 'blur(8px)'
          }}>
            <Sparkles size={14} color="#60a5fa" />
            Next-Generation Digital Public Infrastructure for Land Governance
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: 20
          }}>
            One Parcel. One Identity.<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Every Land Record Connected.
            </span>
          </h1>

          <p style={{
            fontSize: 18,
            color: '#cbd5e1',
            maxWidth: 720,
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Break departmental silos. BhoomiStack binds GIS Cadastral Polygons with Revenue (Bhulekh),
            Sub-Registrar Deeds (IGRS), Municipal Tax, and Bank Liens via 14-digit ULPIN with automated
            cross-verification and fraud detection.
          </p>

          {/* Quick Search Bar */}
          <div style={{
            maxWidth: 680,
            margin: '0 auto 24px',
            background: '#ffffff',
            borderRadius: 14,
            padding: 6,
            display: 'flex',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 16, color: '#64748b' }}>
              <Search size={20} />
            </div>
            <input
              id="home-search-input"
              type="text"
              placeholder="Search by ULPIN (e.g. UP-PRY-001245) or Khasra No (e.g. 168/3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 14px',
                fontSize: 15,
                color: '#0f172a',
                borderRadius: 8
              }}
            />
            <button
              id="home-search-btn"
              type="button"
              className="btn btn-primary"
              onClick={handleSearch}
              style={{ padding: '0 24px', borderRadius: 10 }}
            >
              Explore GIS
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Demo Parcels Quick Launcher */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
            <span style={{ color: '#94a3b8' }}>Try Demo Parcels:</span>
            <button
              type="button"
              id="demo-parcel-anomalous"
              className="badge badge-ulpin"
              style={{ background: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5' }}
              onClick={() => selectDemoParcel('UP-PRY-001245')}
            >
              🚨 UP-PRY-001245 (Multi-Conflict Flagged)
            </button>
            <button
              type="button"
              id="demo-parcel-clean"
              className="badge badge-ulpin"
              style={{ background: '#064e3b', borderColor: '#10b981', color: '#a7f3d0' }}
              onClick={() => selectDemoParcel('UP-PRY-000042')}
            >
              ✅ UP-PRY-000042 (Clean Title & Verified)
            </button>
            <button
              type="button"
              id="demo-parcel-jhunsi"
              className="badge badge-ulpin"
              onClick={() => selectDemoParcel('UP-PRY-000001')}
            >
              🌾 UP-PRY-000001 (Agricultural Jhunsi)
            </button>
          </div>
        </div>
      </section>

      {/* Real-time KPI Stats Bar */}
      <section style={{ maxWidth: 1100, margin: '-40px auto 40px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#1a56db' }}>502</div>
            <div className="kpi-label">Prayagraj Parcels Mapped</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Full GeoJSON Cadastral boundaries</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#7c3aed' }}>6 Repos</div>
            <div className="kpi-label">Connected Departments</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Bhulekh, IGRS, Planning, Tax, Courts</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#ef4444' }}>38 Cases</div>
            <div className="kpi-label">Anomalies Detected</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Area mismatches & illegal mortgages</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: '#10b981' }}>100%</div>
            <div className="kpi-label">Tamper-Proof Verification</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>QR Digitally Signed Certificates</div>
          </div>
        </div>
      </section>

      {/* Conceptual Blueprint Diagram */}
      <section style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px' }}>
        <div className="card" style={{ padding: '36px 32px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c3aed' }}>
            The Architecture of Convergence
          </span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 8, marginBottom: 28, color: '#0f172a' }}>
            How One ULPIN Unifies Siloed Indian Land Records
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
          }}>
            {/* Center Core Parcel Box */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
              color: '#ffffff',
              padding: '16px 28px',
              borderRadius: 12,
              boxShadow: '0 8px 25px rgba(30, 58, 138, 0.35)',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '2px solid #3b82f6'
            }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd' }}>
                Unique Land Parcel Identification Number
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', marginTop: 4, letterSpacing: '0.06em' }}>
                ULPIN: 09-UP-PRY-001245
              </div>
              <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
                Latitude-Longitude Derived Bounding Box Identifier
              </div>
            </div>

            {/* Department Nodes Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              width: '100%',
              marginTop: 10
            }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                <div style={{ color: '#16a34a', marginBottom: 6 }}><Database size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Revenue / Bhulekh</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>RoR, Khatauni, Co-sharers & Mutation Logs</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                <div style={{ color: '#7c3aed', marginBottom: 6 }}><FileCheck size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Registration / IGRS</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Sale Deeds, Stamp Value, Previous Chain of Titles</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                <div style={{ color: '#2563eb', marginBottom: 6 }}><Building2 size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Town Planning</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Master Plan 2031, Zoning, Sanctioned Floors</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                <div style={{ color: '#d97706', marginBottom: 6 }}><Landmark size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Banking Liens</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>CERSAI registry, Mortgage status & Recovery claims</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                <div style={{ color: '#dc2626', marginBottom: 6 }}><Scale size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Litigation Courts</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>District Court stays & Revenue Board title disputes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Showcase */}
      <section style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: 'center', marginBottom: 32, color: '#0f172a' }}>
          Key Breakthrough Capabilities
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Card 1 */}
          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db', marginBottom: 16 }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Interactive GIS Parcel Explorer</h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
              Sub-meter accurate geospatial cadastral map with vector overlays. Click any polygon to instantly fetch
              integrated ownership, registration, and encumbrance records.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/map')}
            >
              Launch Explorer <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', marginBottom: 16 }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Land Truth Engine™</h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
              Automated multi-department cross-reconciliation. Compares GIS area against RoR area, catches secret bank mortgages,
              unauthorized constructions, and zoning violations before they turn into court battles.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => selectDemoParcel('UP-PRY-001245')}
            >
              Inspect Anomalies <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: 16 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Verifiable Land Certificates</h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
              Instant single-window title verification for citizens, banks, and buyers. Generates a tamper-proof digital
              certificate with a scannable public QR code.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/verify')}
            >
              Verify Any Parcel <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '48px 24px 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: 13,
        marginTop: 60
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Bhoomi<span style={{ color: '#7c3aed' }}>Stack</span>
            </div>
            <p style={{ marginTop: 4, color: '#64748b' }}>
              Integrated GIS-Based Digital Public Infrastructure for Land Governance.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Compliant with DILRMP • ULPIN Bhu-Aadhaar Standard • NGDAS</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
              Demonstration prototype for Prayagraj District, Uttar Pradesh.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
