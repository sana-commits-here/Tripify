import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function MapView({ places }) {
  if (!places || places.length === 0) {
    return (
      <div style={{ height: '350px', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #334155' }}>
        No map coordinates available yet.
      </div>
    );
  }

  const center = [places[0].lat, places[0].lon];

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place, idx) => (
          <Marker key={idx} position={[place.lat, place.lon]} icon={customIcon}>
            <Popup>
              <strong>{place.name}</strong><br />
              <span style={{ fontSize: '0.8rem', color: '#555' }}>{place.kinds}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}