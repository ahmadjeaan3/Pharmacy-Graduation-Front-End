import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";
import {
  adminKeys,
  getAdminAccounts,
} from "../api/adminApi";

const roleLabels = {
  User: "مستخدم",
  Pharmacy: "صيدلية",
  Organization: "منظمة",
  Admin: "إدارة",
  Warehouse: "مستودع",
  Representative: "مندوب",
};

const roleIcons = {
  User: UserRound,
  Pharmacy: Building2,
  Organization: Building2,
  Admin: ShieldCheck,
  Warehouse,
  Representative: Truck,
};

const statTones = {
  primary:
    "bg-[#EAF4F3] text-[#216474]",
  success:
    "bg-[#EAF4F3] text-[#174B57]",
  muted:
    "bg-[#F0F6F7] text-[#60777D]",
  warning:
    "bg-[#FFF7DF] text-[#DFAE0D]",
};

export function AdminAccountsPage() {
  const { t, i18n } =
    useTranslation();

  const currentLanguage =
    normalizeLanguage(
      i18n.resolvedLanguage ||
        i18n.language ||
        "ar",
    );

  const isArabic =
    currentLanguage === "ar";

  const direction =
    getLanguageDirection(
      currentLanguage,
    );

  const locale =
    currentLanguage === "ar"
      ? "ar-SY"
      : currentLanguage === "tr"
        ? "tr-TR"
        : "en-US";

  const [filters, setFilters] =
    useState({
      search: "",
      role: "",
      status: "",
    });

  const accounts = useQuery({
    queryKey:
      adminKeys.accounts(filters),
    queryFn: () =>
      getAdminAccounts(filters),
  });

  const allAccounts =
    accounts.data || [];

  const stats = {
    total: allAccounts.length,

    active: allAccounts.filter(
      (item) => item.isActive,
    ).length,

    users: allAccounts.filter(
      (item) =>
        item.role === "User",
    ).length,

    entities: allAccounts.filter(
      (item) =>
        [
          "Pharmacy",
          "Organization",
          "Warehouse",
          "Representative",
        ].includes(item.role),
    ).length,
  };

  const field = (name) => ({
    value: filters[name],

    onChange: (event) =>
      setFilters((current) => ({
        ...current,
        [name]:
          event.target.value,
      })),
  });

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="space-y-6"
    >
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174B57] px-6 py-8 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] lg:px-9">
        <div className="noise absolute inset-0 -z-10" />

        <div
          aria-hidden="true"
          className={`absolute -top-24 -z-10 size-72 rounded-full border-[44px] border-white/[.035] ${
            isArabic
              ? "-left-12"
              : "-right-12"
          }`}
        />

        <div
          aria-hidden="true"
          className={`absolute -bottom-24 -z-10 size-52 rounded-full bg-[#6E969E]/10 blur-2xl ${
            isArabic
              ? "right-[42%]"
              : "left-[42%]"
          }`}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div
            className={
              isArabic
                ? "text-right"
                : "text-left"
            }
          >
            <p className="flex items-center gap-2 text-sm font-bold text-[#8BD0CB]">
              <Sparkles size={16} />

              {t(
                "مركز إدارة المنصة",
              )}
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              {t(
                "دليل الحسابات الموحّد",
              )}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-white/60">
              {t(
                "رؤية شاملة لكل حسابات المنصة، بياناتها وحالتها ونشاطها من مساحة إدارية واحدة.",
              )}
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[.08] px-4 py-3 text-sm font-bold backdrop-blur">
            <ShieldCheck
              size={18}
              className="text-[#F5CB72]"
            />

            {t(
              "وصول إداري محمي",
            )}
          </span>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label={t(
            "إجمالي الحسابات",
          )}
          value={stats.total}
          tone="primary"
          locale={locale}
        />

        <StatCard
          icon={CheckCircle2}
          label={t(
            "الحسابات الفعالة",
          )}
          value={stats.active}
          tone="success"
          locale={locale}
        />

        <StatCard
          icon={UserRound}
          label={t("المستخدمون")}
          value={stats.users}
          tone="muted"
          locale={locale}
        />

        <StatCard
          icon={Building2}
          label={t(
            "حسابات الجهات",
          )}
          value={stats.entities}
          tone="warning"
          locale={locale}
        />
      </section>

      {/* Search and filters */}
      <section className="rounded-[1.6rem] border border-[#174B57]/8 bg-white p-5 shadow-[0_14px_40px_rgba(23,75,87,.055)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div
            className={
              isArabic
                ? "text-right"
                : "text-left"
            }
          >
            <h3 className="font-black text-[#29464D]">
              {t(
                "البحث والتصفية",
              )}
            </h3>

            <p className="mt-1 text-xs text-[#829499]">
              {t(
                "اعثر على الحساب المطلوب بسرعة",
              )}
            </p>
          </div>

          <span className="rounded-full bg-[#EAF4F3] px-3 py-1.5 text-xs font-bold text-[#216474]">
            {formatResultsCount(
              allAccounts.length,
              currentLanguage,
              locale,
            )}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_190px]">
          <label className="relative block">
            <input
              {...field("search")}
              dir={direction}
              className={`h-12 w-full rounded-xl border border-[#DCE8EA] bg-white text-[14px] text-[#29464D] outline-none transition placeholder:text-[12px] placeholder:text-[#A5A5A5] hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                isArabic
                  ? "pl-4 pr-11 text-right"
                  : "pl-11 pr-4 text-left"
              }`}
              placeholder={t(
                "ابحث بالاسم أو البريد أو اسم الجهة",
              )}
            />

            <Search
              size={18}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#6E969E] ${
                isArabic
                  ? "right-3.5"
                  : "left-3.5"
              }`}
            />
          </label>

          <div className="relative">
            <select
              {...field("role")}
              dir={direction}
              className={`h-12 w-full appearance-none rounded-xl border border-[#DCE8EA] bg-white text-[14px] text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                isArabic
                  ? "pl-10 pr-4 text-right"
                  : "pl-4 pr-10 text-left"
              }`}
            >
              <option value="">
                {t(
                  "كل أنواع الحسابات",
                )}
              </option>

              <option value="User">
                {t("المستخدمون")}
              </option>

              <option value="Pharmacy">
                {t("الصيدليات")}
              </option>

              <option value="Organization">
                {t("المنظمات")}
              </option>

              <option value="Warehouse">
                {t("المستودعات")}
              </option>

              <option value="Representative">
                {t("المندوبون")}
              </option>

              <option value="Admin">
                {t("الإدارة")}
              </option>
            </select>

            <ChevronDown
              size={17}
              strokeWidth={1.8}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#6E969E] ${
                isArabic
                  ? "left-3.5"
                  : "right-3.5"
              }`}
            />
          </div>

          <div className="relative">
            <select
              {...field("status")}
              dir={direction}
              className={`h-12 w-full appearance-none rounded-xl border border-[#DCE8EA] bg-white text-[14px] text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                isArabic
                  ? "pl-10 pr-4 text-right"
                  : "pl-4 pr-10 text-left"
              }`}
            >
              <option value="">
                {t("كل الحالات")}
              </option>

              <option value="Active">
                {t(
                  "الحسابات الفعالة",
                )}
              </option>

              <option value="Inactive">
                {t(
                  "الحسابات الموقوفة",
                )}
              </option>
            </select>

            <ChevronDown
              size={17}
              strokeWidth={1.8}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#6E969E] ${
                isArabic
                  ? "left-3.5"
                  : "right-3.5"
              }`}
            />
          </div>
        </div>
      </section>

      {/* Loading */}
      {accounts.isPending && (
        <section className="grid min-h-[240px] place-items-center rounded-[1.5rem] border border-[#DCE8EA] bg-white text-sm font-bold text-[#71858A]">
          {t(
            "جاري تحميل الحسابات...",
          )}
        </section>
      )}

      {/* Error */}
      {accounts.isError && (
        <section className="rounded-[1.5rem] border border-[#FECDD3] bg-[#FFF1F2] p-6 text-center">
          <p className="font-bold text-[#BE123C]">
            {t(
              "تعذر تحميل الحسابات",
            )}
          </p>

          <p className="mt-2 text-sm text-[#E11D48]">
            {getApiErrorMessage(
              accounts.error,
            )}
          </p>

          <button
            type="button"
            onClick={() =>
              accounts.refetch()
            }
            className="mt-4 inline-flex h-10 items-center rounded-lg border border-[#D5E3E5] bg-white px-4 text-sm font-bold text-[#216474] transition hover:bg-[#EAF4F3]"
          >
            {t("إعادة المحاولة")}
          </button>
        </section>
      )}

      {/* Accounts */}
      {accounts.isSuccess && (
        <section className="grid gap-4 xl:grid-cols-2">
          {allAccounts.map(
            (account) => {
              const Icon =
                roleIcons[
                  account.role
                ] || UserRound;

              return (
                <article
                  key={account.userId}
                  className="group relative overflow-hidden rounded-[1.45rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)] transition duration-300 hover:-translate-y-1 hover:border-[#AFC9CD] hover:shadow-[0_18px_42px_rgba(23,75,87,.08)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                      <Icon size={22} strokeWidth={1.8} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="truncate text-[17px] font-bold text-[#17363E]">
                          {account.profileName || account.fullName}
                        </strong>

                        <span className="rounded-full bg-[#F0F6F7] px-2.5 py-1 text-[10px] font-bold text-[#60777D]">
                          {t(roleLabels[account.role] || account.role)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-[13px] text-[#71858A]">
                        {account.fullName}
                      </p>

                      <p
                        dir="ltr"
                        className={`mt-1 truncate text-[11px] text-[#A5A5A5] ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {account.email}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        account.isActive
                          ? "bg-[#EAF4F3] text-[#174B57]"
                          : "bg-[#FFF1F2] text-[#E11D48]"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          account.isActive ? "bg-[#216474]" : "bg-[#E11D48]"
                        }`}
                      />
                      {account.isActive ? t("فعال") : t("موقوف")}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] px-4 py-3">
                      <span className="block text-[10px] text-[#829499]">
                        {t("المدينة")}
                      </span>
                      <strong className="mt-1 block truncate text-[13px] font-bold text-[#29464D]">
                        {account.city || t("غير محدد")}
                      </strong>
                    </div>

                    <div className="rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] px-4 py-3">
                      <span className="block text-[10px] text-[#829499]">
                        {t("رقم الهاتف")}
                      </span>
                      <strong
                        dir="ltr"
                        className={`mt-1 block truncate text-[13px] font-bold text-[#29464D] ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {account.phoneNumber || t("غير محدد")}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E6EEF0] pt-4">
                    <span className="text-[11px] text-[#A5A5A5]">
                      {t("إدارة الحساب")}
                    </span>

                    <Link
                      to={`/app/accounts/${account.userId}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#EAF4F3] px-3.5 py-2 text-[12px] font-bold text-[#216474] transition hover:bg-[#174B57] hover:text-white"
                    >
                      {t("عرض التفاصيل")}
                      {isArabic ? (
                        <ChevronLeft size={15} />
                      ) : (
                        <ChevronRight size={15} />
                      )}
                    </Link>
                  </div>
                </article>
              );
            },
          )}

          {!allAccounts.length && (
            <div className="grid min-h-[240px] place-items-center rounded-[1.5rem] border border-dashed border-[#CFE0E3] bg-white p-10 text-center xl:col-span-2">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                  <UsersRound
                    size={22}
                  />
                </span>

                <h3 className="mt-4 font-bold text-[#29464D]">
                  {t(
                    "لا توجد حسابات مطابقة",
                  )}
                </h3>

                <p className="mt-2 text-sm text-[#829499]">
                  {t(
                    "جرّب تغيير كلمات البحث أو خيارات التصفية.",
                  )}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function formatResultsCount(
  count,
  currentLanguage,
  locale,
) {
  const formattedCount = Number(
    count || 0,
  ).toLocaleString(locale);

  if (currentLanguage === "en") {
    return `${formattedCount} results`;
  }

  if (currentLanguage === "tr") {
    return `${formattedCount} sonuç`;
  }

  return `${formattedCount} نتيجة`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
  locale = "ar-SY",
}) {
  return (
    <article className="rounded-[1.4rem] border border-[#174B57]/8 bg-white p-4 shadow-[0_10px_30px_rgba(23,75,87,.04)] sm:p-5">
      <span
        className={`grid size-10 place-items-center rounded-xl ${
          statTones[tone] ||
          statTones.primary
        }`}
      >
        <Icon size={19} />
      </span>

      <strong className="mt-4 block text-2xl font-black text-[#17363E]">
        {Number(
          value || 0,
        ).toLocaleString(locale)}
      </strong>

      <span className="mt-1 block text-xs font-semibold text-[#71858A]">
        {label}
      </span>
    </article>
  );
}