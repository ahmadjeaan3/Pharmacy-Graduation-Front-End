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
  return (
    <article className="group relative overflow-hidden rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_40px_rgba(61,54,95,.08)]">
      <div className="absolute -left-9 -top-9 size-28 rounded-full bg-violet-50 transition group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#3d365f] text-white">
          <Gift size={20} />
        </span>
        {campaign.isUrgent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-black text-rose-700">
            <CircleAlert size={13} />
            عاجلة
          </span>
        )}
      </div>
      <h3 className="relative mt-5 text-lg font-black text-[#29464d]">
        {campaign.title}
      </h3>
      {showOrganization && (
        <Link
          to={`/app/organizations/${campaign.organizationId}`}
          className="relative mt-1 inline-flex text-xs font-bold text-violet-700"
        >
          {campaign.organizationName}
        </Link>
      )}
      <p className="relative mt-3 line-clamp-3 text-sm leading-7 text-[#71858a]">
        {campaign.description}
      </p>
      {campaign.requestedMedicinesSummary && (
        <div className="relative mt-4 rounded-xl bg-violet-50/60 p-3">
          <p className="text-[10px] font-black text-violet-700">
            الأدوية المطلوبة
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-6 text-[#665d7f]">
            {campaign.requestedMedicinesSummary}
          </p>
        </div>
      )}
      <div className="relative mt-4 grid gap-2 text-xs text-[#71858a] sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <MapPin size={14} />
          {[campaign.area, campaign.city].filter(Boolean).join("، ") ||
            "غير محدد"}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays size={14} />
          حتى {formatOrgDate(campaign.endsAtUtc)}
        </span>
      </div>
      <div className="relative mt-5 flex items-center justify-between border-t border-[#174b57]/7 pt-4">
        <span
          className={`text-xs font-black ${campaign.acceptsPublicDonations ? "text-emerald-700" : "text-[#829499]"}`}
        >
          {campaign.acceptsPublicDonations
            ? "تستقبل عروض التبرع"
            : "مخصصة لطلبات المساعدة"}
        </span>
        <Link
          to={`/app/organizations/${campaign.organizationId}`}
          className="inline-flex items-center gap-1 text-xs font-black text-violet-700"
        >
          عرض المنظمة <ArrowLeft size={14} />
        </Link>
      </div>
    </article>
  );
}
