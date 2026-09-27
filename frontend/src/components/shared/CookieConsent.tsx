import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';

interface CookiePreferences {
  functional: boolean;   // always true, required
  analytics: boolean;
}

const CONSENT_KEY = 'bhoomi_cookie_consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    functional: true,
    analytics: false
  });

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      // Slight delay so the page loads first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const acceptAll = () => {
    const consent = { functional: true, analytics: true, timestamp: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const acceptSelected = () => {
    const consent = { ...prefs, timestamp: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const rejectAll = () => {
    const consent = { functional: true, analytics: false, timestamp: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop overlay for detail view */}
      {showDetails && (
        <div
          onClick={() => setShowDetails(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9998
          }}
        />
      )}

      {/* Main Banner */}
      <div
        id="cookie-consent-banner"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(780px, calc(100vw - 32px))',
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          padding: '20px 24px',
          zIndex: 9999,
          animation: 'slideUp 0.4s ease'
        }}
      >
        {/* Slide-up keyframe injected inline via style tag */}
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa'
          }}>
            <Cookie size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              We use cookies to improve your experience
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              BhoomiStack uses essential functional cookies for authentication and optional analytics cookies to improve the platform.
              Your data is governed by our{' '}
              <a href="/privacy" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Privacy Policy</a>{' '}
              and complies with India's DPDPA 2023.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                id="cookie-accept-all"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={acceptAll}
              >
                <Check size={14} /> Accept All
              </button>
              <button
                id="cookie-reject-non-essential"
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={rejectAll}
                style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                Functional Only
              </button>
              <button
                id="cookie-manage-preferences"
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDetails(!showDetails)}
                style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                <Settings size={14} /> Manage Preferences
              </button>
            </div>
          </div>

          <button
            id="cookie-close"
            type="button"
            onClick={rejectAll}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', padding: 4, flexShrink: 0
            }}
            title="Close (functional cookies only)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Expanded preferences */}
        {showDetails && (
          <div style={{
            marginTop: 20, paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
              Cookie Preferences
            </div>

            {[
              {
                id: 'functional',
                label: 'Functional Cookies (Required)',
                desc: 'Authentication tokens and user session data. Cannot be disabled.',
                required: true,
                checked: true
              },
              {
                id: 'analytics',
                label: 'Analytics Cookies (Optional)',
                desc: 'Anonymised usage statistics to improve the platform. No personal data is shared.',
                required: false,
                checked: prefs.analytics
              }
            ].map(cookie => (
              <div key={cookie.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
                    {cookie.label}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                    {cookie.desc}
                  </div>
                </div>
                <div>
                  {cookie.required ? (
                    <span style={{
                      fontSize: 11, color: '#10b981', fontWeight: 600,
                      background: 'rgba(16,185,129,0.15)', padding: '3px 10px', borderRadius: 20
                    }}>Always On</span>
                  ) : (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={prefs.analytics}
                        onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {prefs.analytics ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                id="cookie-save-preferences"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={acceptSelected}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
