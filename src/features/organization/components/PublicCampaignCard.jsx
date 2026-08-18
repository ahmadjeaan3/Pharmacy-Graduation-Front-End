import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Gift,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatOrgDate } from "../utils/organizationFormatters";

export function PublicCampaignCard({ campaign, showOrganization = true }) {
  const location =
    [campaign.area, campaign.city].filter(Boolean).join("، ") || "غير محدد";

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[10px]
        border border-[rgba(102,102,102,.14)]
        bg-white
        transition
        hover:-translate-y-1
        hover:border-[#216474]/30
        hover:shadow-[0_16px_34px_rgba(33,100,116,.08)]
      "
    >
      <div className="p-5">
        {/* العنوان + الحالة */}
        <div className="flex items-start justify-between gap-3">
          <span
            className="
              grid size-12 shrink-0
              place-items-center
              rounded-[9px]
              bg-[#E6F3F6]
              text-[#216474]
            "
          >
            <Gift size={21} strokeWidth={1.8} />
          </span>

          {campaign.isUrgent ? (
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full
                bg-[#FFF0F0]
                px-3 py-1.5
                text-[11.5px]
                font-semibold
                text-[#D95454]
              "
            >
              <CircleAlert size={14} />
              عاجلة
            </span>
          ) : (
            <span
              className="
                inline-flex items-center
                rounded-full
                bg-[#EAF8EF]
                px-3 py-1.5
                text-[11.5px]
                font-semibold
                text-[#2A8B57]
              "
            >
              نشطة
            </span>
          )}
        </div>

        {/* اسم الحملة */}
        <h3
          className="
            mt-5
            line-clamp-2
            text-[18px]
            font-semibold
            leading-7
            text-[#333333]
          "
        >
          {campaign.title}
        </h3>

        {/* اسم المنظمة */}
        {showOrganization ? (
          <Link
            to={`/app/organizations/${campaign.organizationId}`}
            className="
              mt-1.5 inline-flex
              text-[13px]
              font-semibold
              text-[#216474]
              transition
              hover:text-[#174B57]
            "
          >
            {campaign.organizationName}
          </Link>
        ) : null}

        {/* الوصف */}
        <p
          className="
            mt-3
            line-clamp-3
            min-h-[72px]
            text-[13px]
            leading-6
            text-[#7C8D91]
          "
        >
          {campaign.description ||
            "حملة دوائية مقدمة من منظمة معتمدة ضمن منصة دوائي."}
        </p>

        {/* الأدوية المطلوبة */}
        {campaign.requestedMedicinesSummary ? (
          <div
            className="
              mt-4
              rounded-[8px]
              border border-[#D6E7EA]
              bg-[#F4FAFA]
              p-4
            "
          >
            <p
              className="
                text-[13px]
                font-semibold
                text-[#216474]
              "
            >
              الأدوية المطلوبة
            </p>

            <p
              className="
                mt-2
                line-clamp-2
                text-[13px]
                font-medium
                leading-6
                text-[#5F7378]
              "
            >
              {campaign.requestedMedicinesSummary}
            </p>
          </div>
        ) : null}

        {/* الموقع والتاريخ */}
        <div
          className="
            mt-4
            grid gap-3
            text-[12.5px]
            text-[#71858A]
            sm:grid-cols-2
          "
        >
          {/* الموقع */}
          <span className="flex min-w-0 items-center gap-2">
            <MapPin size={15} className="shrink-0 text-[#216474]" />

            <span className="truncate">{location}</span>
          </span>

          {/* تاريخ انتهاء الحملة */}
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays size={15} className="shrink-0 text-[#216474]" />

            <span className="truncate">
              حتى {formatOrgDate(campaign.endsAtUtc)}
            </span>
          </span>
        </div>
      </div>

      {/* Footer الكارد */}
      <div
        className="
          flex items-center
          justify-between
          gap-3
          border-t
          border-[rgba(102,102,102,.10)]
          px-5 py-4
        "
      >
        {/* نوع الحملة */}
        <span
          className={`
            text-[12px]
            font-semibold
            ${
              campaign.acceptsPublicDonations
                ? "text-[#216474]"
                : "text-[#71858A]"
            }
          `}
        >
          {campaign.acceptsPublicDonations
            ? "تستقبل عروض التبرع"
            : "مخصصة لطلبات المساعدة"}
        </span>

        {/* عرض المنظمة */}
        <Link
          to={`/app/organizations/${campaign.organizationId}`}
          className="
            inline-flex
            items-center
            gap-1
            text-[12px]
            font-semibold
            text-[#216474]
            transition
            group-hover:gap-2
            hover:text-[#174B57]
          "
        >
          عرض المنظمة
          <ArrowLeft size={14} />
        </Link>
      </div>
    </article>
  );
}

export default PublicCampaignCard;
