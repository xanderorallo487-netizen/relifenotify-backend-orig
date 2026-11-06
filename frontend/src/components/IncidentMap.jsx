import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DEFAULT_CENTER = [15.9300, 120.8500];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getPosition(incident) {
  const { latitude, longitude } = incident;

  if (
    latitude === null ||
    latitude === undefined ||
    latitude === "" ||
    longitude === null ||
    longitude === undefined ||
    longitude === ""
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function MapController({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }

    const bounds = L.latLngBounds(points.map(({ position }) => position));

    if (points.length === 1) {
      map.setView(points[0].position, 13);
      return;
    }

    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
  }, [map, points]);

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false, debounceMoveend: true });
    });

    observer.observe(container);
    map.invalidateSize({ pan: false });

    return () => observer.disconnect();
  }, [map]);

  return null;
}

function FitIncidentsButton({ points }) {
  const map = useMap();

  const fitIncidents = () => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
    } else if (points.length === 1) {
      map.setView(points[0].position, 13);
    } else {
      map.fitBounds(
        L.latLngBounds(points.map(({ position }) => position)),
        { padding: [36, 36], maxZoom: 14 },
      );
    }
  };

  return (
    <button
      className="incident-map-fit"
      type="button"
      onClick={fitIncidents}
      aria-label="Fit map to incident locations"
      title="Fit map to incident locations"
    >
      Fit incidents
    </button>
  );
}

function IncidentMap({ incidents = [] }) {
  const [tileError, setTileError] = useState(false);
  const points = useMemo(
    () => incidents.flatMap((incident, index) => {
      const position = getPosition(incident);
      return position
        ? [{ incident, index, position }]
        : [];
    }),
    [incidents],
  );
  const unmappedCount = incidents.length - points.length;

  return (
    <div className="incident-map-shell">
      <div className="incident-map-status" aria-live="polite">
        <span className="incident-map-status-dot" />
        {points.length} of {incidents.length} incidents mapped
        {unmappedCount > 0 && (
          <span className="incident-map-unmapped">
            {unmappedCount} missing valid GPS coordinates
          </span>
        )}
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom
        className="incident-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => setTileError(false),
          }}
        />
        <MapController points={points} />
        <FitIncidentsButton points={points} />

        {points.map(({ incident, index, position }) => (
          <Marker
            key={incident.id ?? incident.incident_id ?? `${index}-${position.join(",")}`}
            position={position}
          >
            <Popup>
              <div className="incident-map-popup">
                <h3>{incident.incident_type || incident.title || "Incident"}</h3>
                <p><strong>Barangay:</strong> {incident.barangay || "Not specified"}</p>
                <p><strong>Status:</strong> {incident.status || "Unknown"}</p>
                {incident.description && <p>{incident.description}</p>}
                <p className="incident-map-coordinates">
                  {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {incidents.length === 0 && (
        <div className="incident-map-empty">
          No incidents to display yet. New reports with GPS coordinates will appear here.
        </div>
      )}

      {points.length === 0 && incidents.length > 0 && (
        <div className="incident-map-empty">
          Incident records are available, but none have valid GPS coordinates to map.
        </div>
      )}

      {tileError && (
        <div className="incident-map-tile-error" role="status">
          Map tiles are unavailable. Check your internet connection and try again.
        </div>
      )}
    </div>
  );
}

export default IncidentMap;
