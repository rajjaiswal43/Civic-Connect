import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CivicIncident, HotspotCluster } from '../types';

interface CivicMapProps {
  incidents: CivicIncident[];
  hotspots?: HotspotCluster[];
  onSelectIncident: (incident: CivicIncident) => void;
  selectedIncidentId?: string | null;
  height?: string;
  showHotspots?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  incidents,
  hotspots = [],
  onSelectIncident,
  selectedIncidentId,
  height = '420px',
  showHotspots = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Greater Noida Center Coordinates
      const map = L.map(mapContainerRef.current, {
        center: [28.4744, 77.5040],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Professional Clean Positron OpenStreetMap Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if unmounted
    };
  }, []);

  // Update Markers & Hotspots
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Custom marker icon helper
    const getMarkerColor = (incident: CivicIncident) => {
      if (incident.status === 'RESOLVED') return '#10b981'; // Green
      if (incident.priorityLevel === 'CRITICAL') return '#ef4444'; // Red
      if (incident.priorityLevel === 'HIGH') return '#f59e0b'; // Amber / Orange
      return '#3b82f6'; // Blue
    };

    incidents.forEach((inc) => {
      const color = getMarkerColor(inc);
      const isSelected = selectedIncidentId === inc.id;

      // Custom HTML Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.style.padding = '4px';
      popupContent.style.fontFamily = 'var(--font-sans)';

      popupContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:700; font-size:11px; color:#1d4ed8; background:#eff6ff; padding:2px 6px; border-radius:4px;">#${inc.id}</span>
          <span style="font-weight:700; font-size:10px; color:${color}; text-transform:uppercase;">${inc.priorityLevel}</span>
        </div>
        <h4 style="font-size:12px; font-weight:700; color:#0f172a; margin-bottom:4px; line-height:1.3;">${inc.title}</h4>
        <p style="font-size:11px; color:#64748b; margin-bottom:8px;">${inc.location.landmark || inc.location.address}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:10px; color:#475569;">
          <span>AI Score: <strong>${inc.priorityScore}/100</strong></span>
          <span>Status: <strong>${inc.status}</strong></span>
        </div>
        <button id="view-incident-btn-${inc.id}" style="
          width:100%;
          background:#2563eb;
          color:#ffffff;
          border:none;
          padding:6px 10px;
          border-radius:6px;
          font-size:11px;
          font-weight:600;
          cursor:pointer;
        ">View Details & Evidence</button>
      `;

      // Handle button click inside popup
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-incident-btn-${inc.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectIncident(inc);
          };
        }
      });

      marker.on('click', () => {
        onSelectIncident(inc);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Hotspot Heat Clusters
    if (hotspotsLayerRef.current) {
      hotspotsLayerRef.current.clearLayers();

      if (showHotspots && hotspots.length > 0) {
        hotspots.forEach((hs) => {
          const circle = L.circle(hs.coordinates, {
            color: hs.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b',
            fillColor: hs.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.15,
            weight: 2,
            radius: 500
          });

          circle.bindTooltip(`
            <div style="font-family:var(--font-sans); font-size:11px;">
              <strong style="color:#b91c1c;">HOTSPOT: ${hs.name}</strong><br/>
              <span>${hs.incidentCount} recurring ${hs.category} reports</span><br/>
              <span style="font-size:10px; color:#64748b;">(Signal for Smart City Planning)</span>
            </div>
          `);

          hotspotsLayerRef.current?.addLayer(circle);
        });
      }
    }
  }, [incidents, hotspots, selectedIncidentId, showHotspots, onSelectIncident]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.72rem',
          zIndex: 800,
          border: '1px solid var(--slate-200)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>GIS Legend:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }}></span> Critical
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }}></span> High
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3b82f6' }}></span> Medium / Assigned
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }}></span> Resolved
        </span>
      </div>
    </div>
  );
};
