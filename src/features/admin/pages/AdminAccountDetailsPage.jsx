import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  HeartPulse,
  MapPin,
  PackageSearch,
  Search,
  ShieldCheck,
  ToggleLeft,
  Truck,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";
import {
  adminKeys,
  getAdminAccount,
  updateAdminAccountStatus,
} from "../api/adminApi";

const roleLabels = {
  User: "مستخدم",
  Pharmacy: "صيدلية",
  Organization: "منظمة",
  Warehouse: "مستودع",
  Representative: "مندوب",
  Admin: "إدارة",
};

const roleIcons = {
  User: UserRound,
  Pharmacy: Building2,
  Organization: Building2,
  Warehouse,
  Representative: Truck,
  Admin: ShieldCheck,
};

const statTones = {
  primary: "bg-[#EAF4F3] text-[#216474]",
  muted: "bg-[#F0F6F7] text-[#60777D]",
  warning: "bg-[#FFF7DF] text-[#DFAE0D]",
  success: "bg-[#EAF4F3] text-[#174B57]",
};

const parseList = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed.join("، ") || fallback : value;
  } catch {
    return value;
  }
};

export function AdminAccountDetailsPage() {
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

  const { userId } = useParams();
  const client = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [feedback, setFeedback] = useState("");

  const [statusReason, setStatusReason] = useState("");

  const account = useQuery({
    queryKey: adminKeys.account(userId),
    queryFn: () => getAdminAccount(userId),
  });

  const status = useMutation({
    mutationFn: (payload) => updateAdminAccountStatus(userId, payload),

    onSuccess: () => {
      client.invalidateQueries({
        queryKey: adminKeys.account(userId),
      });

      client.invalidateQueries({
        queryKey: ["admin", "accounts"],
      });

      setConfirmOpen(false);
      setStatusReason("");

      setFeedback(t("تم تحديث حالة الحساب وإرسال إشعار إلى صاحبه بنجاح."));
    },

    onError: (error) => setFeedback(getApiErrorMessage(error)),
  });

  if (account.isPending) {
    return (
      <section className="grid min-h-[320px] place-items-center rounded-[1.5rem] border border-[#DCE8EA] bg-white text-sm font-bold text-[#71858A]">
        {t("جاري تحميل الحساب...")}
      </section>
    );
  }

  if (account.isError) {
    return (
      <section className="rounded-[1.5rem] border border-[#FECDD3] bg-[#FFF1F2] p-8 text-center">
        <p className="font-bold text-[#BE123C]">{t("تعذر تحميل الحساب")}</p>

        <p className="mt-2 text-sm text-[#E11D48]">
          {getApiErrorMessage(account.error)}
        </p>
      </section>
    );
  }

  const item = account.data;

  const isAccountActive = item.isActive === true;

  const isUser = item.role === "User";

  const RoleIcon = roleIcons[item.role] || UserRound;

  const accountName = item.profileName || item.fullName;

  const createdAt = item.createdAtUtc
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(item.createdAtUtc))
    : t("غير محدد");

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="space-y-5 sm:space-y-6"
    >
      {/* Back */}
      <div>
        <Link
          to="/app/accounts"
          className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8EA] bg-white px-4 py-2.5 text-sm font-bold text-[#216474] shadow-[0_6px_20px_rgba(23,75,87,.04)] transition hover:border-[#AFC9CD] hover:bg-[#F8FBFB]"
        >
          {isArabic ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}

          {t("العودة إلى جميع الحسابات")}
        </Link>
      </div>

      {/* Hero */}
      <section className="relative isolate min-h-[230px] overflow-hidden rounded-[16px] bg-[#10505A] px-5 py-7 text-white shadow-[0_22px_55px_rgba(23,75,87,.14)] sm:min-h-[250px] sm:px-7 lg:min-h-[271px] lg:px-9">
        <div className="noise absolute inset-0 -z-10" />

        <div
          aria-hidden="true"
          className={`absolute -top-24 -z-[4] size-72 rounded-full border-[44px] border-white/[.035] ${
            isArabic ? "-left-12" : "-right-12"
          }`}
        />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-stretch xl:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-5">
            <span className="grid size-20 shrink-0 place-items-center rounded-[1.35rem] border border-white/10 bg-white/10 text-[#F5CB72]">
              <RoleIcon size={34} strokeWidth={1.8} />
            </span>

            <div
              className={`min-w-0 flex-1 ${isArabic ? "text-right" : "text-left"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[.07] px-3 py-1 text-xs font-bold text-[#BCE7E3]">
                  {t(roleLabels[item.role] || item.role)}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    isAccountActive
                      ? "bg-white/[.10] text-[#BCE7E3]"
                      : "bg-[#FFF1F2]/10 text-[#FFD7DF]"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isAccountActive ? "bg-[#8BD0CB]" : "bg-[#FCA5A5]"
                    }`}
                  />

                  {isAccountActive ? t("حساب فعال") : t("حساب موقوف")}
                </span>
              </div>

              <h1 className="mt-4 truncate text-3xl font-black sm:text-4xl">
                {accountName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/60">
                <span>{item.fullName}</span>
                <span className="text-white/25">•</span>
                <span dir="ltr">{item.email}</span>

                {item.phoneNumber ? (
                  <>
                    <span className="text-white/25">•</span>
                    <span dir="ltr">{item.phoneNumber}</span>
                  </>
                ) : null}
              </div>

              <p className="mt-3 flex items-center gap-2 text-xs text-white/45">
                <CalendarDays size={14} />
                {t("انضم في")} {createdAt}
              </p>
            </div>
          </div>

          <div className="w-full rounded-[1.25rem] border border-white/10 bg-white/[.07] p-5 backdrop-blur-sm xl:w-[290px]">
            <div className="flex items-start gap-3">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  isAccountActive
                    ? "bg-[#F5CB72]/10 text-[#F5CB72]"
                    : "bg-[#FFF1F2]/10 text-[#FCA5A5]"
                }`}
              >
                <ShieldCheck size={19} strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-white/40">
                  {t("إدارة حالة الحساب")}
                </p>

                <strong className="mt-1 block text-sm">
                  {isAccountActive
                    ? t("الحساب متاح للخدمات")
                    : t("الوصول إلى المنصة موقوف")}
                </strong>

                <p className="mt-2 text-[11px] leading-5 text-white/45">
                  {isAccountActive
                    ? t("يمكن لصاحب الحساب تسجيل الدخول واستخدام خدمات دوره.")
                    : t(
                        "لن يتمكن صاحب الحساب من تسجيل الدخول حتى إعادة تفعيله.",
                      )}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={status.isPending}
              onClick={() => {
                setFeedback("");
                setStatusReason("");
                setConfirmOpen(true);
              }}
              className={`group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-black transition duration-300 hover:-translate-y-0.5 ${
                isAccountActive
                  ? "border-[#F5CB72]/70 text-[#F5CB72] bg-transparent hover:bg-[#F5CB72]/10"
                  : "border-[#8BD0CB]/60 text-[#8BD0CB] bg-transparent hover:bg-[#8BD0CB]/10"
              }`}
            >
              <ToggleLeft
                size={19}
                className={`transition group-hover:scale-110 ${
                  isAccountActive
                    ? "text-[##F5CB72]"
                    : "text-[##F5CB72] rotate-180"
                }`}
              />

              {isAccountActive ? t("إيقاف الحساب") : t("تفعيل الحساب")}
            </button>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl border px-5 py-4 text-sm font-bold ${
            feedback.startsWith(t("تم"))
              ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
              : "border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Access state */}
      <section className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-[1.45rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-11 place-items-center rounded-xl ${
                isAccountActive
                  ? "bg-[#EAF4F3] text-[#216474]"
                  : "bg-[#FFF1F2] text-[#E11D48]"
              }`}
            >
              <ShieldCheck size={21} />
            </span>

            <div>
              <h2 className="font-black text-[#29464D]">
                {t("حالة الوصول إلى المنصة")}
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#71858A]">
                {isAccountActive
                  ? t(
                      "الحساب يستطيع تسجيل الدخول واستخدام الخدمات المتاحة لدوره.",
                    )
                  : t("تم منع الحساب من تسجيل الدخول واستخدام خدمات المنصة.")}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-between rounded-[1.45rem] border p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)] ${
            isAccountActive
              ? "border-[#CFE4E7] bg-[#EAF4F3]"
              : "border-[#FECDD3] bg-[#FFF1F2]"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-[#60777D]">
              {t("الحالة الحالية")}
            </span>

            <strong
              className={`mt-1 block text-lg font-black ${
                isAccountActive ? "text-[#174B57]" : "text-[#BE123C]"
              }`}
            >
              {isAccountActive ? t("نشط ومتاح") : t("موقوف")}
            </strong>
          </div>

          <span
            className={`relative flex size-3.5 rounded-full ring-4 ${
              isAccountActive
                ? "bg-[#216474] ring-[#CFE4E7]"
                : "bg-[#E11D48] ring-[#FECDD3]"
            }`}
          >
            {isAccountActive && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[#216474] opacity-25" />
            )}
          </span>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Stat
          icon={Activity}
          label={t("طلبات الأدوية")}
          value={item.medicineRequestsCount}
          tone="primary"
          locale={locale}
        />

        <Stat
          icon={Bell}
          label={t("الإشعارات")}
          value={item.notificationsCount}
          tone="muted"
          locale={locale}
        />

        {item.role === "Pharmacy" && (
          <Stat
            icon={PackageSearch}
            label={t("عناصر المخزون")}
            value={item.inventoryItemsCount}
            tone="warning"
            locale={locale}
          />
        )}

        {item.role === "Organization" && (
          <Stat
            icon={Building2}
            label={t("الحملات")}
            value={item.campaignsCount}
            tone="warning"
            locale={locale}
          />
        )}

        {isUser && (
          <Stat
            icon={Search}
            label={t("عمليات البحث")}
            value={item.searchHistoryCount}
            tone="success"
            locale={locale}
          />
        )}
      </section>

      {/* Main data */}
      <section className="grid gap-5 lg:grid-cols-2">
        <Card
          icon={UserRound}
          title={t("بيانات الحساب")}
          subtitle={t("معلومات الهوية والتواصل")}
        >
          <InfoGrid>
            <InfoBox label={t("الاسم الكامل")} value={item.fullName} t={t} />

            <InfoBox
              label={t("نوع الحساب")}
              value={t(roleLabels[item.role] || item.role)}
              t={t}
            />

            <InfoBox
              label={t("البريد الإلكتروني")}
              value={item.email}
              dir="rtl"
              t={t}
            />

            <InfoBox
              label={t("رقم الهاتف")}
              value={item.phoneNumber}
              dir="rtl"
              t={t}
            />

            <InfoBox
              label={t("الحالة")}
              value={isAccountActive ? t("فعال") : t("موقوف")}
              fullWidth
              t={t}
            />
          </InfoGrid>
        </Card>

        <Card
          icon={MapPin}
          title={t("بيانات الملف والموقع")}
          subtitle={t("تفاصيل الجهة والاعتماد")}
        >
          <InfoGrid>
            <InfoBox label={t("اسم الجهة")} value={item.profileName} t={t} />

            <InfoBox label={t("المدينة")} value={item.city} t={t} />

            <InfoBox label={t("المنطقة")} value={item.area} t={t} />

            <InfoBox label={t("العنوان")} value={item.address} t={t} />

            <InfoBox
              label={t("رقم الترخيص/التسجيل")}
              value={item.licenseOrRegistrationNumber}
              t={t}
            />

            <InfoBox
              label={t("حالة الاعتماد")}
              value={
                item.isApproved == null
                  ? null
                  : item.isApproved
                    ? t("معتمد")
                    : t("غير معتمد")
              }
              t={t}
            />

            <InfoBox
              label={t("الوصف")}
              value={item.description}
              fullWidth
              t={t}
            />
          </InfoGrid>
        </Card>
      </section>

      {/* Health profile */}
      {isUser && (
        <Card
          icon={HeartPulse}
          title={t("الملف الصحي")}
          subtitle={t("المعلومات الطبية المسجلة")}
        >
          <InfoGrid>
            <InfoBox label={t("زمرة الدم")} value={item.bloodType} t={t} />

            <InfoBox
              label={t("الحساسيات")}
              value={parseList(item.allergies, t("غير مضاف"))}
              t={t}
            />

            <InfoBox
              label={t("الأمراض المزمنة")}
              value={parseList(item.chronicConditions, t("غير مضاف"))}
              t={t}
            />

            <InfoBox
              label={t("الأدوية الحالية")}
              value={parseList(item.currentMedications, t("غير مضاف"))}
              t={t}
            />

            <InfoBox
              label={t("جهة اتصال الطوارئ")}
              value={item.emergencyContactName}
              t={t}
            />

            <InfoBox
              label={t("هاتف الطوارئ")}
              value={item.emergencyContactPhoneNumber}
              dir="ltr"
              t={t}
            />
          </InfoGrid>
        </Card>
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#071F25]/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-status-title"
            className="w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_100px_rgba(7,31,37,.35)]"
          >
            <div className="relative bg-[#174B57] px-6 py-7 text-white">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className={`absolute top-4 grid size-9 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20 ${
                  isArabic ? "left-4" : "right-4"
                }`}
                aria-label={t("إغلاق")}
              >
                <X size={18} />
              </button>

              <span
                className={`grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[.08] ${
                  isAccountActive ? "text-[#FFD7DF]" : "text-[#BCE7E3]"
                }`}
              >
                <ShieldCheck size={24} />
              </span>

              <h3
                id="account-status-title"
                className="mt-4 text-2xl font-black"
              >
                {isAccountActive
                  ? t("تأكيد إيقاف الحساب")
                  : t("تأكيد تفعيل الحساب")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/70">
                {accountName}
              </p>
            </div>

            <div className="p-6">
              <p className="leading-7 text-[#5F7479]">
                {isAccountActive
                  ? t(
                      "لن يتمكن صاحب الحساب من تسجيل الدخول أو استخدام خدمات المنصة حتى تعيد تفعيله.",
                    )
                  : t(
                      "سيتمكن صاحب الحساب مجددًا من تسجيل الدخول واستخدام الخدمات المتاحة لنوع حسابه.",
                    )}
              </p>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-bold text-[#29464D]">
                  {isAccountActive
                    ? t("سبب إيقاف الحساب")
                    : t("ملاحظة إعادة التفعيل (اختياري)")}
                </span>

                <textarea
                  rows={4}
                  maxLength={500}
                  required={isAccountActive}
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                  className="w-full rounded-xl border border-[#DCE8EA] bg-white px-4 py-3 text-sm text-[#29464D] outline-none transition placeholder:text-[#A5A5A5] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  placeholder={
                    isAccountActive
                      ? t("اكتب سببًا واضحًا لصاحب الحساب (10 أحرف على الأقل)")
                      : t("اكتب ملاحظة توضيحية لصاحب الحساب إن لزم")
                  }
                />

                <span className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#71858A]">
                  <Bell size={14} className="text-[#216474]" />

                  {t("سيصل إشعار إلى صاحب الحساب يوضح القرار وملاحظة الإدارة.")}
                </span>
              </label>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={status.isPending}
                  className="rounded-xl border border-[#DCE8EA] px-4 py-3 font-bold text-[#60777D] transition hover:bg-[#F8FBFB]"
                >
                  {t("إلغاء")}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    status.mutate({
                      isActive: !isAccountActive,

                      reason: statusReason.trim() || null,
                    })
                  }
                  disabled={
                    status.isPending ||
                    (isAccountActive && statusReason.trim().length < 10)
                  }
                  className={`rounded-xl border px-4 py-3 font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isAccountActive
                      ? "border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C] hover:bg-[#FFE4E6]"
                      : "border-[#CFE4E7] bg-[#EAF4F3] text-[#174B57] hover:bg-[#DCEFED]"
                  }`}
                >
                  {status.isPending
                    ? t("جاري الحفظ...")
                    : isAccountActive
                      ? t("نعم، أوقف الحساب")
                      : t("نعم، فعّل الحساب")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
      <div className="flex items-center gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-6 py-5">
        <span className="grid size-11 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
          <Icon size={20} />
        </span>

        <div>
          <h3 className="font-black text-[#29464D]">{title}</h3>

          <p className="mt-0.5 text-xs text-[#829499]">{subtitle}</p>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoGrid({ children }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function InfoBox({ label, value, dir, fullWidth = false, t }) {
  return (
    <div
      className={`rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] px-4 py-3 text-start ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <span className="block text-[10px] font-medium text-[#829499]">
        {label}
      </span>

      <strong
        dir={dir}
        className="mt-1 block break-words text-start text-[13px] font-bold leading-6 text-[#29464D]"
      >
        {value || t("غير مضاف")}
      </strong>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "primary",
  locale = "ar-SY",
}) {
  return (
    <article className="flex min-h-[108px] items-center gap-4 rounded-[1.35rem] border border-[#DCE8EA] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${
          statTones[tone] || statTones.primary
        }`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium text-[#71858A]">
          {label}
        </span>

        <strong className="mt-2 block text-[28px] font-black leading-none text-[#17363E]">
          {Number(value || 0).toLocaleString(locale)}
        </strong>
      </div>
    </article>
  );
}
