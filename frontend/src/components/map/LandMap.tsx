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

export default function LandMap({
  activeUlpin,
  onSelectParcel,
  colorMode,
  baseLayer,
  filterHighRiskOnly,
  mapCenterRef
}: LandMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Basemap style definitions using raster tile sources
  const getMapStyle = (layer: 'streets' | 'satellite'): any => {
    if (layer === 'satellite') {
      return {
        version: 8 as const,
        sources: {
          'esri-satellite': {
            type: 'raster' as const,
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'satellite-tiles',
            type: 'raster' as const,
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    }

    // Default: Clean Voyager / OSM Style
    return {
      version: 8 as const,
      sources: {
        'carto-voyager': {
          type: 'raster' as const,
          tiles: [
            'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-tiles',
          type: 'raster' as const,
          source: 'carto-voyager',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  };

  // Expose flyTo capability
  if (mapCenterRef) {
    mapCenterRef.current = (coords: [number, number], zoom: number) => {
      if (map.current) {
        map.current.flyTo({ center: coords, zoom, duration: 1200 });
      }
    };
  }

  // Fetch GeoJSON once on mount
  useEffect(() => {
    getGeoJSON()
      .then((data) => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load GeoJSON parcel boundaries', err);
        setLoading(false);
      });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle(baseLayer),
      center: [81.8463, 25.4358], // Prayagraj centroid
      zoom: 13,
      maxZoom: 19,
      minZoom: 10
    });
    map.current = mapInstance;

    mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    mapInstance.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15
    });

    mapInstance.on('load', () => {
      if (geoJsonData) {
        addParcelLayers();
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle Basemap Change
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(getMapStyle(baseLayer));
    map.current.once('style.load', () => {
      if (geoJsonData) {
        addParcelLayers();
      }
    });
  }, [baseLayer]);

  // Handle Data Load or Layer Re-addition
  const addParcelLayers = () => {
    if (!map.current || !geoJsonData) return;

    if (!map.current.getSource('parcels')) {
      map.current.addSource('parcels', {
        type: 'geojson',
        data: geoJsonData
      });
    }

    // Parcels fill layer
    if (!map.current.getLayer('parcels-fill')) {
      map.current.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': getFillColorExpression(colorMode),
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.85,
            0.6
          ]
        }
      });
    }

    // Parcels stroke layer
    if (!map.current.getLayer('parcels-line')) {
      map.current.addLayer({
        id: 'parcels-line',
        type: 'line',
        source: 'parcels',
        paint: {
          'line-color': '#1e3a8a',
          'line-width': 1.2,
          'line-opacity': 0.8
        }
      });
    }

    // Highlight selected parcel layer
    if (!map.current.getLayer('parcels-selected')) {
      map.current.addLayer({
        id: 'parcels-selected',
        type: 'line',
        source: 'parcels',
        paint: {
          'line-color': '#7c3aed',
          'line-width': 4,
          'line-opacity': 1
        },
        filter: ['==', ['get', 'ulpin'], activeUlpin || '']
      });
    }

    // Tooltip hover interactions
    map.current.on('mousemove', 'parcels-fill', (e) => {
      if (!e.features || !e.features.length || !map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';

      const feat = e.features[0];
      const props = feat.properties as any;
      const coords = e.lngLat;

      const riskBadgeColor = props.risk_level === 'HIGH' ? '#ef4444' : props.risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981';

      popup.current?.setLngLat(coords)
        .setHTML(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 4px;">
            <div style="font-family: monospace; font-weight: 700; color: #1e40af; font-size: 13px;">${props.ulpin}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Khasra #${props.khasra_no} • ${props.village || 'Prayagraj'}</div>
            <div style="margin-top: 6px; display: flex; justify-content: space-between; gap: 8px;">
              <span>Area: <strong>${Number(props.area_gis).toFixed(3)} ha</strong></span>
              <span style="background: ${riskBadgeColor}20; color: ${riskBadgeColor}; font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 10px;">${props.risk_level}</span>
            </div>
            <div style="font-size: 10px; color: #7c3aed; margin-top: 4px; font-weight: 600;">Click to open 360° Land Stack records</div>
          </div>
        `)
        .addTo(map.current);
    });

    map.current.on('mouseleave', 'parcels-fill', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
      popup.current?.remove();
    });

    // Click parcel to select
    map.current.on('click', 'parcels-fill', (e) => {
      if (!e.features || !e.features.length) return;
      const ulpin = e.features[0].properties?.ulpin;
      if (ulpin) {
        onSelectParcel(ulpin);
      }
    });
  };

  // Helper to construct Mapbox GL expression for fill colors
  const getFillColorExpression = (mode: 'risk' | 'land_use'): any => {
    if (mode === 'risk') {
      return [
        'match',
        ['get', 'risk_level'],
        'HIGH', '#ef4444',
        'MEDIUM', '#f59e0b',
        'LOW', '#10b981',
        '#10b981'
      ];
    }
    return [
      'match',
      ['get', 'land_use'],
      'Agricultural', '#10b981',
      'Residential', '#3b82f6',
      'Commercial', '#7c3aed',
      'Industrial', '#ea580c',
      'Government', '#64748b',
      '#3b82f6'
    ];
  };

  // Update fill colors when colorMode changes
  useEffect(() => {
    if (!map.current || !map.current.getLayer('parcels-fill')) return;
    map.current.setPaintProperty('parcels-fill', 'fill-color', getFillColorExpression(colorMode));
  }, [colorMode]);

  // Update selected highlight filter
  useEffect(() => {
    if (!map.current || !map.current.getLayer('parcels-selected')) return;
    map.current.setFilter('parcels-selected', ['==', ['get', 'ulpin'], activeUlpin || '']);
  }, [activeUlpin]);

  // Filter high-risk parcels only
  useEffect(() => {
    if (!map.current || !map.current.getLayer('parcels-fill')) return;
    if (filterHighRiskOnly) {
      map.current.setFilter('parcels-fill', ['==', ['get', 'risk_level'], 'HIGH']);
      map.current.setFilter('parcels-line', ['==', ['get', 'risk_level'], 'HIGH']);
    } else {
      map.current.setFilter('parcels-fill', null);
      map.current.setFilter('parcels-line', null);
    }
  }, [filterHighRiskOnly]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontSize: 13,
          fontWeight: 600,
          zIndex: 600
        }}>
          <div style={{ width: 20, height: 20, border: '3px solid #60a5fa', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Streaming 500+ Prayagraj GIS Cadastral Parcels...
        </div>
      )}
    </div>
  );
}
