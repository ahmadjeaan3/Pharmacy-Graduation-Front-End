import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Gift,
  Headphones,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { Brand } from "../../../shared/components/Brand";

import {
  getActiveOrganizationCampaigns,
  getApprovedOrganizations,
  publicOrganizationKeys,
} from "../api/organizationApi";

import { PublicCampaignCard } from "../components/PublicCampaignCard";

const HERO_BACKGROUND = "/assets/app/home/hero_search.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

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
          [
            item.organizationName,
            item.city,
            item.area,
            item.description,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(normalized),
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
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(normalized),
          ),
      ),
    [campaigns.data, normalized],
  );

  const activeQuery =
    activeView === "organizations" ? organizations : campaigns;

  const organizationCount = (organizations.data || []).length;
  const campaignCount = (campaigns.data || []).length;

  return (
    <div
      dir="rtl"
      className="m-0 min-h-screen w-full bg-[#F7F9FA] p-0 text-[#333333]"
    >
      <section
        className="
          relative isolate
          -mt-6 overflow-hidden
          bg-[#10505A]
          text-white
          sm:-mt-7
          lg:-mt-8
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute inset-0 -z-20
            h-full w-full
            select-none
            object-cover object-center
            opacity-100
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[linear-gradient(270deg,#10505A_0%,rgba(33,100,116,.25)_70%,rgba(33,100,116,.05)_100%)]
          "
        />

        <div
          className="
            mx-auto grid min-h-[271px]
            w-full max-w-[1200px]
            items-center gap-6
            px-5 py-8
            sm:px-7
            lg:grid-cols-[1fr_auto]
            lg:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-4 text-right">
            <span
              className="
                grid size-12 shrink-0
                place-items-center
                rounded-[10px]
                border border-white/15
                bg-white/10
                backdrop-blur-sm
              "
            >
              <HeartHandshake size={23} strokeWidth={1.8} />
            </span>

            <div className="min-w-0 text-right">
              <h1 className="text-[27px] font-bold leading-tight sm:text-[30px]">
                المنظمات والحملات
              </h1>

              <p className="mt-2 max-w-[720px] text-[12px] leading-6 text-white/75">
                تعرّف إلى المنظمات المعتمدة، استكشف الحملات الدوائية النشطة،
                واختر الجهة المناسبة للتبرع أو طلب المساعدة.
              </p>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[370px]">
            <HeroStatCard
              icon={Building2}
              label="المنظمات المعتمدة"
              value={organizationCount}
            />

            <HeroStatCard
              icon={Gift}
              label="الحملات النشطة"
              value={campaignCount}
            />
          </div>
        </div>
      </section>

      <main
        className="
          mx-auto w-full
          max-w-[1200px]
          px-4 pb-12 pt-10
          sm:px-6
          lg:px-8
          xl:px-0
        "
      >
        <section>
          <div
            className="
              grid h-11
              grid-cols-2
              overflow-hidden
              rounded-[4px]
              border border-[rgba(102,102,102,.12)]
              bg-white
            "
          >
            <Tab
              active={activeView === "organizations"}
              icon={Building2}
              label={`المنظمات المعتمدة (${organizationCount.toLocaleString(
                "ar-SY",
              )})`}
              onClick={() => setParams({})}
            />

            <Tab
              active={activeView === "campaigns"}
              icon={Gift}
              label={`الحملات النشطة (${campaignCount.toLocaleString(
                "ar-SY",
              )})`}
              onClick={() => setParams({ view: "campaigns" })}
            />
          </div>

          <div className="mt-6">
            <label
              className="
                flex h-11
                w-full items-center gap-2
                rounded-[5px]
                border border-[rgba(102,102,102,.14)]
                bg-white
                px-3
              "
            >
              <Search size={17} className="shrink-0 text-[#A5A5A5]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                maxLength={200}
                placeholder={
                  activeView === "organizations"
                    ? "ابحث باسم المنظمة أو المدينة..."
                    : "ابحث باسم الحملة أو الدواء المطلوب..."
                }
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-right text-[12px]
                  text-[#555555]
                  outline-none
                  placeholder:text-[#B8C1C3]
                "
              />
            </label>
          </div>
        </section>

        <section className="mt-7">
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
        </section>
      </main>

     
    </div>
  );
}

function HeroStatCard({ icon: Icon, label, value }) {
  return (
    <div
      className="
        flex min-h-[72px] items-center gap-3
        rounded-[9px]
        border border-white/12
        bg-white/12
        px-4 py-3
        backdrop-blur-sm
      "
    >
      <span
        className="
          grid size-11 shrink-0
          place-items-center
          rounded-[8px]
          bg-white/12
        "
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="text-right">
        <span className="block text-[9.5px] text-white/70">{label}</span>

        <strong className="mt-1 block text-[20px] font-bold text-white">
          {Number(value || 0).toLocaleString("ar-SY")}
        </strong>
      </div>
    </div>
  );
}

function Tab({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        items-center justify-center
        gap-2
        text-[13px]
        font-medium
        transition
        ${
          active
            ? "bg-[#216474] text-white"
            : "bg-white text-[#A5A5A5] hover:bg-[#F4F8F8]"
        }
      `}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function OrganizationsGrid({ organizations, searching }) {
  if (!organizations.length) {
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
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {organizations.map((organization) => (
        <Link
          key={organization.organizationId}
          to={`/app/organizations/${organization.organizationId}`}
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
            <div className="flex items-start justify-between gap-3">
              <span
                className="
                  grid size-12
                  place-items-center
                  rounded-[9px]
                  bg-[#E6F3F6]
                  text-[#216474]
                "
              >
                <Building2 size={22} />
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  bg-[#EAF8EF]
                  px-3 py-1.5
                  text-[10.5px]
                  font-medium
                  text-[#2A8B57]
                "
              >
                <BadgeCheck size={14} />
                معتمدة
              </span>
            </div>

            <h3 className="mt-5 text-[18px] font-semibold text-[#333333]">
              {organization.organizationName}
            </h3>

            <p
              className="
                mt-2 line-clamp-2
                min-h-[48px]
                text-[12px]
                leading-6
                text-[#8A989B]
              "
            >
              {organization.description ||
                "منظمة معتمدة ضمن شبكة المساعدة والتبرع الدوائي."}
            </p>

            <div
              className="
                mt-5 space-y-3
                rounded-[8px]
                border border-[rgba(102,102,102,.10)]
                bg-[#FBFCFC]
                p-3
                text-[11.5px]
                text-[#71858A]
              "
            >
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-[#216474]" />
                {[organization.area, organization.city]
                  .filter(Boolean)
                  .join("، ") || "الموقع غير محدد"}
              </span>

              <span className="flex items-center gap-2">
                <Phone size={14} className="text-[#216474]" />
                <span dir="ltr">{organization.phoneNumber || "غير مسجل"}</span>
              </span>
            </div>
          </div>

          <div
            className="
              flex items-center
              justify-between
              border-t
              border-[rgba(102,102,102,.10)]
              px-5 py-4
            "
          >
            <span className="text-[11px] font-medium text-[#DFAF45]">
              {Number(organization.activeCampaignsCount || 0).toLocaleString(
                "ar-SY",
              )}{" "}
              حملات نشطة
            </span>

            <span
              className="
                flex items-center gap-1
                text-[11.5px]
                font-medium
                text-[#216474]
                transition
                group-hover:gap-2
              "
            >
              عرض التفاصيل
              <ArrowLeft size={14} />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

function CampaignsGrid({ campaigns, searching }) {
  if (!campaigns.length) {
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
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <PublicCampaignCard key={campaign.campaignId} campaign={campaign} />
      ))}
    </section>
  );
}

function FooterFeature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-start gap-3 text-right">
      <span
        className="
          grid size-10
          shrink-0
          place-items-center
          rounded-[8px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 text-right">
        <strong className="text-[13px] font-medium text-[#666666]">
          {title}
        </strong>

        <p className="mt-1 text-[10.5px] text-[#A5A5A5]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default OrganizationsDirectoryPage;