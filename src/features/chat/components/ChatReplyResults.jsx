import {
  ArrowLeft,
  ExternalLink,
  HeartPulse,
  MapPin,
  PackageCheck,
  Pill,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistance, formatPrice } from "../../../shared/utils/formatters";
import { intentLabel } from "../utils/chatFormatters";

export function ChatReplyResults({ reply, onPrompt }) {
  if (!reply) return null;
  return (
    <div className="mr-12 max-w-3xl space-y-3">
      <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-700">
        {intentLabel[reply.detectedIntent] || "مساعدة"}
      </span>
      {reply.medicineResults?.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {reply.medicineResults.slice(0, 4).map((item) => (
            <Link
              key={`${item.pharmacy.pharmacyId}-${item.medicineId}`}
              to={`/app/pharmacies/${item.pharmacy.pharmacyId}?medicine=${item.medicineId}`}
              className="rounded-2xl border border-[#174b57]/8 bg-white p-3 transition hover:border-violet-200"
            >
              <div className="flex items-center gap-2">
                <Pill size={16} className="text-violet-700" />
                <strong className="truncate text-sm text-[#29464d]">
                  {item.medicineName}
                </strong>
              </div>
              <p className="mt-1 truncate text-[11px] text-[#829499]">
                {item.pharmacy.pharmacyName}
              </p>
              <div className="mt-2 flex gap-3 text-[11px] font-bold text-[#60777c]">
                <span>{formatDistance(item.pharmacy.distanceMeters)}</span>
                <span>{formatPrice(item.sellingPrice)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {reply.nearbyPharmacies?.length > 0 && !reply.medicineResults?.length && (
        <div className="grid gap-2 sm:grid-cols-2">
          {reply.nearbyPharmacies.slice(0, 4).map((pharmacy) => (
            <Link
              key={pharmacy.pharmacyId}
              to={`/app/pharmacies/${pharmacy.pharmacyId}`}
              className="rounded-2xl border border-[#174b57]/8 bg-white p-3 transition hover:border-violet-200"
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-violet-700" />
                <strong className="truncate text-sm text-[#29464d]">
                  {pharmacy.pharmacyName}
                </strong>
              </div>
              <div className="mt-2 flex gap-3 text-[11px] text-[#71858a]">
                <span>{formatDistance(pharmacy.distanceMeters)}</span>
                <span className="flex items-center gap-1">
                  <Star size={11} />
                  {Number(pharmacy.averageRating || 0).toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {reply.healthCard && (
        <Link
          to="/app/health"
          className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white text-violet-700">
            <HeartPulse size={19} />
          </span>
          <div>
            <strong className="block text-sm text-[#29464d]">
              فتح ملفي الصحي
            </strong>
            <small className="text-[#829499]">
              مراجعة وتحديث المعلومات الصحية
            </small>
          </div>
          <ArrowLeft className="mr-auto text-violet-700" size={16} />
        </Link>
      )}
      {reply.suggestedActions?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {reply.suggestedActions.slice(0, 4).map((action, index) => (
            <ActionButton
              key={`${action.actionType}-${action.relatedEntityId || index}`}
              action={action}
              onPrompt={onPrompt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ action, onPrompt }) {
  if (action.actionType === "ViewPharmacyDetails" && action.relatedEntityId)
    return (
      <Link
        to={`/app/pharmacies/${action.relatedEntityId}`}
        className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
      >
        <PackageCheck size={14} />
        {action.label}
      </Link>
    );
  if (action.actionType === "OpenGoogleMaps" && action.url)
    return (
      <a
        href={action.url}
        target="_blank"
        rel="noreferrer"
        className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
      >
        <ExternalLink size={14} />
        {action.label}
      </a>
    );
  if (action.actionType === "UpdateMedicalProfile")
    return (
      <Link to="/app/health" className="btn-quiet min-h-9 px-3 py-1.5 text-xs">
        <HeartPulse size={14} />
        {action.label}
      </Link>
    );
  const prompt = {
    FindNearestPharmacies: "أين أقرب 3 صيدليات؟",
    RefreshHealthCard: "اعرض بطاقتي الصحية",
    ExpandSearchRadius: "ابحث ضمن نطاق 10 كم",
  }[action.actionType];
  if (!prompt) return null;
  return (
    <button
      type="button"
      onClick={() => onPrompt(prompt)}
      className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
    >
      {action.label}
    </button>
  );
}
