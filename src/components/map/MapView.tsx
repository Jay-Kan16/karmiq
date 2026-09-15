import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  customerMarker?: { lat: number; lng: number };
  workerMarker?: { lat: number; lng: number };
  route?: boolean;
  simulated?: boolean;
}

function isValidCoord(coord?: { lat: number; lng: number } | null): coord is { lat: number; lng: number } {
  return Boolean(
    coord &&
    typeof coord.lat === "number" &&
    typeof coord.lng === "number" &&
    !isNaN(coord.lat) &&
    !isNaN(coord.lng) &&
    (coord.lat !== 0 || coord.lng !== 0)
  );
}

function MapRecenter({
  customerMarker,
  workerMarker
}: {
  customerMarker?: { lat: number; lng: number };
  workerMarker?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    const hasCustomer = isValidCoord(customerMarker);
    const hasWorker = isValidCoord(workerMarker);

    if (hasCustomer && hasWorker) {
      const bounds: [[number, number], [number, number]] = [
        [customerMarker!.lat, customerMarker!.lng],
        [workerMarker!.lat, workerMarker!.lng]
      ];
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true
      });
    } else if (hasCustomer) {
      map.flyTo([customerMarker!.lat, customerMarker!.lng], 15, { animate: true });
    } else if (hasWorker) {
      map.flyTo([workerMarker!.lat, workerMarker!.lng], 15, { animate: true });
    }
  }, [customerMarker?.lat, customerMarker?.lng, workerMarker?.lat, workerMarker?.lng, map]);

  return null;
}

export default function MapView({
  customerMarker,
  workerMarker,
  route = true,
  simulated = false
}: MapViewProps) {
  const hasCustomer = isValidCoord(customerMarker);
  const hasWorker = isValidCoord(workerMarker);

  const [worker, setWorker] = useState<{ lat: number; lng: number } | undefined>(
    hasWorker ? workerMarker : undefined
  );

  useEffect(() => {
    setWorker(isValidCoord(workerMarker) ? workerMarker : undefined);
  }, [workerMarker?.lat, workerMarker?.lng]);

  useEffect(() => {
    if (!simulated || !hasCustomer || !worker) return;
    const id = window.setInterval(() => {
      setWorker((prev) => {
        if (!prev || !customerMarker) return prev;
        return {
          lat: prev.lat + (customerMarker.lat - prev.lat) * 0.08,
          lng: prev.lng + (customerMarker.lng - prev.lng) * 0.08
        };
      });
    }, 1500);
    return () => window.clearInterval(id);
  }, [customerMarker?.lat, customerMarker?.lng, simulated, hasCustomer, Boolean(worker)]);

  const defaultCenter = { lat: 24.5854, lng: 73.7125 };
  const center = hasCustomer ? customerMarker! : (isValidCoord(worker) ? worker! : defaultCenter);

  return (
    <MapContainer
      key={`${center.lat.toFixed(4)}-${center.lng.toFixed(4)}`}
      center={[center.lat, center.lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full min-h-[360px] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapRecenter customerMarker={customerMarker} workerMarker={worker} />

      {route && hasCustomer && isValidCoord(worker) && (
        <Polyline
          positions={[
            [worker.lat, worker.lng],
            [customerMarker!.lat, customerMarker!.lng]
          ]}
          pathOptions={{ color: "#16a85b", weight: 5, dashArray: "8 8" }}
        />
      )}

      {hasCustomer && (
        <CircleMarker
          center={[customerMarker!.lat, customerMarker!.lng]}
          radius={11}
          pathOptions={{ color: "#ffffff", fillColor: "#2563eb", fillOpacity: 1, weight: 4 }}
        >
          <Tooltip permanent>Customer 📍</Tooltip>
        </CircleMarker>
      )}

      {isValidCoord(worker) && (
        <CircleMarker
          center={[worker.lat, worker.lng]}
          radius={11}
          pathOptions={{ color: "#ffffff", fillColor: "#16a85b", fillOpacity: 1, weight: 4 }}
        >
          <Tooltip permanent>Worker 🛵</Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}