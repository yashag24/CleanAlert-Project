import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GarbageMap = ({ detections, filterStatus }) => {
  // Filter detections based on the selected status
  const filteredDetections = filterStatus
    ? detections.filter((detection) => detection.status === filterStatus)
    : detections;

  return (
    <div className="h-[400px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[20.5937, 78.9629]} // Center of India
        zoom={5}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredDetections.map((detection) => (
          <Marker
            key={detection.id}
            position={[detection.latitude, detection.longitude]}
          >
            <Popup>
              <div className="p-2">
                <img
                  src={detection.image_url}
                  alt="Garbage"
                  className="w-32 h-32 object-cover rounded mb-2"
                />
                <p className="font-semibold">Status: {detection.status}</p>
                <p>Confidence: {(detection.confidence * 100).toFixed(1)}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default GarbageMap;