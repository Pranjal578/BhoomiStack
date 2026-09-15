import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, X, Sparkles, Filter } from 'lucide-react';
import LandMap from '../components/map/LandMap';
import LayerControls from '../components/map/LayerControls';
import Legend from '../components/map/Legend';
import ParcelViewer from '../components/parcel/ParcelViewer';
import { searchParcels } from '../api';
import type { ParcelSearchResult } from '../types';
import { useParcelStore } from '../store';

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeUlpin, setActiveUlpin } = useParcelStore();

  const [colorMode, setColorMode] = useState<'risk' | 'land_use'>('risk');
  const [baseLayer, setBaseLayer] = useState<'streets' | 'satellite'>('streets');
  const [filterHighRiskOnly, setFilterHighRiskOnly] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParcelSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const mapCenterRef = useRef<((coords: [number, number], zoom: number) => void) | null>(null);

  // Sync with URL query parameter
  useEffect(() => {
    const urlUlpin = searchParams.get('ulpin');
    if (urlUlpin && urlUlpin !== activeUlpin) {
      setActiveUlpin(urlUlpin);
    }
  }, [searchParams]);

  // Handle Search Input with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchParcels(searchQuery.trim());
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectParcel = (ulpin: string) => {
    setActiveUlpin(ulpin);
    setSearchParams({ ulpin });
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleCloseDrawer = () => {
    setActiveUlpin(null);
    setSearchParams({});
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', marginTop: 64, overflow: 'hidden' }}>
      {/* Top Floating Control Bar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 24,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 'calc(100vw - 320px)'
      }}>
        {/* Search Box */}
        <div style={{ position: 'relative', width: 340 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            padding: '8px 14px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }}>
            <Search size={16} color="#64748b" />
            <input
              id="map-search-input"
              type="text"
              placeholder="Search ULPIN, Khasra, or Owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length) setShowDropdown(true); }}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                paddingLeft: 10,
                fontSize: 13,
                width: '100%',
                color: '#0f172a'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              background: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              maxHeight: 280,
              overflowY: 'auto',
              zIndex: 1000
            }}>
              {searchResults.map((item) => (
                <div
                  key={item.ulpin}
                  onClick={() => handleSelectParcel(item.ulpin)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a56db', fontSize: 13 }}>
                      {item.ulpin}
                    </span>
                    <span className={`badge badge-${item.risk_level || 'LOW'}`} style={{ fontSize: 10 }}>
                      {item.risk_level}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Khasra #{item.khasra_no} • {item.owner_name || 'Sudha Rani'} • {item.village || 'Prayagraj'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Fast Buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleSelectParcel('UP-PRY-001245')}
            style={{
              background: 'rgba(239, 68, 68, 0.9)',
              color: '#ffffff',
              border: 'none',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 10px rgba(239,68,68,0.3)',
              fontSize: 11,
              fontWeight: 700
            }}
          >
            🚨 Demo Flagged (001245)
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleSelectParcel('UP-PRY-000042')}
            style={{
              background: 'rgba(16, 185, 129, 0.9)',
              color: '#ffffff',
              border: 'none',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 10px rgba(16,185,129,0.3)',
              fontSize: 11,
              fontWeight: 700
            }}
          >
            ✅ Demo Clean (000042)
          </button>
        </div>
      </div>

      {/* Main MapLibre Canvas */}
      <LandMap
        activeUlpin={activeUlpin}
        onSelectParcel={handleSelectParcel}
        colorMode={colorMode}
        baseLayer={baseLayer}
        filterHighRiskOnly={filterHighRiskOnly}
        mapCenterRef={mapCenterRef}
      />

      {/* Layer Controls on top-right */}
      <LayerControls
        colorMode={colorMode}
        setColorMode={setColorMode}
        baseLayer={baseLayer}
        setBaseLayer={setBaseLayer}
        filterHighRiskOnly={filterHighRiskOnly}
        setFilterHighRiskOnly={setFilterHighRiskOnly}
        onSelectZone={(coords, zoom) => mapCenterRef.current?.(coords, zoom)}
      />

      {/* Legend on bottom-left */}
      <Legend colorMode={colorMode} />

      {/* 360 Parcel Inspector Drawer */}
      {activeUlpin && (
        <ParcelViewer ulpin={activeUlpin} onClose={handleCloseDrawer} />
      )}
    </div>
  );
}
