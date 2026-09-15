import React from 'react';
import { Eye, MapPin, Sliders, AlertTriangle } from 'lucide-react';

interface LayerControlsProps {
  colorMode: 'risk' | 'land_use';
  setColorMode: (mode: 'risk' | 'land_use') => void;
  baseLayer: 'streets' | 'satellite';
  setBaseLayer: (base: 'streets' | 'satellite') => void;
  filterHighRiskOnly: boolean;
  setFilterHighRiskOnly: (v: boolean) => void;
  onSelectZone: (coords: [number, number], zoom: number) => void;
}

const VILLAGE_ZONES: Record<string, { name: string; coords: [number, number]; zoom: number }> = {
  Jhunsi: { name: 'Jhunsi (East)', coords: [81.895, 25.435], zoom: 15 },
  Naini: { name: 'Naini (South)', coords: [81.865, 25.395], zoom: 15 },
  Phaphamau: { name: 'Phaphamau (North)', coords: [81.848, 25.502], zoom: 15 },
  Bamrauli: { name: 'Bamrauli (West)', coords: [81.745, 25.452], zoom: 15 },
  'Civil Lines': { name: 'Civil Lines (Center)', coords: [81.835, 25.452], zoom: 15.5 }
};

export default function LayerControls({
  colorMode,
  setColorMode,
  baseLayer,
  setBaseLayer,
  filterHighRiskOnly,
  setFilterHighRiskOnly,
  onSelectZone
}: LayerControlsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        right: 24,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        padding: '12px 16px',
        zIndex: 500,
        width: 250,
        fontSize: 12
      }}
    >
      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sliders size={14} color="#1a56db" />
        GIS Layer Controls
      </div>

      {/* Base map switcher */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
          Basemap Style
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
          <button
            type="button"
            className={`btn btn-sm ${baseLayer === 'streets' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '4px 8px', fontSize: 11, justifyContent: 'center' }}
            onClick={() => setBaseLayer('streets')}
          >
            Light Streets
          </button>
          <button
            type="button"
            className={`btn btn-sm ${baseLayer === 'satellite' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '4px 8px', fontSize: 11, justifyContent: 'center' }}
            onClick={() => setBaseLayer('satellite')}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Cadastral Color Scheme */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
          Parcel Thematic View
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
          <button
            type="button"
            className={`btn btn-sm ${colorMode === 'risk' ? 'btn-accent' : 'btn-ghost'}`}
            style={{ padding: '4px 8px', fontSize: 11, justifyContent: 'center' }}
            onClick={() => setColorMode('risk')}
          >
            Risk Heatmap
          </button>
          <button
            type="button"
            className={`btn btn-sm ${colorMode === 'land_use' ? 'btn-accent' : 'btn-ghost'}`}
            style={{ padding: '4px 8px', fontSize: 11, justifyContent: 'center' }}
            onClick={() => setColorMode('land_use')}
          >
            Land Use
          </button>
        </div>
      </div>

      {/* High-risk filter */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterHighRiskOnly}
            onChange={(e) => setFilterHighRiskOnly(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={13} />
            Show High-Risk Only
          </span>
        </label>
      </div>

      {/* Quick Jump Villages */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} />
          Jump To Revenue Village
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {Object.entries(VILLAGE_ZONES).map(([key, zone]) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectZone(zone.coords, zone.zoom)}
              style={{
                fontSize: 10,
                padding: '3px 6px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
