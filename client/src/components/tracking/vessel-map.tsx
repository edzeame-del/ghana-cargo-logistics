import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Ship } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type VesselLocation = {
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  lastUpdate: string;
};

type VesselMapProps = {
  vessel?: VesselLocation;
};

export default function VesselMap({ vessel }: VesselMapProps) {
  // Default to Ghana's coordinates if no vessel is selected
  const center = vessel ? [vessel.latitude, vessel.longitude] : [5.6037, -0.1870];

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={[center[0], center[1]]}
        zoom={vessel ? 12 : 6}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {vessel && (
          <Marker position={[vessel.latitude, vessel.longitude]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{vessel.name}</h3>
                <p className="text-sm">Speed: {vessel.speed} knots</p>
                <p className="text-sm">Course: {vessel.course}°</p>
                <p className="text-sm">Last Update: {new Date(vessel.lastUpdate).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
