// Performance: Lazy-loaded Leaflet map - click-to-set origin/dest + route visualization
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PlanResult } from '@/types';

// Custom markers: emerald circles with A/B labels
function createLabelIcon(label: string, color = '#059669') {
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.35);font-family:sans-serif;">${label}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

// Pulsing click marker (temporary)
function createPulseIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:rgba(5,150,105,0.6);border:3px solid white;box-shadow:0 0 0 6px rgba(5,150,105,0.2);animation:pulse 1.5s ease-in-out infinite;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const ROUTE_STYLES: Record<string, { color: string; weight: number; opacity: number; dashArray?: string }> = {
  car: { color: '#EF4444', weight: 3, opacity: 0.7, dashArray: '8 4' },
  motorcycle: { color: '#F97316', weight: 3, opacity: 0.7, dashArray: '8 4' },
  bus: { color: '#EAB308', weight: 4, opacity: 0.8, dashArray: '12 4' },
  electric_car: { color: '#06B6D4', weight: 3, opacity: 0.7, dashArray: '6 3' },
  cycling: { color: '#10B981', weight: 5, opacity: 1.0 },
  walking: { color: '#8B5CF6', weight: 4, opacity: 0.9, dashArray: '4 4' },
};

// Display order: draw car first (bottom) so cycling (top) is most visible
const DRAW_ORDER = ['car', 'motorcycle', 'bus', 'electric_car', 'walking', 'cycling'];

function FitBounds({ plan }: { plan: PlanResult }) {
  const map = useMap();
  useEffect(() => {
    if (!plan) return;
    const { origin, dest } = plan;
    const bounds = L.latLngBounds(
      [origin.coords.lat, origin.coords.lng],
      [dest.coords.lat, dest.coords.lng]
    );
    map.flyToBounds(bounds, { padding: [60, 60], duration: 1.5 });
  }, [plan, map]);
  return null;
}

// Map click handler - sets origin (1st click) or destination (2nd click)
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface PlannerMapProps {
  plan: PlanResult | null;
  selectedMode: string | null;
  onModeClick: (mode: string) => void;
  onMapClick: (lat: number, lng: number) => void;
  clickedOrigin: [number, number] | null;
  clickedDest: [number, number] | null;
  settingPoint: 'origin' | 'dest';
}

export default function PlannerMap({
  plan, selectedMode, onModeClick,
  onMapClick, clickedOrigin, clickedDest, settingPoint,
}: PlannerMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-verdi-border/60"
      style={{ height: '65vh', minHeight: '450px' }}>

      {/* Setting indicator badge */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="glass-card-strong px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${settingPoint === 'origin' ? 'bg-emerald-500' : 'bg-violet-500'
            }`} />
          <span className="text-xs font-display font-bold text-verdi-primary">
            Click map to set {settingPoint === 'origin' ? '📍 Origin (A)' : '🎯 Destination (B)'}
          </span>
        </div>
      </div>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        dragging={true}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onMapClick={onMapClick} />

        {plan && <FitBounds plan={plan} />}

        {/* Draw route lines */}
        {plan && DRAW_ORDER.map((mode) => {
          const route = plan.routes[mode as keyof typeof plan.routes];
          if (!route?.geometry) return null;
          const style = ROUTE_STYLES[mode];
          const isSelected = selectedMode === mode;
          return (
            <GeoJSON
              key={`${mode}-${plan.origin.text}-${plan.dest.text}`}
              data={{
                type: 'Feature',
                properties: { mode },
                geometry: route.geometry,
              } as any}
              style={() => ({
                color: style.color,
                weight: isSelected ? style.weight + 2 : style.weight,
                opacity: isSelected ? 1 : style.opacity,
                dashArray: style.dashArray,
              })}
              eventHandlers={{
                click: () => onModeClick(mode),
              }}
            />
          );
        })}

        {/* Plan markers (after routes are loaded) */}
        {plan && (
          <Marker
            position={[plan.origin.coords.lat, plan.origin.coords.lng]}
            icon={createLabelIcon('A', '#059669')}
          />
        )}
        {plan && (
          <Marker
            position={[plan.dest.coords.lat, plan.dest.coords.lng]}
            icon={createLabelIcon('B', '#7C3AED')}
          />
        )}

        {/* Click-placed markers (before plan is submitted) */}
        {!plan && clickedOrigin && (
          <Marker position={clickedOrigin} icon={createLabelIcon('A', '#059669')} />
        )}
        {!plan && clickedDest && (
          <Marker position={clickedDest} icon={createLabelIcon('B', '#7C3AED')} />
        )}
      </MapContainer>

      {/* Empty state overlay - only when nothing clicked yet */}
      {!plan && !clickedOrigin && !clickedDest && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="glass-card p-6 text-center max-w-xs">
            <div className="text-4xl mb-3 animate-float">🍃</div>
            <p className="text-sm text-verdi-primary font-display font-semibold">
              Click the map to set origin & destination, or type addresses above
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
