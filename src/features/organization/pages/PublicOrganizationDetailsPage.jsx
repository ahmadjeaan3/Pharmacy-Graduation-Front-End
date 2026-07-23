import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Gift,
  HandHeart,
  MapPin,
  Phone,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  getOrganizationDetails,
  publicOrganizationKeys,
} from "../api/organizationApi";
import { PublicCampaignCard } from "../components/PublicCampaignCard";

export function PublicOrganizationDetailsPage() {
  const { organizationId } = useParams();
  const query = useQuery({
    queryKey: publicOrganizationKeys.detail(organizationId),
    queryFn: () => getOrganizationDetails(organizationId),
    enabled: Boolean(organizationId),
    retry: false,
  });
  if (query.isLoading)
    return <UserLoadingState label="جاري تحميل بيانات المنظمة..." />;
  if (query.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const data = query.data;
  return (
    <div className="space-y-6">
      <Link
        to="/app/organizations"
        className="inline-flex items-center gap-2 text-sm font-black text-[#60777c]"
      >
        <ArrowRight size={17} />
        العودة إلى المنظمات
      </Link>
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#3d365f] p-7 text-white shadow-[0_22px_55px_rgba(61,54,95,.17)] lg:p-9">
        <div className="noise absolute inset-0 -z-10" />
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#f5cb72]">
                <Building2 size={23} />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/15 px-3 py-1.5 text-xs font-black text-emerald-200">
                <BadgeCheck size={14} />
                منظمة معتمدة
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black lg:text-4xl">
              {data.organizationName}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              {data.description ||
                "منظمة معتمدة تعمل ضمن شبكة المساعدة والتبرع الدوائي."}
            </p>
          </div>
          <Link
            to="/app/donations"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f5cb72] px-5 py-3 text-sm font-black text-[#302b4b]"
          >
            <Gift size={17} />
            التبرع أو طلب المساعدة
          </Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Info
          icon={MapPin}
          label="العنوان"
          value={[data.address, data.area, data.city]
            .filter(Boolean)
            .join("، ")}
        />
        <Info
          icon={Phone}
          label="رقم التواصل"
          value={data.phoneNumber || "غير مسجل"}
          ltr
        />
        <Info
          icon={HandHeart}
          label="الحملات النشطة"
          value={`${data.activeCampaigns.length.toLocaleString("ar-SY")} حملات`}
        />
      </section>
      <section>
        <div className="mb-4">
          <h3 className="text-xl font-black text-[#29464d]">الحملات النشطة</h3>
          <p className="mt-1 text-sm text-[#71858a]">
            الحملات المتاحة حاليًا لدى {data.organizationName}
          </p>
        </div>
        {data.activeCampaigns.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.activeCampaigns.map((campaign) => (
              <PublicCampaignCard
                key={campaign.campaignId}
                campaign={campaign}
                showOrganization={false}
              />
            ))}
          </div>
        ) : (
          <UserEmptyState
            title="لا توجد حملات نشطة"
            description="يمكنك العودة لاحقًا أو التواصل مع المنظمة من بياناتها المسجلة."
          />
        )}
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value, ltr }) {
  return (
    <article className="rounded-[1.3rem] border border-[#174b57]/8 bg-white p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
        <Icon size={19} />
      </span>
      <span className="mt-4 block text-xs text-[#829499]">{label}</span>
      <strong
        className="mt-1 block text-sm leading-6 text-[#29464d]"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </strong>
    </article>
  );
}
