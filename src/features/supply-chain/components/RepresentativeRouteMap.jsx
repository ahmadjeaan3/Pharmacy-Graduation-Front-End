import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

const driverIcon = L.divIcon({
  className: "map-marker-shell",
  html: '<span class="map-user-marker"><i></i></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = L.divIcon({
  className: "map-marker-shell",
  html: '<span class="map-pharmacy-marker is-nearest"><i>✓</i></span>',
  iconSize: [38, 46],
  iconAnchor: [19, 43],
  popupAnchor: [0, -40],
});

export function RepresentativeRouteMap({ route }) {
  const routePoints = useMemo(
    () => route.path?.map((point) => [point.latitude, point.longitude]) || [],
    [route.path],
  );
  const points = useMemo(
    () => [
      [route.originLatitude, route.originLongitude],
      [route.destinationLatitude, route.destinationLongitude],
      ...routePoints,
    ],
    [route, routePoints],
  );

  return (
    <div className="h-[360px] overflow-hidden rounded-2xl border border-[#174B57]/10 sm:h-[440px]">
      <MapContainer
        center={[route.originLatitude, route.originLongitude]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRoute points={points} />
        <Marker
          position={[route.originLatitude, route.originLongitude]}
          icon={driverIcon}
        >
          <Popup>موقعك الحالي</Popup>
        </Marker>
        <Marker
          position={[route.destinationLatitude, route.destinationLongitude]}
          icon={destinationIcon}
        >
          <Popup>
            <div dir="rtl" className="text-right">
              <b>{route.pharmacyName}</b>
              <p className="mt-1 text-xs text-slate-500">
                {route.pharmacyAddress}
              </p>
            </div>
          </Popup>
        </Marker>
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: "#216474",
              weight: 7,
              opacity: 0.92,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

function FitRoute({ points }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLngBounds(points), {
      padding: [35, 35],
      maxZoom: 16,
    });
  }, [map, points]);
  return null;
}
