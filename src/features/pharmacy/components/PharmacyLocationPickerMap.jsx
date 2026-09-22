import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const SYRIA_CENTER = [35.1, 38.1];

const pharmacyMarker = L.divIcon({
  className: "map-marker-shell",
  html: `
    <span style="display:grid;width:42px;height:42px;place-items:center;border:4px solid white;border-radius:50% 50% 50% 10%;background:#216474;color:white;box-shadow:0 8px 22px rgba(23,75,87,.3);transform:rotate(-45deg)">
      <span style="width:11px;height:11px;border:3px solid white;border-radius:999px;transform:rotate(45deg)"></span>
    </span>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 38],
  popupAnchor: [9, -34],
});

function MapInteraction({ position, onChange, disabled }) {
  const map = useMap();

  useMapEvents({
    click(event) {
      if (!disabled) {
        onChange({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      }
    },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 0.6,
      });
    }
  }, [map, position]);

  return null;
}

export function PharmacyLocationPickerMap({
  latitude,
  longitude,
  onChange,
  disabled = false,
  t,
}) {
  const position = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    return Number.isFinite(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      Number.isFinite(lng) &&
      lng >= -180 &&
      lng <= 180
      ? [lat, lng]
      : null;
  }, [latitude, longitude]);

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-[#174b57]/10 bg-white shadow-[0_10px_30px_rgba(23,75,87,.08)]">
      <div className="flex items-start gap-3 border-b border-[#174b57]/10 bg-[#f4f9f8] p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
          <MapPin size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h5 className="text-sm font-extrabold text-[#173f48]">
            {t("حدد موقع الصيدلية على الخريطة")}
          </h5>
          <p className="mt-1 text-xs leading-5 text-[#71858a]">
            {t("انقر على الخريطة أو حرّك الدبوس، ثم احفظ الإحداثيات")}
          </p>
        </div>
      </div>

      <div className="relative h-[330px] w-full sm:h-[380px]">
        <MapContainer
          center={position || SYRIA_CENTER}
          zoom={position ? 15 : 6}
          scrollWheelZoom
          zoomControl
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInteraction
            position={position}
            onChange={onChange}
            disabled={disabled}
          />
          {position && (
            <Marker
              position={position}
              icon={pharmacyMarker}
              draggable={!disabled}
              eventHandlers={{
                dragend(event) {
                  const point = event.target.getLatLng();
                  onChange({
                    latitude: point.lat,
                    longitude: point.lng,
                  });
                },
              }}
            >
              <Popup>
                <div dir="rtl" className="min-w-40 text-right">
                  <strong className="text-sm text-[#173f48]">
                    {t("موقع الصيدلية")}
                  </strong>
                  <p className="mt-1 text-xs text-[#71858a]" dir="ltr">
                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {!position && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] rounded-xl border border-white/80 bg-white/95 px-4 py-3 text-center text-xs font-bold text-[#29464d] shadow-lg backdrop-blur">
            {t("قرّب الخريطة وانقر على موقع الصيدلية لإضافة الدبوس")}
          </div>
        )}
      </div>
    </div>
  );
}
