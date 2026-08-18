import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Check,
  ChevronDown,
  HandHeart,
  Package,
  Phone,
  Pill,
  Save,
  Search,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  assistanceStatuses,
  getStatusMeta,
} from "../../donations/utils/donationFormatters";
import {
  getOrganizationAssistanceRequests,
  getOrganizationCampaigns,
  organizationKeys,
  updateOrganizationAssistanceStatus,
} from "../api/organizationApi";
import { formatOrgDate } from "../utils/organizationFormatters";

const ASSISTANCE_HERO_IMAGE =
  "/assets/app/organization/organization-dashboard-hero.png";

export function OrganizationAssistanceRequestsPage() {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const [status, setStatus] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);

  const params = {
    status,
    campaignId,
    take: 100,
  };

  const query = useQuery({
    queryKey: organizationKeys.assistance(params),
    queryFn: () => getOrganizationAssistanceRequests(params),
  });

  const campaigns = useQuery({
    queryKey: organizationKeys.campaigns({
      take: 100,
    }),
    queryFn: () =>
      getOrganizationCampaigns({
        take: 100,
      }),
  });

  const update = useMutation({
    mutationFn: ({ requestId, payload }) =>
      updateOrganizationAssistanceStatus(requestId, payload),

    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم تحديث طلب المساعدة وإشعار صاحبه."),
      });

      await Promise.all([
        client.invalidateQueries({
          queryKey: ["organization", "assistance"],
        }),
        client.invalidateQueries({
          queryKey: organizationKeys.dashboard,
        }),
      ]);
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const filteredRequests = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return query.data || [];
    }

    return (query.data || []).filter((request) =>
      [
        request.medicineName,
        request.scientificName,
        request.requesterFullName,
        request.requesterPhoneNumber,
        request.campaignTitle,
        request.notes,
      ].some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [query.data, search]);

  const flowSteps = [
    {
      number: "01",
      title: t("إرسال الطلب"),
      text: t("المستخدم يحدد الدواء والكمية"),
    },
    {
      number: "02",
      title: t("مراجعة المنظمة"),
      text: t("التحقق من البيانات والأولوية"),
    },
    {
      number: "03",
      title: t("التنسيق"),
      text: t("ربط الطلب بالحملة أو الجهة المناسبة"),
    },
    {
      number: "04",
      title: t("التلبية"),
      text: t("تسليم الدواء وتوثيق النتيجة"),
    },
  ];

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="min-h-[calc(100vh-164px)] space-y-5 bg-[#F4F8F8]"
    >
      {/* Hero */}
      <section className="relative h-[230px] w-full overflow-hidden rounded-[14px] bg-[#10505A] text-white sm:h-[271px] sm:rounded-[16px]">
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ${isArabic ? "" : "scale-x-[-1]"}`}
          style={{
            backgroundImage: `url("${ASSISTANCE_HERO_IMAGE}")`,
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isArabic
              ? "bg-[linear-gradient(270deg,#10505A_0%,rgba(33,100,116,.25)_70%,rgba(33,100,116,.05)_100%)]"
              : "bg-[linear-gradient(90deg,#10505A_0%,rgba(33,100,116,.25)_70%,rgba(33,100,116,.05)_100%)]"
          }`}
        />

        <div className="relative z-10 flex h-full items-center px-5 sm:px-7 lg:px-[41px]">
          <div
            className={`flex min-w-0 flex-col items-start ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <HandHeart size={22} strokeWidth={1.8} />
              </span>

              <h1 className="text-[22px] font-bold leading-tight text-white sm:text-[28px]">
                {t("طلبات المساعدة الدوائية")}
              </h1>
            </div>

            <p className="mt-4 max-w-[700px] text-sm leading-7 text-white/75">
              {t(
                "راجع تفاصيل الدواء والكمية ووقت الاحتياج، ثم حدّث حالة الطلب وأرسل ردًا واضحًا لصاحب الطلب.",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="rounded-xl border border-[#D8E6E8] bg-white p-4 sm:p-5 shadow-[0_6px_24px_rgba(23,75,87,.035)]">
        <div className={isArabic ? "text-right" : "text-left"}>
          <h2 className="font-bold text-[#29464D]">
            {t("مسار معالجة طلب المساعدة")}
          </h2>

          <p className="mt-1 text-xs leading-6 text-[#829499]">
            {t(
              "يمر الطلب بعدة مراحل واضحة حتى تتم مراجعته واتخاذ القرار المناسب.",
            )}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {flowSteps.map((step) => (
            <article
              key={step.number}
              className="rounded-xl border border-[#E0EAEC] bg-[#F8FBFB] p-4"
            >
              <span className="text-[10px] font-bold text-[#7E989E]">
                {step.number}
              </span>

              <h3 className="mt-2 text-sm font-bold text-[#36565D]">
                {step.title}
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-[#93A4A8]">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>
      {/* Notice */}
      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-bold ${
            notice.ok
              ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Filters */}
      <section className="rounded-xl bg-white p-4 sm:p-5 shadow-[0_6px_24px_rgba(23,75,87,.03)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className={isArabic ? "text-right" : "text-left"}>
            <h2 className="text-xl font-bold text-[#333333]">
              {t("الطلبات الواردة")}
            </h2>

            <p className="mt-1 text-xs text-[#A0B0B3]">
              {t("راجع الطلبات حسب الحالة والحملة")}
            </p>
          </div>

          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(240px,1fr)_180px_220px] xl:max-w-[760px]">
            <label className="flex h-11 items-center gap-2 rounded-lg border border-[#D8E6E8] bg-white px-3">
              <Search size={17} className="text-[#9BAEB2]" />

              <input
                dir={direction}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("ابحث باسم الدواء أو صاحب الطلب...")}
                aria-label={t("ابحث باسم الدواء أو صاحب الطلب...")}
                className={`min-w-0 flex-1 bg-transparent text-sm text-[#36565D] outline-none placeholder:text-[#B6C2C4] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </label>

            <SelectField
              direction={direction}
              value={status}
              onChange={setStatus}
              ariaLabel={t("حالة الطلب")}
            >
              {assistanceStatuses.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {t(item.label)}
                </option>
              ))}
            </SelectField>

            <SelectField
              direction={direction}
              value={campaignId}
              onChange={setCampaignId}
              ariaLabel={t("الحملة")}
            >
              <option value="">{t("جميع الحملات")}</option>

              {(campaigns.data || []).map((campaign) => (
                <option key={campaign.campaignId} value={campaign.campaignId}>
                  {campaign.title}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      </section>

      {/* Content */}
      {query.isLoading ? (
        <UserLoadingState label={t("جاري تحميل طلبات المساعدة...")} />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !filteredRequests.length ? (
        <UserEmptyState
          title={t("لا توجد طلبات مطابقة")}
          description={t(
            "ستظهر هنا طلبات المساعدة الموجهة إلى المنظمة أو حملاتها.",
          )}
        />
      ) : (
        <section
          className={`grid gap-4 xl:grid-cols-2 ${
            query.isFetching ? "opacity-60" : ""
          }`}
        >
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.requestId}
              request={request}
              pending={update.isPending}
              direction={direction}
              currentLanguage={currentLanguage}
              t={t}
              onUpdate={(payload) => {
                setNotice(null);

                update.mutate({
                  requestId: request.requestId,
                  payload,
                });
              }}
            />
          ))}
        </section>
      )}
    </div>
  );
}
function SelectField({
  value,
  onChange,
  ariaLabel,
  children,
  direction = "rtl",
}) {
  return (
    <div dir={direction} className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-[#D8E6E8] bg-[#F8FBFB] pe-10 ps-3 text-sm font-medium text-[#47666D] outline-none transition hover:border-[#9ABCC1] focus:border-[#216474] focus:bg-white"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#6D888E]"
      />
    </div>
  );
}

function RequestCard({
  request,
  pending,
  onUpdate,
  t,
  direction,
  currentLanguage,
}) {
  const isArabic = currentLanguage === "ar";

  const [nextStatus, setNextStatus] = useState(
    request.status === "UnderReview" ? "Fulfilled" : "UnderReview",
  );

  const [note, setNote] = useState(request.responseNote || "");

  const status = getStatusMeta(request.status, "assistance");

  const actionable = !["Cancelled", "Fulfilled", "Rejected"].includes(
    request.status,
  );

  const numberLocale =
    currentLanguage === "ar"
      ? "ar-SY"
      : currentLanguage === "tr"
        ? "tr-TR"
        : "en-US";

  return (
    <article
      dir={direction}
      className="overflow-hidden rounded-xl border border-[#DCE8EA] bg-white shadow-[0_8px_28px_rgba(23,75,87,.04)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#E8EFF0] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E6F3F6] text-[#216474]">
            <HandHeart size={18} />
          </span>

          <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
            <h3 className="truncate text-base font-bold text-[#29464D]">
              {request.medicineName}
            </h3>

            <p className="mt-1 truncate text-[11px] text-[#93A4A8]">
              {request.scientificName || t("الاسم العلمي غير محدد")}
            </p>
          </div>
        </div>

        <StatusBadge label={t(status.label)} status={request.status} />
      </div>

      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            icon={UserRound}
            label={t("صاحب الطلب")}
            value={request.requesterFullName || t("غير مسجل")}
            direction={direction}
          />

          <InfoCard
            icon={Phone}
            label={t("الهاتف")}
            value={request.requesterPhoneNumber || t("غير مسجل")}
            direction={direction}
          />

          <InfoCard
            icon={Package}
            label={t("الكمية المطلوبة")}
            value={t("{{count}} عبوة", {
              count:
                request.requestedPackageCount?.toLocaleString(numberLocale) ??
                "0",
            })}
            direction={direction}
          />

          <InfoCard
            icon={CalendarClock}
            label={t("مطلوب قبل")}
            value={formatOrgDate(request.neededBeforeUtc)}
            direction={direction}
          />

          {request.campaignTitle && (
            <InfoCard
              icon={Pill}
              label={t("الحملة")}
              value={request.campaignTitle}
              direction={direction}
            />
          )}
        </div>

        {request.notes && (
          <MessageBox
            title={t("ملاحظة صاحب الطلب")}
            text={request.notes}
            direction={direction}
          />
        )}
        {actionable ? (
          <div className="mt-5 border-t border-[#E7EFF0] pt-5">
            <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
              <SelectField
                direction={direction}
                value={nextStatus}
                onChange={setNextStatus}
                ariaLabel={t("تحديث حالة الطلب")}
              >
                <option value="UnderReview">{t("بدء المراجعة")}</option>

                <option value="Fulfilled">{t("تمت تلبية الطلب")}</option>

                <option value="Rejected">{t("تعذر تلبية الطلب")}</option>
              </SelectField>

              <input
                dir={direction}
                maxLength={1000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("رد لصاحب الطلب (اختياري)")}
                aria-label={t("رد لصاحب الطلب (اختياري)")}
                className={`h-11 w-full rounded-lg border border-[#D8E6E8] bg-white px-4 text-sm text-[#36565D] outline-none transition placeholder:text-[#B6C2C4] hover:border-[#9ABCC1] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onUpdate({
                  status: nextStatus,
                  responseNote: note.trim() || null,
                })
              }
              disabled={pending}
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-lg bg-[#174B57] px-5 text-sm font-bold text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {pending ? t("جاري الحفظ...") : t("حفظ التحديث")}
            </button>
          </div>
        ) : (
          request.responseNote && (
            <MessageBox
              title={t("الرد المرسل")}
              text={request.responseNote}
              direction={direction}
              accent
            />
          )
        )}

        <p className="mt-4 flex items-center gap-1 border-t border-[#E7EFF0] pt-3 text-[11px] text-[#9AABAD]">
          <Check size={13} />

          <span>
            {t("وصل في")} {formatOrgDate(request.createdAtUtc)}
          </span>
        </p>
      </div>
    </article>
  );
}

function StatusBadge({ label, status }) {
  const styles = {
    Pending: "border-[#D5E3E6] bg-[#F2F6F7] text-[#60777D]",

    UnderReview: "border-[#C9E0E5] bg-[#E6F3F6] text-[#216474]",

    Fulfilled: "border-[#BFD9DE] bg-[#EAF4F3] text-[#174B57]",

    Rejected: "border-[#F1D4D7] bg-[#FFF1F2] text-[#C34A57]",

    Cancelled: "border-[#DCE4E6] bg-[#F4F7F8] text-[#72868B]",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
        styles[status] || "border-[#D5E3E6] bg-[#F2F6F7] text-[#60777D]"
      }`}
    >
      {label}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value, direction = "rtl" }) {
  return (
    <div
      dir={direction}
      className="flex min-h-[64px] items-center gap-3 rounded-xl border border-[#E2EBED] bg-[#FAFCFC] px-4 py-3"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EAF4F3] text-[#216474]">
        <Icon size={16} />
      </span>

      <div className="min-w-0">
        <span className="block text-[10px] font-medium text-[#93A4A8]">
          {label}
        </span>

        <strong className="mt-1 block truncate text-xs font-bold text-[#36565D]">
          {value || "—"}
        </strong>
      </div>
    </div>
  );
}

function MessageBox({ title, text, accent = false, direction = "rtl" }) {
  return (
    <div
      dir={direction}
      className={`mt-4 rounded-xl border p-4 ${
        accent
          ? "border-[#CFE0E3] bg-[#EAF4F3]"
          : "border-[#E1E9EB] bg-[#FAFCFC]"
      }`}
    >
      <p
        className={`text-[10px] font-bold ${
          accent ? "text-[#216474]" : "text-[#71858A]"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-xs leading-6 text-[#536D73]">{text}</p>
    </div>
  );
}
