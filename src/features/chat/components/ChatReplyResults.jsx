import {
  ArrowLeft,
  BookOpenText,
  ChevronDown,
  ExternalLink,
  HeartPulse,
  MapPin,
  PackageCheck,
  Pill,
  ShieldAlert,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistance, formatPrice } from "../../../shared/utils/formatters";
import { intentLabel } from "../utils/chatFormatters";

export function ChatReplyResults({ reply, onPrompt }) {
  if (!reply) return null;
  return (
    <div className="ms-12 max-w-3xl space-y-3">
      <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-700">
        {intentLabel[reply.detectedIntent] || "مساعدة"}
      </span>
      {reply.aiEngine && (
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#71858a]">
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-emerald-700">
            مساعد صيدلاني ذكي
          </span>
          {reply.aiRetrievalConfidence && (
            <span className="rounded-full border border-[#174b57]/10 bg-white px-2.5 py-1">
              موثوقية الاسترجاع: {reply.aiRetrievalConfidence}
            </span>
          )}
        </div>
      )}
      {reply.requiresPharmacist && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-900">
          <ShieldAlert className="mt-0.5 shrink-0" size={17} />
          <span>
            هذه المعلومات للتثقيف ولا تغني عن مراجعة الطبيب أو الصيدلي، خصوصًا
            قبل بدء الدواء أو إيقافه.
          </span>
        </div>
      )}
      {reply.aiSources?.length > 0 && (
        <div className="rounded-2xl border border-[#174b57]/8 bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-black text-[#29464d]">
            <BookOpenText size={16} className="text-violet-700" />
            <span>المراجع المستخدمة في الإجابة</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {reply.aiSources.slice(0, 4).map((source, index) => (
              <SourceCard
                key={`${source.sourceId}-${source.sourceUrl || source.medicineName}-${index}`}
                source={source}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
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
          <ArrowLeft className="ms-auto text-violet-700" size={16} />
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

function SourceCard({ source, index }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const clinical = source.documentType === "clinical";
  const title = clinical
    ? source.title || source.activeIngredient
    : source.medicineName || source.arabicName || source.activeIngredient;
  const details = clinical
    ? [source.section, source.activeIngredient]
    : [source.activeIngredient, source.strength, source.form];
  return (
    <article className="rounded-xl border border-transparent bg-[#f7faf9] p-3 text-start transition hover:border-violet-200">
      <div className="flex items-start justify-between gap-2">
        <strong className="line-clamp-2 text-xs leading-5 text-[#29464d]">
          {title || `مصدر ${index + 1}`}
        </strong>
        {source.sourceUrl && (
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noreferrer"
            title="فتح المصدر الرسمي"
            aria-label="فتح المصدر الرسمي في صفحة جديدة"
            className="grid size-7 shrink-0 place-items-center rounded-lg text-violet-700 hover:bg-violet-50"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[#71858a]">
        {details.filter(Boolean).join(" • ")}
      </p>
      {clinical && source.content && (
        <div className="mt-2 border-t border-[#174b57]/8 pt-2">
          <button
            type="button"
            onClick={() => setShowOriginal((value) => !value)}
            aria-expanded={showOriginal}
            className="flex w-full items-center justify-between gap-2 text-[10px] font-black text-violet-700"
          >
            <span>{showOriginal ? "إخفاء النص الأصلي" : "عرض النص الأصلي من المصدر"}</span>
            <ChevronDown
              size={13}
              className={`transition-transform ${showOriginal ? "rotate-180" : ""}`}
            />
          </button>
          {showOriginal && (
            <div className="mt-2 rounded-lg border border-[#174b57]/8 bg-white p-2.5">
              <p className="mb-1 text-[9px] font-bold text-[#829499]">
                النص التالي باللغة الأصلية للمحافظة على دقة المرجع الطبي:
              </p>
              <p
                dir="ltr"
                lang="en"
                className="max-h-32 overflow-y-auto text-left text-[10px] leading-5 text-[#5f7479]"
              >
                {source.content}
              </p>
            </div>
          )}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-[#829499]">
        {source.source && (
          <span className="rounded-full bg-white px-2 py-0.5">{source.source}</span>
        )}
        {source.updatedAt && <span>{source.updatedAt}</span>}
      </div>
    </article>
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
