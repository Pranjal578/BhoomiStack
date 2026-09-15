import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface LegendProps {
  colorMode: 'risk' | 'land_use';
}

export default function Legend({ colorMode }: LegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        padding: '12px 16px',
        zIndex: 500,
        width: 220,
        fontSize: 12
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: collapsed ? 0 : 8
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} color="#1a56db" />
          Map Legend
        </span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {colorMode === 'risk' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#10b981', border: '1px solid #059669' }} />
                <span>Low Risk (Verified Clear)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#f59e0b', border: '1px solid #d97706' }} />
                <span>Medium Risk (Discrepancy)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#ef4444', border: '1px solid #dc2626' }} />
                <span>High Risk (Dispute / Lien / Overlap)</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#10b981' }} />
                <span>Agricultural</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#3b82f6' }} />
                <span>Residential</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#7c3aed' }} />
                <span>Commercial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#ea580c' }} />
                <span>Industrial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#64748b' }} />
                <span>Government</span>
              </div>
            </>
          )}

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 6, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 3, background: '#2563eb', borderTop: '1px dashed #1d4ed8' }} />
              <span style={{ fontSize: 11, color: '#475569' }}>Cadastral Boundary</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '2px solid #fee2e2' }} />
              <span style={{ fontSize: 11, color: '#475569' }}>Satellite AI Flagged</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
