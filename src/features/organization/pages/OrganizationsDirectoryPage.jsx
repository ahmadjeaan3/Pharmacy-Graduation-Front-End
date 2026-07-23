import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Gift,
  HeartHandshake,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { PageHeader as UserPageHeader } from "../../../shared/components/PageHeader";
import {
  getActiveOrganizationCampaigns,
  getApprovedOrganizations,
  publicOrganizationKeys,
} from "../api/organizationApi";
import { PublicCampaignCard } from "../components/PublicCampaignCard";

export function OrganizationsDirectoryPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const activeView =
    params.get("view") === "campaigns" ? "campaigns" : "organizations";
  const organizations = useQuery({
    queryKey: publicOrganizationKeys.list,
    queryFn: getApprovedOrganizations,
  });
  const campaigns = useQuery({
    queryKey: publicOrganizationKeys.campaigns({ take: 100 }),
    queryFn: () => getActiveOrganizationCampaigns({ take: 100 }),
  });
  const normalized = search.trim().toLowerCase();
  const filteredOrganizations = useMemo(
    () =>
      (organizations.data || []).filter(
        (item) =>
          !normalized ||
          [item.organizationName, item.city, item.area, item.description].some(
            (value) => value?.toLowerCase().includes(normalized),
          ),
      ),
    [organizations.data, normalized],
  );
  const filteredCampaigns = useMemo(
    () =>
      (campaigns.data || []).filter(
        (item) =>
          !normalized ||
          [
            item.title,
            item.organizationName,
            item.city,
            item.area,
            item.requestedMedicinesSummary,
          ].some((value) => value?.toLowerCase().includes(normalized)),
      ),
    [campaigns.data, normalized],
  );
  const activeQuery =
    activeView === "organizations" ? organizations : campaigns;
  return (
    <div className="space-y-6">
      <UserPageHeader
        eyebrow="جهات موثوقة"
        title="المنظمات والحملات"
        description="تعرّف إلى المنظمات المعتمدة، استكشف حملاتها الدوائية النشطة واختر الجهة المناسبة للتبرع أو طلب المساعدة."
        icon={HeartHandshake}
      />
      <section className="rounded-[1.45rem] border border-[#174b57]/8 bg-white p-5">
        <div className="flex gap-2 border-b border-[#174b57]/8">
          <Tab
            active={activeView === "organizations"}
            icon={Building2}
            label="المنظمات المعتمدة"
            onClick={() => setParams({})}
          />
          <Tab
            active={activeView === "campaigns"}
            icon={Gift}
            label="الحملات النشطة"
            onClick={() => setParams({ view: "campaigns" })}
          />
        </div>
        <div className="field-control mt-5">
          <input
            className="form-input has-field-icon"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={200}
            placeholder={
              activeView === "organizations"
                ? "ابحث باسم المنظمة أو المدينة"
                : "ابحث باسم الحملة أو الدواء المطلوب"
            }
          />
          <span className="field-icon-shell">
            <Search size={18} />
          </span>
        </div>
      </section>
      {activeQuery.isLoading ? (
        <UserLoadingState
          label={
            activeView === "organizations"
              ? "جاري تحميل المنظمات..."
              : "جاري تحميل الحملات..."
          }
        />
      ) : activeQuery.isError ? (
        <UserErrorState
          message={getApiErrorMessage(activeQuery.error)}
          onRetry={activeQuery.refetch}
        />
      ) : activeView === "organizations" ? (
        <OrganizationsGrid
          organizations={filteredOrganizations}
          searching={Boolean(normalized)}
        />
      ) : (
        <CampaignsGrid
          campaigns={filteredCampaigns}
          searching={Boolean(normalized)}
        />
      )}
    </div>
  );
}

function Tab({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 pb-4 text-sm font-black transition ${active ? "border-violet-700 text-violet-700" : "border-transparent text-[#829499]"}`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}
function OrganizationsGrid({ organizations, searching }) {
  if (!organizations.length)
    return (
      <UserEmptyState
        title={
          searching ? "لا توجد نتائج مطابقة" : "لا توجد منظمات معتمدة حاليًا"
        }
        description={
          searching
            ? "جرّب البحث باسم مختلف أو باسم المدينة."
            : "ستظهر هنا المنظمات بعد اكتمال اعتمادها."
        }
      />
    );
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {organizations.map((organization) => (
        <Link
          key={organization.organizationId}
          to={`/app/organizations/${organization.organizationId}`}
          className="group rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_40px_rgba(61,54,95,.08)]"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#f2effa] text-violet-700">
              <Building2 size={22} />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
              <BadgeCheck size={14} />
              معتمدة
            </span>
          </div>
          <h3 className="mt-5 text-lg font-black text-[#29464d]">
            {organization.organizationName}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#71858a]">
            {organization.description ||
              "منظمة معتمدة ضمن شبكة المساعدة والتبرع الدوائي."}
          </p>
          <div className="mt-4 space-y-2 rounded-xl bg-[#f8fbfa] p-3 text-xs text-[#71858a]">
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              {[organization.area, organization.city]
                .filter(Boolean)
                .join("، ")}
            </span>
            <span className="flex items-center gap-2">
              <Phone size={14} />
              <span dir="ltr">{organization.phoneNumber || "غير مسجل"}</span>
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#174b57]/7 pt-4">
            <span className="text-xs font-black text-violet-700">
              {organization.activeCampaignsCount.toLocaleString("ar-SY")} حملات
              نشطة
            </span>
            <span className="flex items-center gap-1 text-xs font-black text-[#29464d]">
              عرض التفاصيل <ArrowLeft size={14} />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
function CampaignsGrid({ campaigns, searching }) {
  if (!campaigns.length)
    return (
      <UserEmptyState
        title={searching ? "لا توجد حملات مطابقة" : "لا توجد حملات نشطة حاليًا"}
        description={
          searching
            ? "جرّب اسم حملة أو دواء مختلفًا."
            : "ستظهر الحملات هنا عند نشرها من المنظمات المعتمدة."
        }
      />
    );
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <PublicCampaignCard key={campaign.campaignId} campaign={campaign} />
      ))}
    </section>
  );
}
