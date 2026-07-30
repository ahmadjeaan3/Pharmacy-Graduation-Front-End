import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Star } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Link } from "react-router-dom";
import { formatDistance } from "../utils/userFormatters";

const userIcon = L.divIcon({
  className: "map-marker-shell",
  html: '<span class="map-user-marker"><i></i></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const pharmacyIcon = (number, active) =>
  L.divIcon({
    className: "map-marker-shell",
    html: `<span class="map-pharmacy-marker${active ? " is-nearest" : ""}"><i>${number}</i></span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 43],
    popupAnchor: [0, -40],
  });

export function NearbyPharmaciesMap({
  locationContext,
  route,
  limit = 3,
  title = "الصيدليات الأقرب",
}) {
  const pharmacies = useMemo(
    () => locationContext.mapMarkers.slice(0, limit),
    [locationContext.mapMarkers, limit],
  );
  const routePoints = useMemo(
    () => route?.path?.map((point) => [point.latitude, point.longitude]) ?? [],
    [route?.path],
  );
  const boundsPoints = useMemo(
    () => [
      [locationContext.latitude, locationContext.longitude],
      ...pharmacies.map((item) => [item.latitude, item.longitude]),
      ...routePoints,
    ],
    [locationContext, pharmacies, routePoints],
  );

  return (
    <section
      aria-label={title}
      className="overflow-hidden rounded-[1.65rem] border border-[#174b57]/8 bg-white shadow-[0_16px_45px_rgba(23,75,87,.07)]"
    >
      <div className="grid lg:grid-cols-[1fr_330px]">
        <div className="relative min-h-[430px]">
          <MapContainer
            center={[locationContext.latitude, locationContext.longitude]}
            zoom={14}
            scrollWheelZoom
            className="h-[430px] w-full lg:h-full lg:min-h-[520px]"
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitMap points={boundsPoints} />
            <Marker
              position={[locationContext.latitude, locationContext.longitude]}
              icon={userIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div dir="rtl" className="min-w-36 text-start">
                  <strong className="text-sm text-[#17363e]">
                    موقعك الحالي
                  </strong>
                  <p className="mt-1 text-xs text-slate-500">
                    نقطة بداية المسار
                  </p>
                </div>
              </Popup>
            </Marker>
            {pharmacies.map((pharmacy, index) => (
              <Marker
                key={pharmacy.markerId}
                position={[pharmacy.latitude, pharmacy.longitude]}
                icon={pharmacyIcon(index + 1, index === 0)}
                zIndexOffset={900 - index}
              >
                <Popup>
                  <PharmacyPopup pharmacy={pharmacy} number={index + 1} />
                </Popup>
              </Marker>
            ))}
            {routePoints.length > 1 && (
              <Polyline
                positions={routePoints}
                pathOptions={{
                  color: "#216474",
                  weight: 6,
                  opacity: 0.9,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}
          </MapContainer>
          <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-xl border border-white/70 bg-white/95 px-3 py-2 text-xs font-bold text-[#29464d] shadow-lg backdrop-blur">
            <span className="me-2 inline-block size-2.5 rounded-full bg-[#216474]" />
            الخريطة داخل منصة حياة دوائية
          </div>
        </div>
        <MapSidebar pharmacies={pharmacies} route={route} title={title} />
      </div>
    </section>
  );
}

function FitMap({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 15 });
    }
  }, [map, points]);
  return null;
}

function PharmacyPopup({ pharmacy, number }) {
  return (
    <div dir="rtl" className="min-w-56 text-start">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm text-[#17363e]">
          {number}. {pharmacy.name}
        </strong>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold ${
            pharmacy.isOpenNow
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {pharmacy.statusText}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {pharmacy.address}
      </p>
      <div className="mt-2 flex items-center gap-3 text-xs font-bold text-[#216474]">
        <span>{formatDistance(pharmacy.distanceMeters)}</span>
        <span>
          <Star
            size={12}
            className="me-1 inline text-amber-500"
            fill="currentColor"
          />
          {Number(pharmacy.averageRating || 0).toLocaleString("ar-SY", {
            maximumFractionDigits: 1,
          })}
        </span>
      </div>
      {pharmacy.pharmacyId && (
        <Link
          to={`/app/pharmacies/${pharmacy.pharmacyId}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[#216474]"
        >
          <MapPin size={13} />
          عرض الصيدلية داخل المنصة
        </Link>
      )}
    </div>
  );
}

function MapSidebar({ pharmacies, route, title }) {
  const nearest = pharmacies[0];
  const minutes = route?.durationSeconds
    ? Math.max(1, Math.round(route.durationSeconds / 60))
    : null;

  return (
    <aside className="flex flex-col p-5 lg:p-6">
      <p className="text-sm font-bold text-[#216474]">بالقرب من موقعك</p>
      <h3 className="mt-1 text-xl font-black text-[#17363e]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#71858a]">
        اختر العلامة على الخريطة أو افتح صفحة الصيدلية من هنا دون مغادرة المنصة.
      </p>
      <div className="mt-5 space-y-2.5">
        {pharmacies.map((pharmacy, index) => (
          <div
            key={pharmacy.markerId}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${
              index === 0
                ? "border-[#216474]/25 bg-[#eaf4f3]"
                : "border-[#174b57]/8 bg-[#f8fbfa]"
            }`}
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
                index === 0
                  ? "bg-[#216474] text-white"
                  : "bg-white text-[#60777c]"
              }`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm text-[#29464d]">
                {pharmacy.name}
              </strong>
              <span className="mt-1 block text-xs text-[#71858a]">
                {formatDistance(pharmacy.distanceMeters)} •{" "}
                {pharmacy.statusText}
              </span>
            </div>
            {pharmacy.pharmacyId && (
              <Link
                to={`/app/pharmacies/${pharmacy.pharmacyId}`}
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#216474]"
                aria-label={`عرض صيدلية ${pharmacy.name} داخل المنصة`}
                title="عرض الصيدلية"
              >
                <MapPin size={16} />
              </Link>
            )}
          </div>
        ))}
      </div>
      {nearest && (
        <div className="mt-auto pt-5">
          <div className="rounded-2xl bg-[#174b57] p-4 text-white">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#f5cb72]">
                <Navigation size={19} />
              </span>
              <div>
                <small className="text-white/55">الأقرب إليك</small>
                <strong className="mt-1 block text-sm">{nearest.name}</strong>
                <p className="mt-1 text-xs text-white/65">
                  {formatDistance(
                    route?.distanceMeters ?? nearest.distanceMeters,
                  )}
                  {minutes
                    ? ` • نحو ${minutes.toLocaleString("ar-SY")} دقيقة`
                    : ""}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#f5cb72] px-4 py-2.5 text-center text-sm font-black text-[#173d46]">
              <Navigation size={15} />
              المسار والموقع ضمن المنصة
            </div>
          </div>
          {route && !route.routeAvailable && (
            <p className="mt-2 text-xs leading-5 text-amber-700">
              تعذر رسم الطريق التفصيلي حالياً، لكن موقعك والصيدلية ظاهران على
              الخريطة.
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
