import { ArrowLeft, Bike, Clock3, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistance } from "../utils/userFormatters";

export function PharmacyCard({ pharmacy }) {
  return (
    <article className="group flex h-full flex-col rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5 transition hover:-translate-y-1 hover:border-[#216474]/20 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${pharmacy.isOpenNow ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
          <Clock3 size={13} className="me-1 inline" />
          {pharmacy.statusText ||
            (pharmacy.isOpenNow ? "مفتوحة الآن" : "مغلقة الآن")}
        </span>
        <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
          <Star size={16} fill="currentColor" />
          {Number(pharmacy.averageRating || 0).toLocaleString("ar-SY", {
            maximumFractionDigits: 1,
          })}
        </div>
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-[#29464d]">
        {pharmacy.pharmacyName}
      </h3>
      <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#71858a]">
        <MapPin size={16} className="mt-1 shrink-0 text-[#216474]" />
        {pharmacy.area
          ? `${pharmacy.area}، ${pharmacy.city}`
          : pharmacy.address}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#60777c]">
        <span className="rounded-full bg-[#f3f7f6] px-3 py-1.5">
          تبعد {formatDistance(pharmacy.distanceMeters)}
        </span>
        {pharmacy.hasDeliveryService && (
          <span className="rounded-full bg-[#fff8e9] px-3 py-1.5 text-amber-700">
            <Bike size={13} className="me-1 inline" />
            توصيل متاح
          </span>
        )}
      </div>
      <Link
        to={`/app/pharmacies/${pharmacy.pharmacyId}`}
        className="mt-5 inline-flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-bold text-[#216474]"
      >
        عرض الصيدلية{" "}
        <ArrowLeft
          size={16}
          className="transition group-hover:-translate-x-1"
        />
      </Link>
    </article>
  );
}
