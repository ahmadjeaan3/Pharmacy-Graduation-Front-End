import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Gift,
  HandHeart,
  Headphones,
  LockKeyhole,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { Brand } from "../../../shared/components/Brand";

import {
  getOrganizationDetails,
  publicOrganizationKeys,
} from "../api/organizationApi";

import { PublicCampaignCard } from "../components/PublicCampaignCard";

const HERO_BACKGROUND =
  "/assets/app/organization/organization-dashboard-hero.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

export function PublicOrganizationDetailsPage() {
  const { organizationId } = useParams();

  const query = useQuery({
    queryKey: publicOrganizationKeys.detail(organizationId),
    queryFn: () => getOrganizationDetails(organizationId),
    enabled: Boolean(organizationId),
    retry: false,
  });

  if (query.isLoading) {
    return <UserLoadingState label="جاري تحميل بيانات المنظمة..." />;
  }

  if (query.isError) {
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  }

  const data = query.data;

  const fullAddress =
    [data.address, data.area, data.city].filter(Boolean).join("، ") ||
    "العنوان غير متوفر";

  const campaignsCount = Number(data.activeCampaigns?.length || 0);

  return (
    <div
      dir="rtl"
      className="
        m-0 min-h-screen w-full
        bg-[#F7F9FA] p-0
        text-[#333333]
      "
    >
      {/* =====================================================
          HERO
      ====================================================== */}
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
          {/* معلومات المنظمة */}
          <div className="min-w-0 text-right">
            <div className="flex items-center gap-3">
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
                <Building2 size={23} strokeWidth={1.8} />
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
                منظمة معتمدة
              </span>
            </div>

            <h1
              className="
                mt-5
                text-[27px]
                font-bold
                leading-tight
                sm:text-[30px]
              "
            >
              {data.organizationName}
            </h1>

            <p
              className="
                mt-3 max-w-[720px]
                text-[12px]
                leading-6
                text-white/75
              "
            >
              {data.description ||
                "منظمة معتمدة تعمل ضمن شبكة المساعدة والتبرع الدوائي."}
            </p>
          </div>

          {/* CTA */}
          <div className="flex w-full justify-start lg:w-auto">
            <Link
              to="/app/donations"
              className="
                inline-flex h-[52px]
                min-w-[250px]
                items-center justify-center
                gap-2.5
                rounded-[9px]
                border border-white/25
                bg-white/10
                px-7
                text-[14px]
                font-semibold
                text-white
                backdrop-blur-sm
                transition-all duration-200
                hover:border-white/40
                hover:bg-white/20
                hover:shadow-[0_8px_24px_rgba(0,0,0,.08)]
              "
            >
              <Gift size={19} strokeWidth={1.8} />
              التبرع أو طلب المساعدة
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          BODY
      ====================================================== */}
      <main
        className="
          mx-auto w-full
          max-w-[1200px]
          px-4 pb-12 pt-8
          sm:px-6
          lg:px-8
          xl:px-0
        "
      >
        {/* رجوع */}
        <div className="mb-6">
          <Link
            to="/app/organizations"
            className="
              inline-flex items-center
              gap-2
              text-[12px]
              font-medium
              text-[#216474]
              transition
              hover:text-[#174B57]
            "
          >
            <ArrowRight size={16} />
            العودة إلى المنظمات
          </Link>
        </div>

        {/* ===================================================
            INFO CARDS
        ==================================================== */}
        <section className="grid gap-5 md:grid-cols-3">
          <InfoCard icon={MapPin} label="العنوان" value={fullAddress} />

          <InfoCard
            icon={Phone}
            label="رقم التواصل"
            value={data.phoneNumber || "غير مسجل"}
            ltr
          />

          <InfoCard
            icon={HandHeart}
            label="الحملات النشطة"
            value={`${campaignsCount.toLocaleString("ar-SY")} حملات`}
          />
        </section>

        {/* ===================================================
            ACTIVE CAMPAIGNS
        ==================================================== */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div className="text-right">
              <h2
                className="
                  text-[24px]
                  font-medium
                  text-[#333333]
                "
              >
                الحملات النشطة
              </h2>

              <p
                className="
                  mt-2
                  text-[12px]
                  text-[#A5A5A5]
                "
              >
                الحملات المتاحة حاليًا لدى {data.organizationName}
              </p>
            </div>

            <span
              className="
                inline-flex min-h-[28px]
                items-center
                rounded-full
                bg-[#E6F3F6]
                px-3
                text-[11px]
                font-medium
                text-[#216474]
              "
            >
              {campaignsCount.toLocaleString("ar-SY")} حملات
            </span>
          </div>

          {campaignsCount ? (
            <div
              className="
                grid gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
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
      </main>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function InfoCard({ icon: Icon, label, value, ltr = false }) {
  return (
    <article
      className="
        flex min-h-[118px]
        items-center gap-4
        rounded-[10px]
        border border-[rgba(102,102,102,.14)]
        bg-white
        px-5 py-5
      "
    >
      <span
        className="
          grid size-11 shrink-0
          place-items-center
          rounded-[8px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1 text-right">
        <span
          className="
            block
            text-[11px]
            text-[#A5A5A5]
          "
        >
          {label}
        </span>

        <strong
          dir={ltr ? "ltr" : undefined}
          className="
            mt-2 block
            max-w-full
            break-words
            text-[14px]
            font-medium
            leading-6
            text-[#333333]
          "
        >
          {value || "غير محدد"}
        </strong>
      </div>
    </article>
  );
}

function FooterFeature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-start gap-3 text-right">
      <span
        className="
          grid size-10 shrink-0
          place-items-center
          rounded-[8px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 text-right">
        <strong
          className="
            text-[16px]
            font-medium
            leading-none
            text-[#666666]
          "
        >
          {title}
        </strong>

        <p
          className="
            mt-2
            text-[12px]
            leading-[20px]
            text-[#A5A5A5]
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default PublicOrganizationDetailsPage;
