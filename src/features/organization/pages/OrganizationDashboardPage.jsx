import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  CircleAlert,
  FileCheck2,
  Gift,
  HandHeart,
  HeartHandshake,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  getOrganizationDashboard,
  organizationKeys,
} from "../api/organizationApi";
import {
  campaignStatusMeta,
  verificationMeta,
} from "../utils/organizationFormatters";

export function OrganizationDashboardPage() {
  const query = useQuery({
    queryKey: organizationKeys.dashboard,
    queryFn: getOrganizationDashboard,
  });
  if (query.isLoading)
    return <UserLoadingState label="جاري تجهيز مساحة المنظمة..." />;
  if (query.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const data = query.data;
  const verification =
    verificationMeta[data.verificationStatus] ||
    verificationMeta.PendingDocuments;
  const stats = [
    {
      icon: HeartHandshake,
      value: data.activeCampaignsCount,
      label: "حملات نشطة",
      hint: `${data.totalCampaignsCount.toLocaleString("ar-SY")} حملات مسجلة`,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      icon: Gift,
      value: data.pendingDonationOffersCount,
      label: "عروض تنتظر المراجعة",
      hint: "عروض تبرع واردة",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      icon: HandHeart,
      value: data.openAssistanceRequestsCount,
      label: "طلبات مساعدة مفتوحة",
      hint: "تحتاج إلى متابعة",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      icon: FileCheck2,
      value: data.verificationDocumentsCount,
      label: "مستندات التحقق",
      hint: verification.label,
      tone: "bg-cyan-50 text-cyan-700",
    },
  ];
  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-[1.9rem] bg-[#3d365f] p-7 text-white shadow-[0_24px_65px_rgba(61,54,95,.2)] lg:p-9">
        <div className="noise absolute inset-0 -z-10" />
        <div className="absolute -left-14 -top-16 size-60 rounded-full bg-[#d9c9ff]/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#cabaf0]">
              <Sparkles size={16} />
              مساحة إدارة الأثر الدوائي
            </p>
            <h2 className="mt-3 text-3xl font-black lg:text-4xl">
              {data.organizationName}
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <MapPin size={16} />
              {[data.area, data.city].filter(Boolean).join("، ")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/app/organization/campaigns"
                className="inline-flex items-center gap-2 rounded-xl bg-[#f5cb72] px-5 py-3 text-sm font-black text-[#302b4b]"
              >
                <Plus size={17} />
                إدارة الحملات
              </Link>
              <Link
                to="/app/organization/offers"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.07] px-5 py-3 text-sm font-bold"
              >
                <Gift size={17} />
                العروض الواردة
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.07] p-5 lg:w-72">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">حالة المنظمة</span>
              <BadgeCheck
                size={19}
                className={
                  data.isApproved ? "text-emerald-300" : "text-amber-300"
                }
              />
            </div>
            <strong className="mt-2 block text-lg">
              {data.isApproved ? "معتمدة وجاهزة للعمل" : verification.label}
            </strong>
            <Link
              to="/app/organization/profile"
              className="mt-4 flex items-center gap-1 text-xs font-bold text-[#d5c8f4]"
            >
              مراجعة الملف والتحقق <ArrowLeft size={14} />
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, value, label, hint, tone }) => (
          <article
            key={label}
            className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5"
          >
            <span
              className={`grid size-11 place-items-center rounded-xl ${tone}`}
            >
              <Icon size={20} />
            </span>
            <strong className="mt-5 block text-3xl font-black text-[#29464d]">
              {value.toLocaleString("ar-SY")}
            </strong>
            <span className="mt-1 block text-sm font-extrabold text-[#29464d]">
              {label}
            </span>
            <small className="mt-1 block text-[#829499]">{hint}</small>
          </article>
        ))}
      </section>
      {!data.isApproved && (
        <section className="flex items-start gap-4 rounded-[1.35rem] border border-amber-100 bg-amber-50 p-5">
          <CircleAlert className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-black text-amber-900">أكمل اعتماد المنظمة</h3>
            <p className="mt-1 text-sm leading-6 text-amber-800/75">
              يجب اعتماد الحساب قبل إنشاء الحملات أو مراجعة عروض التبرع وطلبات
              المساعدة.
            </p>
            <Link
              to="/app/organization/profile"
              className="mt-3 inline-flex items-center gap-1 text-sm font-black text-amber-800"
            >
              الانتقال إلى التحقق <ArrowLeft size={15} />
            </Link>
          </div>
        </section>
      )}
      <section className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-[#29464d]">أحدث الحملات</h3>
            <p className="mt-1 text-sm text-[#71858a]">
              آخر الحملات المسجلة باسم المنظمة
            </p>
          </div>
          <Link
            to="/app/organization/campaigns"
            className="text-sm font-black text-violet-700"
          >
            عرض الكل
          </Link>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {data.recentCampaigns?.length ? (
            data.recentCampaigns.map((campaign) => {
              const meta = campaignStatusMeta[campaign.status] || {};
              return (
                <article
                  key={campaign.campaignId}
                  className="rounded-2xl border border-[#174b57]/8 bg-[#fafbfb] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${meta.tone}`}
                    >
                      {meta.label}
                    </span>
                    {campaign.isUrgent && (
                      <span className="text-[10px] font-black text-rose-600">
                        عاجلة
                      </span>
                    )}
                  </div>
                  <h4 className="mt-4 font-black text-[#29464d]">
                    {campaign.title}
                  </h4>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#71858a]">
                    {campaign.description}
                  </p>
                </article>
              );
            })
          ) : (
            <p className="col-span-full rounded-2xl border border-dashed border-[#174b57]/15 py-10 text-center text-sm text-[#829499]">
              لا توجد حملات مسجلة بعد.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
