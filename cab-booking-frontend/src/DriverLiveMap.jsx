
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const driverIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FollowDriver({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
  }, [map, position]);

  return null;
}

export default function DriverLiveMap({
  latitude,
  longitude,
  updatedAt,
}) {
  const position = [latitude, longitude];

  return (
    <div
      style={{
        width: "100%",
        height: "300px",
        overflow: "hidden",
        borderRadius: "12px",
        marginTop: "12px",
      }}
    >
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={driverIcon}>
          <Popup>
            <strong>Your driver</strong>
            <br />
            Last updated:{" "}
            {updatedAt
              ? new Date(updatedAt).toLocaleTimeString()
              : "Recently"}
          </Popup>
        </Marker>

        <FollowDriver position={position} />
      </MapContainer>
    </div>
  );
}
