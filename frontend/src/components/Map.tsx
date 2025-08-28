"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AssetRow } from '@/lib/types';

// Fix default marker icons in Leaflet with Next
if ((L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const statusToColor = (status: AssetRow['status']): string => {
  switch (status) {
    case 'available':
      return '#22c55e';
    case 'rented':
      return '#3b82f6';
    case 'under_maintenance':
      return '#f59e0b';
    default:
      return '#9ca3af';
  }
};

export function FleetMap({ assets, onSelect }: { assets: AssetRow[]; onSelect?: (a: AssetRow) => void }) {
  const center: [number, number] = assets.length
    ? [assets[0].current_location_lat, assets[0].current_location_lon]
    : [20, 0];
  return (
    <div className="w-full h-96 rounded-md overflow-hidden">
      <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {assets.map(a => (
          <Marker key={a.machine_id} position={[a.current_location_lat, a.current_location_lon] as [number, number]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="background:${statusToColor(a.status)};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,.4)"></div>`
            })}
            eventHandlers={{ click: () => onSelect?.(a) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{a.asset_type} #{a.machine_id}</div>
                <div className="text-xs text-muted-foreground">{a.manufacturer} • {a.year_of_manufacture}</div>
                <div className="text-xs mt-1 capitalize">Status: {a.status.replace('_',' ')}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


