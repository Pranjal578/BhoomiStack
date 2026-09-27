import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative glows */}
      <div style={{
        position: 'absolute', top: '10%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 600 }}>
        {/* 404 Big Number */}
        <div style={{
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 900,
          fontFamily: "'Space Grotesk', sans-serif",
          background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: '-0.04em'
        }}>
          404
        </div>

        {/* ULPIN-style badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px',
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13, fontWeight: 600, color: '#f87171',
          marginBottom: 28
        }}>
          <MapPin size={14} />
          PARCEL_NOT_FOUND: ERR-404-ULPIN
        </div>

        <h1 style={{
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 800, color: '#f1f5f9',
          marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif"
        }}>
          This Land Parcel Doesn't Exist
        </h1>
        <p style={{
          fontSize: 15, color: '#94a3b8', lineHeight: 1.7,
          maxWidth: 480, margin: '0 auto 36px'
        }}>
          The page you're looking for could not be found in our cadastral registry.
          It may have been moved, deleted, or you may have entered an invalid ULPIN address.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="btn-404-home"
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ gap: 8 }}
          >
            <Home size={16} /> Go to Home
          </button>
          <button
            id="btn-404-back"
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)', gap: 8 }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            id="btn-404-map"
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/map')}
            style={{ gap: 8 }}
          >
            <Search size={16} /> Search Parcels
          </button>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>POPULAR DESTINATIONS</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'GIS Parcel Explorer', path: '/map' },
              { label: 'Public Verification', path: '/verify' },
              { label: 'Document Intelligence', path: '/documents' },
              { label: 'Portal Login', path: '/login' },
            ].map(link => (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#60a5fa', fontSize: 13, textDecoration: 'underline',
                  textUnderlineOffset: 3
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
