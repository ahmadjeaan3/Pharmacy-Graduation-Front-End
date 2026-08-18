import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  ClipboardList,
  Clock3,
  FileText,
  MapPin,
  PackageCheck,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { getPharmacyDashboard, pharmacyKeys } from "../api/pharmacyApi";
import {
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import { formatNumber } from "../utils/pharmacyFormatters";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

const statTones = {
  primary: "bg-[#EAF4F3] text-[#216474]",
  success: "bg-[#F0F6F7] text-[#174B57]",
  warning: "bg-[#FFF7DF] text-[#DFAE0D]",
  danger: "bg-[#FFF1F2] text-[#E11D48]",
};

function Stat({ icon: Icon, label, value, hint, tone = "primary", isArabic }) {
  return (
    <article className="relative min-h-[150px] overflow-hidden rounded-[1.35rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
      <span
        className={`absolute top-5 grid size-11 place-items-center rounded-xl ${
          isArabic ? "right-5" : "left-5"
        } ${statTones[tone] || statTones.primary}`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <div className={isArabic ? "pr-16 text-right" : "pl-16 text-left"}>
        <p className="text-[12px] font-semibold text-[#71858A]">{label}</p>

        <strong className="mt-3 block text-[30px] font-black leading-none text-[#17363E]">
          {formatNumber(value)}
        </strong>

        <p className="mt-4 text-[11px] leading-5 text-[#A5A5A5]">{hint}</p>
      </div>
    </article>
  );
}

export function PharmacyDashboardPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const query = useQuery({
    queryKey: pharmacyKeys.dashboard,
    queryFn: getPharmacyDashboard,
  });

  if (query.isLoading) return <PharmacyLoadingState />;

  if (query.isError) {
    return (
      <PharmacyErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  }

  const data = query.data;

  const setup = [
    {
      done: data.isApproved,
      label: t("اعتماد حساب الصيدلية"),
    },
    {
      done: data.hasLocation,
      label: t("إضافة موقع الصيدلية"),
    },
    {
      done: data.hasWorkingHoursConfigured,
      label: t("تحديد ساعات العمل"),
    },
    {
      done: data.inventoryItemsCount > 0,
      label: t("إضافة الأدوية للمخزون"),
    },
  ];

  const alerts = [
    ...(data.expiredItems || []),
    ...(data.lowStockItems || []),
    ...(data.expiringSoonItems || []),
  ].slice(0, 6);

  const InventoryArrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div dir={direction} lang={currentLanguage} className="space-y-6">
      {/* Hero */}
      <section className="relative isolate min-h-[220px] overflow-hidden rounded-[14px] text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] sm:min-h-[230px] lg:min-h-[250px]">
        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-[center_42%] ${
            isArabic ? "scale-x-[-1]" : ""
          }`}
        />

        <div
          className="absolute inset-0"
          style={{
            background: isArabic
              ? "linear-gradient(270deg, #10505A 0%, rgba(16,80,90,.88) 34%, rgba(33,100,116,.42) 68%, rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg, #10505A 0%, rgba(16,80,90,.88) 34%, rgba(33,100,116,.42) 68%, rgba(33,100,116,.08) 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute -top-20 size-64 rounded-full border-[40px] border-white/[.04] ${
            isArabic ? "-left-14" : "-right-14"
          }`}
        />

        <div className="relative z-10 flex min-h-[220px] flex-col justify-between gap-8 px-6 py-7 sm:min-h-[230px] lg:min-h-[250px] lg:flex-row lg:items-center lg:px-9">
          {/* Main pharmacy info */}
          <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(230,243,246,.84)] px-3 py-1.5 text-xs font-bold text-[#666666] backdrop-blur-sm">
                <BadgeCheck size={14} />
                {t("مركز تشغيل الصيدلية")}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  data.isOpenNow
                    ? "bg-[#FFF7DF] text-[#DFAE0D]"
                    : "bg-[#F0F6F7]/90 text-[#60777D]"
                }`}
              >
                {data.isOpenNow ? t("مفتوحة الآن") : t("مغلقة الآن")}
              </span>
            </div>

            <h1 className="mt-4 truncate text-3xl font-black lg:text-4xl">
              {t(data.pharmacyName || "")}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-sm text-[#D6D6D6]">
              <MapPin size={16} />
              {[data.area ? t(data.area) : "", data.city ? t(data.city) : ""]
                .filter(Boolean)
                .join(isArabic ? "، " : ", ") || t("لم يحدد الموقع بعد")}
            </p>
          </div>

          {/* Hero summary cards */}
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[300px]">
            <div
              className={`relative min-h-[92px] rounded-[12px] border border-[rgba(102,102,102,.16)] bg-[rgba(2,77,82,.56)] p-4 backdrop-blur-[10px] ${
                isArabic ? "pl-14 text-right" : "pr-14 text-left"
              }`}
            >
              <span
                className={`absolute top-1/2 mt-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#E6F3F6] ${
                  isArabic ? "left-4" : "right-4"
                }`}
              >
                <FileText size={24} strokeWidth={1.8} />
              </span>

              <p className="text-xs text-[#D6D6D6]">{t("اكتمال الملف")}</p>

              <strong className="mt-2 block text-2xl font-black text-[#E6F3F6]">
                {formatNumber(data.profileCompletionPercentage)}%
              </strong>
            </div>

            <div
              className={`relative min-h-[92px] rounded-[12px] border border-[rgba(102,102,102,.16)] bg-[rgba(2,77,82,.56)] p-4 backdrop-blur-[10px] ${
                isArabic ? "pl-14 text-right" : "pr-14 text-left"
              }`}
            >
              <span
                className={`absolute top-1/2 mt-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg ${
                  isArabic ? "left-4" : "right-4"
                }`}
              >
                <Star size={24} className="fill-[#DFAE0D] text-[#DFAE0D]" />
              </span>

              <p className="text-xs text-[#D6D6D6]">{t("التقييم")}</p>

              <strong className="mt-2 block text-2xl font-black text-[#E6F3F6]">
                {Number(data.averageRating || 0).toFixed(1)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Boxes}
          value={data.inventoryItemsCount}
          label={t("أصناف المخزون")}
          hint={t("{{count}} صنف متاح للمرضى", {
            count: formatNumber(data.availableMedicinesCount),
          })}
          tone="primary"
          isArabic={isArabic}
        />

        <Stat
          icon={PackageCheck}
          value={data.inStockCount}
          label={t("متوفر بالمخزون")}
          hint={t("{{count}} أصناف منخفضة", {
            count: formatNumber(data.lowStockCount),
          })}
          tone="success"
          isArabic={isArabic}
        />

        <Stat
          icon={ClipboardList}
          value={data.pendingRequestsCount}
          label={t("طلبات تنتظر الرد")}
          hint={t("{{count}} طلبات نشطة", {
            count: formatNumber(data.activeRequestsCount),
          })}
          tone="warning"
          isArabic={isArabic}
        />

        <Stat
          icon={CalendarClock}
          value={data.expiringSoonCount}
          label={t("قريبة الانتهاء")}
          hint={t("{{out}} نافد و{{expired}} منتهي الصلاحية", {
            out: formatNumber(data.outOfStockCount),
            expired: formatNumber(data.expiredCount || 0),
          })}
          tone="danger"
          isArabic={isArabic}
        />
      </section>

      {/* Bottom sections */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        {/* Alerts */}
        <div className="overflow-hidden rounded-[1.55rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-6 py-5">
            <div className={isArabic ? "text-right" : "text-left"}>
              <h2 className="font-black text-[#29464D]">
                {t("تنبيهات تستحق المتابعة")}
              </h2>
              <p className="mt-1 text-xs text-[#829499]">
                {t("أهم حالات المخزون مرتبة لتسهيل القرار")}
              </p>
            </div>

            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-[#EAF4F3] px-3.5 py-2 text-xs font-bold text-[#216474] transition hover:bg-[#DCEFED]"
              to="/app/pharmacy/inventory"
            >
              {t("عرض المخزون")}
              <InventoryArrow size={16} />
            </Link>
          </div>

          <div className="space-y-3 p-5">
            {alerts.length ? (
              alerts.map((item) => {
                const isExpiring = item.alertType === "ExpiringSoon";
                const isExpired = item.alertType === "Expired";

                return (
                  <div
                    key={`${item.alertType}-${item.inventoryItemId}`}
                    className="flex items-center gap-3 rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-4"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        isExpired
                          ? "bg-slate-100 text-slate-700"
                          : isExpiring
                            ? "bg-[#FFF1F2] text-[#E11D48]"
                            : "bg-[#FFF7DF] text-[#DFAE0D]"
                      }`}
                    >
                      <AlertTriangle size={18} />
                    </span>

                    <div
                      className={`min-w-0 flex-1 ${isArabic ? "text-right" : "text-left"}`}
                    >
                      <p className="truncate text-sm font-bold text-[#29464D]">
                        {item.medicineName}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#829499]">
                        {isExpired
                          ? t("انتهت صلاحية هذا الصنف ويجب عزله عن الطلبات")
                          : isExpiring
                            ? t("متبقي {{count}} يومًا على الانتهاء", {
                                count: formatNumber(item.daysUntilExpiry),
                              })
                            : t(
                                "الكمية الحالية {{quantity}} والحد الأدنى {{threshold}}",
                                {
                                  quantity: formatNumber(item.quantity),
                                  threshold: formatNumber(
                                    item.lowStockThreshold,
                                  ),
                                },
                              )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid min-h-[180px] place-items-center rounded-xl border border-dashed border-[#CFE0E3] bg-[#F8FBFB] p-6 text-center">
                <div>
                  <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                    <CheckCircle2 size={22} />
                  </span>

                  <h3 className="mt-4 font-bold text-[#29464D]">
                    {t("لا توجد تنبيهات عاجلة")}
                  </h3>

                  <p className="mt-2 text-sm text-[#829499]">
                    {t("حالة المخزون جيدة حاليًا")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Readiness */}
        <div className="overflow-hidden rounded-[1.55rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-6 py-5">
            <div className={isArabic ? "text-right" : "text-left"}>
              <h2 className="font-black text-[#29464D]">
                {t("جاهزية الصيدلية")}
              </h2>

              <p className="mt-1 text-xs text-[#829499]">
                {t("خطوات ظهور بياناتك بدقة")}
              </p>
            </div>

            <span className="grid size-11 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
              <BadgeCheck size={21} />
            </span>
          </div>

          <div className="p-5">
            <div className="space-y-3">
              {setup.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] px-4 py-3"
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full ${
                      item.done
                        ? "bg-[#EAF4F3] text-[#216474]"
                        : "bg-[#F0F6F7] text-[#A5A5A5]"
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <CircleOff size={17} />
                    )}
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      item.done ? "text-[#29464D]" : "text-[#829499]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE8EA] bg-white px-3 text-xs font-bold text-[#216474] transition hover:bg-[#EAF4F3]"
                to="/app/pharmacy/profile"
              >
                <MapPin size={16} />
                {t("الملف والموقع")}
              </Link>

              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE8EA] bg-white px-3 text-xs font-bold text-[#216474] transition hover:bg-[#EAF4F3]"
                to="/app/pharmacy/working-hours"
              >
                <Clock3 size={16} />
                {t("ساعات العمل")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
