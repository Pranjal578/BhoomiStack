import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getGeoJSON } from '../../api';

interface LandMapProps {
  activeUlpin: string | null;
  onSelectParcel: (ulpin: string) => void;
  colorMode: 'risk' | 'land_use';
  baseLayer: 'streets' | 'satellite';
  filterHighRiskOnly: boolean;
  mapCenterRef?: React.MutableRefObject<((coords: [number, number], zoom: number) => void) | null>;
}

// ---------------------------------------------------------------------------
// Pure helpers (outside component, no closures over React state)
// ---------------------------------------------------------------------------
function getFillColorExpression(mode: 'risk' | 'land_use'): any {
  if (mode === 'risk') {
    return ['match', ['get', 'risk_level'],
      'HIGH', '#ef4444',
      'MEDIUM', '#f59e0b',
      'LOW', '#10b981',
      '#10b981'
    ];
  }
  return ['match', ['get', 'land_use'],
    'Agricultural', '#10b981',
    'Residential', '#3b82f6',
    'Commercial', '#7c3aed',
    'Industrial', '#ea580c',
    'Government', '#64748b',
    '#94a3b8'
  ];
}

function buildMapStyle(layer: 'streets' | 'satellite'): any {
  if (layer === 'satellite') {
    return {
      version: 8 as const,
      sources: {
        'esri-satellite': {
          type: 'raster' as const,
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Esri, Maxar, Earthstar Geographics'
        }
      },
      layers: [{ id: 'satellite-tiles', type: 'raster' as const, source: 'esri-satellite', minzoom: 0, maxzoom: 19 }]
    };
  }
  return {
    version: 8 as const,
    sources: {
      'osm': {
        type: 'raster' as const,
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    },
    layers: [{ id: 'osm-tiles', type: 'raster' as const, source: 'osm', minzoom: 0, maxzoom: 19 }]
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LandMap({
  activeUlpin,
  onSelectParcel,
  colorMode,
  baseLayer,
  filterHighRiskOnly,
  mapCenterRef
}: LandMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [loading, setLoading] = useState(true);

  // All props tracked as refs so MapLibre callbacks always read latest values
  const colorModeRef = useRef(colorMode);
  const baseLayerRef = useRef(baseLayer);
  const activeUlpinRef = useRef(activeUlpin);
  const filterHighRiskRef = useRef(filterHighRiskOnly);
  const geoJsonRef = useRef<any>(null);
  const onSelectRef = useRef(onSelectParcel);

  // Keep refs in sync with props on every render
  colorModeRef.current = colorMode;
  baseLayerRef.current = baseLayer;
  activeUlpinRef.current = activeUlpin;
  filterHighRiskRef.current = filterHighRiskOnly;
  onSelectRef.current = onSelectParcel;

  // Expose flyTo
  if (mapCenterRef) {
    mapCenterRef.current = (coords, zoom) => {
      mapRef.current?.flyTo({ center: coords, zoom, duration: 1200 });
    };
  }

  // Helper: add/update all parcel layers using current ref values
  function applyParcelLayers() {
    const m = mapRef.current;
    const data = geoJsonRef.current;
    if (!m || !data) return;

    // Source
    const existingSource = m.getSource('parcels') as maplibregl.GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(data);
    } else {
      m.addSource('parcels', { type: 'geojson', data });
    }

    // Fill layer
    if (!m.getLayer('parcels-fill')) {
      m.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': getFillColorExpression(colorModeRef.current),
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.85, 0.6]
        }
      });
      // Hover tooltip
      m.on('mousemove', 'parcels-fill', (e) => {
        if (!e.features?.length || !mapRef.current) return;
        mapRef.current.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties as any;
        const rc = props.risk_level === 'HIGH' ? '#ef4444' : props.risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981';
        popupRef.current?.setLngLat(e.lngLat).setHTML(`
          <div style="font-family:sans-serif;font-size:12px;line-height:1.4;padding:4px">
            <div style="font-family:monospace;font-weight:700;color:#1e40af;font-size:13px">${props.ulpin}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px">Khasra #${props.khasra_no} • ${props.village || 'Prayagraj'}</div>
            <div style="margin-top:6px;display:flex;justify-content:space-between;gap:8px">
              <span>Area: <strong>${Number(props.area_gis).toFixed(3)} ha</strong></span>
              <span style="background:${rc}20;color:${rc};font-weight:700;padding:1px 6px;border-radius:4px;font-size:10px">${props.risk_level}</span>
            </div>
            <div style="font-size:10px;color:#7c3aed;margin-top:4px;font-weight:600">Click to open 360° Land Stack records</div>
          </div>
        `).addTo(mapRef.current);
      });
      m.on('mouseleave', 'parcels-fill', () => {
        if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });
      m.on('click', 'parcels-fill', (e) => {
        const ulpin = e.features?.[0]?.properties?.ulpin;
        if (ulpin) onSelectRef.current(ulpin);
      });
    } else {
      // Layer already exists — just re-apply current color
      m.setPaintProperty('parcels-fill', 'fill-color', getFillColorExpression(colorModeRef.current));
    }

    // Stroke layer
    if (!m.getLayer('parcels-line')) {
      m.addLayer({
        id: 'parcels-line',
        type: 'line',
        source: 'parcels',
        paint: { 'line-color': '#1e3a8a', 'line-width': 1.2, 'line-opacity': 0.8 }
      });
    }

    // Selected highlight layer
    if (!m.getLayer('parcels-selected')) {
      m.addLayer({
        id: 'parcels-selected',
        type: 'line',
        source: 'parcels',
        paint: { 'line-color': '#7c3aed', 'line-width': 4, 'line-opacity': 1 },
        filter: ['==', ['get', 'ulpin'], activeUlpinRef.current || '']
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Mount: initialize map + fetch GeoJSON (both independently async)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Strictly abort if container isn't there
    if (!mapContainer.current) return;

    // Clear any leftover DOM children (StrictMode double-mount safety)
    mapContainer.current.innerHTML = '';

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: buildMapStyle(baseLayerRef.current),
      center: [81.8463, 25.4358],
      zoom: 13,
      maxZoom: 19,
      minZoom: 10
    });
    mapRef.current = m;

    m.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 15 });

    // When map is ready, add layers if GeoJSON already arrived
    m.on('load', () => {
      if (geoJsonRef.current) applyParcelLayers();
    });

    // Fetch GeoJSON independently
    getGeoJSON().then((data) => {
      geoJsonRef.current = data;
      setLoading(false);
      // If map is already loaded, add layers now; otherwise the 'load' handler above will do it
      if (m.isStyleLoaded()) applyParcelLayers();
    }).catch((err) => {
      console.error('GeoJSON fetch failed', err);
      setLoading(false);
    });

    return () => {
      m.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Basemap switch: set new style, re-add layers after style loads
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    m.setStyle(buildMapStyle(baseLayer));
    m.once('style.load', () => applyParcelLayers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseLayer]);

  // ---------------------------------------------------------------------------
  // Thematic view toggle (Risk / Land Use)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.getLayer('parcels-fill')) return;
    m.setPaintProperty('parcels-fill', 'fill-color', getFillColorExpression(colorMode));
  }, [colorMode]);

  // ---------------------------------------------------------------------------
  // Selected parcel highlight
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.getLayer('parcels-selected')) return;
    m.setFilter('parcels-selected', ['==', ['get', 'ulpin'], activeUlpin || '']);
  }, [activeUlpin]);

  // ---------------------------------------------------------------------------
  // High-risk filter
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.getLayer('parcels-fill')) return;
    if (filterHighRiskOnly) {
      m.setFilter('parcels-fill', ['==', ['get', 'risk_level'], 'HIGH']);
      m.setFilter('parcels-line', ['==', ['get', 'risk_level'], 'HIGH']);
    } else {
      m.setFilter('parcels-fill', null);
      m.setFilter('parcels-line', null);
    }
  }, [filterHighRiskOnly]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          color: '#ffffff', padding: '16px 24px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontSize: 13, fontWeight: 600, zIndex: 600
        }}>
          <div style={{ width: 20, height: 20, border: '3px solid #60a5fa', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Streaming 500+ Prayagraj GIS Cadastral Parcels...
        </div>
      )}
    </div>
  );
}
