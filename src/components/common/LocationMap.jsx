import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, ExternalLink } from 'lucide-react';

// A DivIcon with an inline SVG sidesteps the classic Leaflet + bundler
// issue where the default marker image paths 404 under Vite, and lets the
// pin match the app's own ember accent instead of Leaflet's stock blue.
const emberPinIcon = L.divIcon({
  className: 'location-map-pin',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z" fill="#e2703a"/>
    <circle cx="15" cy="15" r="5.5" fill="#fff"/>
  </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -38]
});

function MapAutoPan({ latitude, longitude }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);
  return null;
}

function RecenterButton({ latitude, longitude, label }) {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => map.setView([latitude, longitude], 15, { animate: true })}
      aria-label={label}
      title={label}
      style={{
        position: 'absolute', bottom: '0.75rem', right: '0.75rem', zIndex: 1000,
        width: '2.25rem', height: '2.25rem', borderRadius: '999px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--canvas-raised)', border: '1px solid var(--hairline-strong)', color: 'var(--ink)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <Crosshair className="w-4 h-4" />
    </button>
  );
}

function OpenExternalMapsButton({ latitude, longitude, label }) {
  return (
    <a
      href={`https://www.google.com/maps?q=${latitude},${longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      style={{
        position: 'absolute', bottom: '0.75rem', left: '0.75rem', zIndex: 1000,
        height: '2.25rem', padding: '0 0.75rem', borderRadius: '999px',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'var(--canvas-raised)', border: '1px solid var(--hairline-strong)', color: 'var(--ink)',
        boxShadow: 'var(--shadow-sm)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none'
      }}
    >
      <ExternalLink className="w-3.5 h-3.5" /> {label}
    </a>
  );
}

// Renders a single elder's latest known position. Coordinates always come
// from the caller (Supabase-backed) — this component never invents or
// defaults a location.
export default function LocationMap({ latitude, longitude, accuracy, label, recenterLabel, openInMapsLabel, height = '16rem' }) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  return (
    <div style={{ position: 'relative', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--hairline)' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[latitude, longitude]} icon={emberPinIcon}>
          {label && <Popup>{label}</Popup>}
        </Marker>
        {typeof accuracy === 'number' && accuracy > 0 && (
          <Circle center={[latitude, longitude]} radius={accuracy} pathOptions={{ color: '#e2703a', fillColor: '#e2703a', fillOpacity: 0.1, weight: 1 }} />
        )}
        <MapAutoPan latitude={latitude} longitude={longitude} />
        <RecenterButton latitude={latitude} longitude={longitude} label={recenterLabel} />
        {openInMapsLabel && <OpenExternalMapsButton latitude={latitude} longitude={longitude} label={openInMapsLabel} />}
      </MapContainer>
    </div>
  );
}
