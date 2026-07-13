import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

type CoordinateMapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
};

const DEFAULT_CENTER: [number, number] = [-2.5489, 118.0149];

const markerIcon = new L.Icon({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ClickHandler({ onChange }: { onChange: CoordinateMapPickerProps["onChange"] }) {
  useMapEvents({
    click(event: L.LeafletMouseEvent) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(8)),
        longitude: Number(event.latlng.lng.toFixed(8))
      });
    }
  });

  return null;
}

export function CoordinateMapPicker({ latitude, longitude, onChange }: CoordinateMapPickerProps) {
  const hasPoint = latitude !== null && longitude !== null;
  const center = useMemo<[number, number]>(
    () => (hasPoint ? [latitude, longitude] : DEFAULT_CENTER),
    [hasPoint, latitude, longitude]
  );
  const markerPosition = hasPoint ? ([latitude, longitude] as [number, number]) : null;

  return (
    <div className="map-picker">
      <MapContainer center={center} zoom={hasPoint ? 13 : 5} scrollWheelZoom className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {markerPosition ? <Marker position={markerPosition} icon={markerIcon} /> : null}
      </MapContainer>
      <p className="state">Click map to set company location.</p>
    </div>
  );
}
