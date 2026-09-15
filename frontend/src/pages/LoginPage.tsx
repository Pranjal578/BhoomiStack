import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Shield, KeyRound, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { login } from '../api';
import { useAuthStore, useUiStore } from '../store';

const DEMO_PERSONAS = [
  {
    role: 'citizen',
    name: 'Rameshwar Sharma',
    email: 'citizen@bhoomi.gov.in',
    desc: 'Citizen / Prospective Land Buyer seeking clean title verification',
    badgeClass: 'citizen',
    target: '/map'
  },
  {
    role: 'revenue_officer',
    name: 'S. K. Mishra',
    email: 'revenue@bhoomi.gov.in',
    desc: 'Revenue Tehsildar (Sadar) handling Khasra mutation & Bhulekh updates',
    badgeClass: 'revenue_officer',
    target: '/dashboard/revenue'
  },
  {
    role: 'planning_officer',
    name: 'Aruna Verma',
    email: 'planning@bhoomi.gov.in',
    desc: 'Town Planner (Prayagraj DA) enforcing Master Plan 2031 & sanction compliance',
    badgeClass: 'planning_officer',
    target: '/dashboard/planning'
  },
  {
    role: 'municipal_officer',
    name: 'Vikramaditya',
    email: 'municipal@bhoomi.gov.in',
    desc: 'Municipal Revenue Assessor managing Property Tax & Utility links',
    badgeClass: 'municipal_officer',
    target: '/dashboard/municipal'
  },
  {
    role: 'admin',
    name: 'Chief Secretary Land',
    email: 'admin@bhoomi.gov.in',
    desc: 'State Administrator with full multi-department audit & override access',
    badgeClass: 'admin',
    target: '/admin'
  }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();

  const [email, setEmail] = useState('citizen@bhoomi.gov.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handlePersonaSelect = async (persona: typeof DEMO_PERSONAS[0]) => {
    setLoading(true);
    try {
      const res = await login(persona.email, 'password123');
      if (res && res.data) {
        setAuth(res.data.user, res.data.token);
        addToast(`Switched persona to ${persona.name} (${persona.role})`, 'success');
        navigate(persona.target);
      }
    } catch (err) {
      console.error('Demo login failed', err);
      // Fallback local auth mock if offline
      setAuth(
        { email: persona.email, name: persona.name, role: persona.role },
        'demo-jwt-token-123'
      );
      addToast(`Switched persona to ${persona.name}`, 'info');
      navigate(persona.target);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res && res.data) {
        setAuth(res.data.user, res.data.token);
        addToast('Successfully signed in', 'success');
        navigate('/map');
      }
    } catch (err) {
      addToast('Invalid credentials. Use demo persona switcher below.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px' }}>
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
            <Shield size={16} /> Role-Based Access Simulation
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
            Choose Your Operational Persona
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 520, margin: '8px auto 0' }}>
            BhoomiStack enforces multi-department governance boundaries. Select any role below to experience departmental perspectives.
          </p>
        </div>

        {/* 1-Click Persona Switcher Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
          {DEMO_PERSONAS.map((p) => (
            <div
              key={p.role}
              className="card"
              onClick={() => handlePersonaSelect(p)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1.5px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className={`role-badge ${p.badgeClass}`}>
                    {p.role.replace('_', ' ')}
                  </span>
                  <ArrowRight size={16} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  {p.name}
                </h3>
                <div style={{ fontSize: 12, color: '#1a56db', fontFamily: 'monospace', marginBottom: 8 }}>
                  {p.email}
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                  {p.desc}
                </p>
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <span className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Login as {p.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Manual Login Card */}
        <div className="card" style={{ maxWidth: 460, margin: '0 auto', padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound size={18} color="#1a56db" /> Manual Account Login
          </h3>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                Govt Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                Password (Default: password123)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ justifyContent: 'center', marginTop: 4 }}
            >
              Sign In to BhoomiStack
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
