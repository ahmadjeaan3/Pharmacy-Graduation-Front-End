import { ArrowLeft, Clock3, Hash, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate, getRequestStatus } from "../utils/userFormatters";

function getMedicineImageSource(imageUrl) {
  if (!imageUrl) return null;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  try {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "https://localhost:7048/api";

    const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;

    return `${apiOrigin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

export function RequestCard({ request }) {
  const { t, i18n } = useTranslation();

  const status = getRequestStatus(request.status, request.statusDisplayText, t);

  const isReadyForPickup =
    request.status === "Available" || status.label === t("جاهز للاستلام");

  const statusClassName = isReadyForPickup
    ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
    : status.tone;

  const displayName =
    request.medicineDisplayName ||
    request.arabicMedicineName ||
    request.medicineName;

  const medicineImageUrl = getMedicineImageSource(request.imageUrl);

  return (
    <article
      className="
        group
        rounded-[14px]
        border border-[#E2E8EA]
        bg-white
        p-5
        shadow-[0_4px_16px_rgba(23,75,87,.025)]
        transition duration-300
        hover:border-[#216474]/20
        hover:shadow-[0_8px_24px_rgba(23,75,87,.055)]
        sm:p-6
      "
    >
      {/* =========================
          TOP
      ========================== */}
      <div className="flex items-start justify-between gap-4">
        {/* Medicine info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="
              flex size-[64px] shrink-0
              items-center justify-center
              overflow-hidden
              rounded-[10px]
              border border-[#DCE8EA]
              bg-[#F8FBFA]
            "
          >
            {medicineImageUrl ? (
              <img
                src={medicineImageUrl}
                alt={displayName}
                loading="lazy"
                className="
                  max-h-[56px]
                  max-w-[58px]
                  object-contain
                  transition-transform duration-300
                  group-hover:scale-[1.04]
                "
              />
            ) : (
              <PackageSearch
                size={21}
                strokeWidth={1.8}
                className="text-[#216474]"
              />
            )}
          </div>

          <div className="min-w-0 flex-1 text-right">
            <h3 className="truncate text-[15px] font-bold text-[#29464D]">
              {displayName}
            </h3>

            <p className="mt-1 truncate text-[12px] text-[#8A9A9E]">
              {request.pharmacyName || t("صيدلية")}
            </p>
          </div>
        </div>

        {/* Status */}
        <span
          className={`
            inline-flex
            min-h-[30px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            px-3
            text-[11px]
            font-semibold
            ${statusClassName}
          `}
        >
          {status.label}
        </span>
      </div>

      {/* =========================
          META
      ========================== */}
      <div
        className="
          mt-5
          grid gap-3
          border-t border-[#EEF2F3]
          pt-4
          text-[11px]
          text-[#71858A]
          sm:grid-cols-3
        "
      >
        <span className="flex items-center gap-1.5">
          <Hash size={13} strokeWidth={1.7} className="text-[#216474]" />

          <span className="truncate">{request.requestCode}</span>
        </span>

        <span className="flex items-center gap-1.5">
          <PackageSearch
            size={13}
            strokeWidth={1.7}
            className="text-[#216474]"
          />

          <span>
            {t("الكمية")}:{" "}
            <strong className="font-semibold text-[#29464D]">
              {request.requestedQuantity.toLocaleString(i18n.language)}
            </strong>
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          <Clock3 size={13} strokeWidth={1.7} className="text-[#216474]" />

          <span>{formatDate(request.createdAtUtc, true)}</span>
        </span>
      </div>

      {/* =========================
          ACTION
      ========================== */}
      <div className="mt-5 flex justify-end">
        <Link
          to={`/app/requests/${request.requestId}`}
          className="
            inline-flex
            min-h-[38px]
            items-center
            gap-2
            rounded-[9px]
            border border-[#DCE5E7]
            bg-white
            px-3.5
            text-[12px]
            font-semibold
            text-[#216474]
            transition
            hover:border-[#216474]/30
            hover:bg-[#EEF6F6]
          "
        >
          {t("متابعة الطلب")}

          <ArrowLeft
            size={14}
            strokeWidth={1.8}
            className="rtl:rotate-0 ltr:rotate-180"
          />
        </Link>
      </div>
    </article>
  );
}
