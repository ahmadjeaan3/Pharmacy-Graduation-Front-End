import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CircleAlert,
  FileCheck2,
  Gift,
  HandHeart,
  HeartHandshake,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";
import {
  getOrganizationDashboard,
  organizationKeys,
} from "../api/organizationApi";
import {
  campaignStatusMeta,
  verificationMeta,
} from "../utils/organizationFormatters";

const ORGANIZATION_HERO_IMAGE =
  "/assets/app/organization/organization-dashboard-hero.png";

export function OrganizationDashboardPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

  const isArabic = currentLanguage === "ar";
  const direction = getLanguageDirection(currentLanguage);

  const locale =
    currentLanguage === "ar"
      ? "ar-SY"
      : currentLanguage === "tr"
        ? "tr-TR"
        : "en-US";

  const query = useQuery({
    queryKey: organizationKeys.dashboard,
    queryFn: getOrganizationDashboard,
  });

  if (query.isLoading) {
    return <UserLoadingState label={t("جاري تجهيز مساحة المنظمة...")} />;
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

  const verification =
    verificationMeta[data.verificationStatus] ||
    verificationMeta.PendingDocuments;

  const totalCampaignsCount = Number(
    data.totalCampaignsCount || 0,
  ).toLocaleString(locale);

  const stats = [
    {
      key: "campaigns",
      icon: HeartHandshake,
      value: data.activeCampaignsCount,
      label: t("حملات نشطة"),
      hint: `${totalCampaignsCount} ${t("حملات مسجلة")}`,
      iconBox: "bg-[#F4E6D8]",
      iconColor: "text-[#A66A3F]",
      indicatorColor: "text-[#A66A3F]",
      verified: false,
    },
    {
      key: "offers",
      icon: Gift,
      value: data.pendingDonationOffersCount,
      label: t("عروض تنتظر المراجعة"),
      hint: t("توجد زيادة عن الشهر الفائت"),
      iconBox: "bg-[#FFF4D6]",
      iconColor: "text-[#D4A017]",
      indicatorColor: "text-[#D4A017]",
      verified: false,
    },
    {
      key: "requests",
      icon: HandHeart,
      value: data.openAssistanceRequestsCount,
      label: t("طلبات مساعدة مفتوحة"),
      hint: t("توجد زيادة عن الشهر الفائت"),
      iconBox: "bg-[#FFF2E8]",
      iconColor: "text-[#FF974D]",
      indicatorColor: "text-[#FF974D]",
      verified: false,
    },
    {
      key: "documents",
      icon: FileCheck2,
      value: data.verificationDocumentsCount,
      label: t("مستندات التحقق"),
      hint: data.isApproved
        ? t("تم التحقق منها ومراجعتها")
        : t(verification.label),
      iconBox: "bg-[#E8F2F4]",
      iconColor: "text-[#216474]",
      indicatorColor: "text-[#216474]",
      verified: true,
    },
  ];

  const PrimaryArrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  const SecondaryArrow = isArabic ? ArrowLeft : ArrowRight;

  const LinkArrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="flex w-full flex-col gap-6"
    >
      {/* البانر */}
      <section className="relative min-h-[271px] w-full overflow-hidden rounded-xl bg-[#10505a] text-white max-sm:min-h-[310px]">
        {/* صورة البانر فقط */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ${
            isArabic ? "" : "scale-x-[-1]"
          }`}
          style={{
            backgroundImage: `url("${ORGANIZATION_HERO_IMAGE}")`,
          }}
        />

        {/* طبقة التعتيم */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isArabic
              ? "bg-[linear-gradient(270deg,#10505a_0%,rgba(33,100,116,.25)_70%,rgba(33,100,116,.05)_100%)]"
              : "bg-[linear-gradient(90deg,#10505a_0%,rgba(33,100,116,.25)_70%,rgba(33,100,116,.05)_100%)]"
          }`}
        />

        {/* بيانات المنظمة */}
        <div
          dir={direction}
          className={`absolute start-4 top-8 z-10 flex w-[calc(100%-2rem)] max-w-[540px] flex-col sm:start-8 sm:top-12 lg:start-[41px] ${
            isArabic ? "items-end text-right" : "items-start text-left"
          }`}
        >
          <div
            className={`flex w-full ${
              isArabic ? "justify-start" : "justify-start"
            }`}
          >
            <div
              dir="ltr"
              className={`inline-flex h-[26px] items-center gap-2 rounded-full bg-[rgba(230,243,246,.84)] px-4 text-xs text-[#666666] ${
                isArabic ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Sparkles size={17} strokeWidth={1.7} />
              <span dir={direction}>{t("مساحة إدارة المنظمة")}</span>
            </div>
          </div>

          <h2 className="mt-3 w-full text-2xl font-medium leading-tight text-white sm:text-[28px] sm:leading-[34px]">
            {data.organizationName}
          </h2>

          <p
            dir="ltr"
            className={`mt-3 flex w-full items-center gap-1 text-base text-[#d6d6d6] ${
              isArabic
                ? "flex-row-reverse justify-start"
                : "flex-row justify-start"
            }`}
          >
            <MapPin size={18} strokeWidth={1.7} />
            <span dir={direction}>
              {[data.area, data.city]
                .filter(Boolean)
                .join(isArabic ? "، " : ", ") || t("الموقع غير محدد")}
            </span>
          </p>

          <div
            dir="ltr"
            className={`mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center ${
              isArabic
                ? "justify-start sm:flex-row-reverse"
                : "justify-start sm:flex-row"
            }`}
          >
            <Link
              to="/app/organization/campaigns"
              className={`flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-medium text-[#216474] transition hover:bg-[#f8f8f8] ${
                isArabic ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span dir={direction}>{t("إدارة الحملات")}</span>

              <PrimaryArrow size={20} strokeWidth={1.7} />
            </Link>

            <Link
              to="/app/organization/offers"
              className={`flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-lg border border-white bg-transparent px-6 text-base font-medium text-white transition hover:bg-white/10 ${
                isArabic ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span dir={direction}>{t("العروض الواردة")}</span>

              <SecondaryArrow size={20} strokeWidth={1.7} />
            </Link>
          </div>
        </div>

        {/* بطاقة حالة المنظمة */}
        <div
          dir={direction}
          className={`absolute top-[48px] z-10 flex h-[119px] w-[249px] flex-col rounded-xl border border-white/15 bg-white/20 px-[18px] py-5 backdrop-blur-[10px] ${
            isArabic
              ? "items-start text-right lg:left-[41px]"
              : "items-start text-left lg:right-[41px]"
          }`}
        >
          <div className="flex w-full items-center justify-between text-xs text-[#d6d6d6]">
            <span>{t("حالة المنظمة")}</span>

            <BadgeCheck
              size={20}
              strokeWidth={1.8}
              className={data.isApproved ? "text-[#dfae0d]" : "text-[#dfae0d]"}
            />
          </div>

          <strong className="mt-3 block w-full text-base font-medium leading-6 text-[#e6f3f6]">
            {data.isApproved ? t("معتمدة وجاهزة للعمل") : t(verification.label)}
          </strong>

          <Link
            to="/app/organization/profile"
            className="mt-3 flex w-full items-center justify-start gap-2 text-xs font-medium text-[#dfae0d]"
          >
            <span>{t("مراجعة الملف والتحقق منه")}</span>
            <LinkArrow size={16} strokeWidth={1.7} className="shrink-0" />
          </Link>
        </div>
      </section>

      {/* الإحصائيات */}
      <section className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          ({
            key,
            icon: Icon,
            value,
            label,
            hint,
            iconBox,
            iconColor,
            indicatorColor,
            verified,
          }) => (
            <article
              key={key}
              dir={direction}
              className="flex min-h-[149px] min-w-0 flex-col rounded-lg border border-[rgba(102,102,102,.16)] bg-white px-4 py-5"
            >
              {/* الأيقونة والعنوان والقيمة */}
              <div
                dir="ltr"
                className={`flex w-full items-start gap-4 ${
                  isArabic ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-lg ${iconBox} ${iconColor}`}
                >
                  <Icon size={23} strokeWidth={1.7} />
                </span>

                <div
                  dir={direction}
                  className={`min-w-0 flex-1 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <span className="block truncate text-sm leading-6 text-[#333333]">
                    {label}
                  </span>

                  <strong className="mt-1 block text-2xl font-bold leading-8 text-[#333333]">
                    {Number(value || 0).toLocaleString(locale)}
                  </strong>
                </div>
              </div>

              <div
                dir="ltr"
                className={`mt-auto flex w-full items-center gap-4 text-xs text-[#A5A5A5] ${
                  isArabic ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center ${indicatorColor}`}
                >
                  {verified ? (
                    <Check size={17} strokeWidth={1.8} />
                  ) : (
                    <TrendingUp size={14} strokeWidth={1.8} />
                  )}
                </span>

                <span
                  dir={direction}
                  className={`min-w-0 flex-1 truncate ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {hint}
                </span>
              </div>
            </article>
          ),
        )}
      </section>

      {/* تنبيه الاعتماد */}
      {!data.isApproved && (
        <section
          dir="ltr"
          className={`flex min-h-[112px] w-full items-start gap-4 rounded-xl border border-[#fde3a0] bg-[#fff9e9] p-5 ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <CircleAlert size={22} className="shrink-0 text-[#b45309]" />

          <div
            dir={direction}
            className={`min-w-0 flex-1 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <h3 className="text-base font-bold text-[#7c2d12]">
              {t("أكمل اعتماد المنظمة")}
            </h3>

            <p className="mt-1.5 text-[13px] leading-7 text-[#92400e]">
              {t(
                "يجب اعتماد الحساب قبل إنشاء الحملات أو مراجعة عروض التبرع وطلبات المساعدة.",
              )}
            </p>

            <Link
              to="/app/organization/profile"
              className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#92400e]"
            >
              <span>{t("الانتقال إلى التحقق")}</span>
              <LinkArrow size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* أحدث الحملات */}
      <section className="relative w-full overflow-hidden rounded-[22px] border border-[#174b57]/[0.07] bg-white shadow-[0_18px_55px_rgba(23,75,87,0.07)]">
        {/* زخرفة خلفية */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 h-40 w-40 rounded-full bg-[#216474]/[0.06] blur-3xl ${
            isArabic ? "-left-12" : "-right-12"
          }`}
        />

        {/* رأس القسم */}
        <div
          dir="ltr"
          className={`relative flex items-center justify-between gap-5 border-b border-[#174b57]/[0.07] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfd_100%)] px-6 py-5 ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            dir={direction}
            className={`flex min-w-0 items-center gap-3 ${
              isArabic ? "flex-row text-right" : "flex-row text-left"
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[19px] font-bold text-[#29464d]">
                  {t("أحدث الحملات")}
                </h3>
              </div>

              <p className="mt-1 text-xs leading-5 text-[#8b9da1]">
                {t("آخر الحملات المسجلة باسم المنظمة")}
              </p>
            </div>
          </div>

          <Link
            to="/app/organization/campaigns"
            dir={direction}
            className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#216474]/15 bg-white px-4 text-sm font-bold text-[#216474] shadow-sm transition hover:-translate-y-0.5 hover:border-[#216474]/30 hover:bg-[#f5faf9] hover:shadow-md"
          >
            <span>{t("عرض الكل")}</span>

            <LinkArrow
              size={16}
              strokeWidth={1.8}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </Link>
        </div>

        {/* محتوى القسم */}
        <div className="relative p-5">
          {data.recentCampaigns?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.recentCampaigns.map((campaign, index) => {
                const meta = campaignStatusMeta[campaign.status] || {};

                const accentClasses = [
                  {
                    icon: "bg-[#F4E6D8] text-[#A66A3F]",
                    glow: "bg-[#A66A3F]/[0.06]",
                    badge: "bg-[#F4E6D8] text-[#A66A3F]",
                  },
                  {
                    icon: "bg-[#FFF4D6] text-[#D4A017]",
                    glow: "bg-[#D4A017]/[0.06]",
                    badge: "bg-[#FFF4D6] text-[#D4A017]",
                  },
                  {
                    icon: "bg-[#FFF2E8] text-[#FF974D]",
                    glow: "bg-[#FF974D]/[0.06]",
                    badge: "bg-[#FFF2E8] text-[#FF974D]",
                  },
                ];

                const accent = accentClasses[index % accentClasses.length];

                return (
                  <article
                    dir={direction}
                    className={`group relative min-h-[165px] overflow-hidden rounded-[18px] border border-[#174b57]/[0.08] bg-white p-5 shadow-[0_8px_28px_rgba(23,75,87,0.055)] transition duration-300 hover:-translate-y-1 hover:border-[#216474]/20 hover:shadow-[0_18px_38px_rgba(23,75,87,0.11)] ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {/* زخرفة داخلية */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -bottom-10 -start-10 size-28 rounded-full blur-2xl ${accent.glow}`}
                    />

                    {/* الصف العلوي */}
                    <div
                      dir="ltr"
                      className={`relative flex w-full items-center justify-between gap-3 ${
                        isArabic ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* الأيقونة + الاسم */}
                      <div
                        dir={direction}
                        className={`flex min-w-0 flex-1 items-center gap-3 ${
                          isArabic ? "flex-row" : "flex-row"
                        }`}
                      >
                        <h4 className="min-w-0 truncate text-[16px] font-bold text-[#29464d]">
                          {campaign.title}
                        </h4>
                      </div>

                      {/* الحالة */}
                      <div className="flex shrink-0 items-center gap-2">
                        {campaign.isUrgent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE6E6] px-2.5 py-1 text-[10px] font-bold text-[#D92D20]">
                            <CircleAlert size={12} />
                            {t("عاجلة")}
                          </span>
                        )}

                        <span className="inline-flex rounded-full bg-[#EAF4F3] px-3 py-1 text-[10px] font-bold text-[#216474]">
                          {t(meta.label || campaign.status)}
                        </span>
                      </div>
                    </div>

                    {/* الوصف */}
                    <p className="relative mt-4 line-clamp-2 min-h-[48px] text-xs leading-6 text-[#71858a]">
                      {campaign.description}
                    </p>

                    {/* الأسفل */}
                    <div
                      dir="ltr"
                      className={`relative mt-4 flex items-center justify-between gap-3 ${
                        isArabic ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <span
                        dir={direction}
                        className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#829499]"
                      >
                        <MapPin
                          size={13}
                          strokeWidth={1.8}
                          className="shrink-0 text-[#216474]"
                        />

                        <span className="truncate">
                          {[campaign.area, campaign.city]
                            .filter(Boolean)
                            .join(isArabic ? "، " : ", ") ||
                            t("الموقع غير محدد")}
                        </span>
                      </span>

                      <Link
                        to="/app/organization/campaigns"
                        dir={direction}
                        className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#216474] transition group-hover:gap-2"
                      >
                        <span>{t("التفاصيل")}</span>
                        <LinkArrow size={13} strokeWidth={1.8} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="relative flex min-h-[150px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#216474]/20 bg-[linear-gradient(180deg,#fbfdfd_0%,#f7fbfa_100%)] px-6 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                <HeartHandshake size={25} strokeWidth={1.7} />
              </span>

              <h4 className="mt-4 text-sm font-bold text-[#29464d]">
                {t("لا توجد حملات مسجلة بعد.")}
              </h4>

              <p className="mt-1 text-xs text-[#8b9da1]">
                {t("عند إنشاء حملة جديدة ستظهر هنا مباشرة.")}
              </p>

              <Link
                to="/app/organization/campaigns"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-[#216474] px-4 text-xs font-bold text-white shadow-[0_8px_20px_rgba(33,100,116,.18)] transition hover:bg-[#174b57]"
              >
                <span>{t("إدارة الحملات")}</span>
                <LinkArrow size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
