import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { format } from "date-fns";
import LoadingSpinner from "../userDashboard/LoadingSpinner"; // Import your spinner component

// Custom marker icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const statusIcons = {
  pending: createCustomIcon("red"),
  in_progress: createCustomIcon("blue"),
  completed: createCustomIcon("green"),
  default: createCustomIcon("grey"),
};

// Component to auto-zoom to markers
const AutoZoom = ({ detections }) => {
  const map = useMap();

  useEffect(() => {
    if (detections.length > 0) {
      const group = new L.featureGroup(
        detections.map((d) => L.marker([d.latitude, d.longitude]))
      );
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [detections, map]);

  return null;
};

const MapControls = ({ activeStatus, setActiveStatus }) => (
  <div className="leaflet-top leaflet-right">
    <div className="leaflet-control leaflet-bar bg-white p-2 space-y-2">
      {["all", "pending", "in_progress", "completed"].map((status) => (
        <button
          key={status}
          onClick={() => setActiveStatus(status === "all" ? null : status)}
          className={`p-2 rounded-full w-8 h-8 flex items-center justify-center ${
            activeStatus === status ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
          title={`Filter ${status.replace("_", " ")}`}
        >
          {status[0].toUpperCase()}
        </button>
      ))}
    </div>
  </div>
);

const GarbageMap = ({ detections }) => {
  const [activeStatus, setActiveStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validDetections, setValidDetections] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(error.message);
          // Fallback to a default location if geolocation fails
          setUserLocation({ lat: 20.5937, lng: 78.9629 }); // Center of India
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 20.5937, lng: 78.9629 }); // Fallback to center of India
    }
  }, []);

  // Validate coordinates and filter by status
  useEffect(() => {
    const filtered = detections.filter(
      (d) =>
        typeof d.latitude === "number" &&
        typeof d.longitude === "number" &&
        (!activeStatus || d.status === activeStatus)
    );
    setValidDetections(filtered);
    setIsLoading(false);
  }, [detections, activeStatus]);

  if (isLoading || !userLocation) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-gradient-to-r from-emerald-400 via-blue-300 to-indigo-400 text-black border-2 border-indigo-400 shadow-xl rounded-xl p-6">
        <LoadingSpinner text="Loading map..." />
        <p className="mt-2 text-lg font-semibold">
          Fetching the latest map data...
        </p>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-red-500">{locationError}</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]} // Use user's location as the center
        zoom={13} // Zoom in closer for better visibility
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          spiderfyDistanceMultiplier={2}
          showCoverageOnHover={false}
        >
          {validDetections.map((detection) => (
            <Marker
              key={detection._id}
              position={[detection.latitude, detection.longitude]}
              icon={statusIcons[detection.status] || statusIcons.default}
            >
              <Popup className="custom-popup">
                <div className="min-w-[200px]">
                  <img
                    src={detection.image_url}
                    alt="Detection"
                    className="w-full h-32 object-cover rounded-t"
                  />
                  <div className="p-2 space-y-1">
                    <p className="font-semibold capitalize">
                      {detection.status.replace("_", " ")}
                    </p>
                    <p className="text-sm">{detection.location_name}</p>
                    <p className="text-xs text-gray-500">
                      {format(
                        new Date(detection.timestamp),
                        "MMM d, yyyy h:mm a"
                      )}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Confidence:</span>
                      <span className="font-semibold text-blue-600">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        <AutoZoom detections={validDetections} />
        {/* <MapControls 
          activeStatus={activeStatus} 
          setActiveStatus={setActiveStatus} 
        /> */}
      </MapContainer>

      {/* Map Legend */}
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control leaflet-bar bg-white p-3 space-y-2">
          {Object.entries(statusIcons).map(
            ([status, icon]) =>
              status !== "default" && (
                <div key={status} className="flex items-center space-x-2">
                  <img
                    src={icon.options.iconUrl}
                    alt={status}
                    className="w-5 h-8 object-contain"
                  />
                  <span className="text-sm capitalize">
                    {status.replace("_", " ")}
                  </span>
                </div>
              )
          )}
        </div>
      </div>

      {validDetections.length === 0 && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <p className="text-gray-500">No valid detections to display</p>
        </div>
      )}
    </div>
  );
};

export default GarbageMap;
