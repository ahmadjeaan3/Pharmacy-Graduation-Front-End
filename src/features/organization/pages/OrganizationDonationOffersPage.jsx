import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Gift,
  Package,
  Phone,
  Pill,
  Save,
  Search,
  ShieldCheck,
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
  getStatusMeta,
  offerStatuses,
} from "../../donations/utils/donationFormatters";
import {
  getOrganizationCampaigns,
  getOrganizationDonationOffers,
  organizationKeys,
  reviewOrganizationDonationOffer,
} from "../api/organizationApi";
import { formatOrgDate } from "../utils/organizationFormatters";

const OFFERS_HERO_IMAGE =
  "/assets/app/organization/organization-dashboard-hero.png";

export function OrganizationDonationOffersPage() {
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
    queryKey: organizationKeys.offers(params),
    queryFn: () => getOrganizationDonationOffers(params),
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

  const review = useMutation({
    mutationFn: ({ offerId, payload }) =>
      reviewOrganizationDonationOffer(offerId, payload),

    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم تحديث عرض التبرع وإشعار المتبرع."),
      });

      await Promise.all([
        client.invalidateQueries({
          queryKey: ["organization", "offers"],
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

  const filteredOffers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return query.data || [];
    }

    return (query.data || []).filter((offer) =>
      [
        offer.medicineName,
        offer.scientificName,
        offer.donorFullName,
        offer.donorPhoneNumber,
        offer.reviewingPharmacyName,
        offer.campaignTitle,
      ].some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [query.data, search]);

  const flowSteps = [
    {
      number: "01",
      title: t("المتبرع"),
      text: t("إرسال عرض التبرع"),
    },
    {
      number: "02",
      title: t("الصيدلية"),
      text: t("فحص العبوة والصلاحية"),
    },
    {
      number: "03",
      title: t("المنظمة"),
      text: t("المراجعة واتخاذ القرار"),
    },
    {
      number: "04",
      title: t("الاستلام"),
      text: t("التوثيق والتوزيع"),
    },
  ];

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="min-h-[calc(100vh-164px)] space-y-5 bg-[#F4F8F8]"
    >
      {/* Hero */}
      <section className="relative h-[208px] overflow-hidden rounded-xl bg-[#0d5360] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${OFFERS_HERO_IMAGE}")`,
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isArabic
              ? "bg-[linear-gradient(270deg,rgba(8,78,89,.96)_0%,rgba(8,78,89,.76)_48%,rgba(8,78,89,.22)_100%)]"
              : "bg-[linear-gradient(90deg,rgba(8,78,89,.96)_0%,rgba(8,78,89,.76)_48%,rgba(8,78,89,.22)_100%)]"
          }`}
        />

        <div className="relative z-10 flex h-full items-center justify-between px-8">
          <div
            className={`flex min-w-0 flex-col items-start ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <Gift size={22} strokeWidth={1.8} />
              </span>

              <h1 className="text-[28px] font-bold leading-none text-white">
                {t("عروض التبرع الدوائي")}
              </h1>
            </div>

            <p className="mt-4 max-w-[700px] text-sm leading-7 text-white/75">
              {t(
                "راجع تفاصيل الأدوية وحالة العبوات وتحقق الصيدلية، ثم اتخذ القرار المناسب وأرسل ملاحظة واضحة للمتبرع.",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="rounded-xl border border-[#D8E6E8] bg-white p-5 shadow-[0_6px_24px_rgba(23,75,87,.035)]">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E6F3F6] text-[#216474]">
            <ShieldCheck size={19} />
          </span>

          <div className={isArabic ? "text-right" : "text-left"}>
            <h2 className="font-bold text-[#29464D]">
              {t("مسار التحقق والاستلام")}
            </h2>

            <p className="mt-1 text-xs leading-6 text-[#829499]">
              {t(
                "تمر التبرعات بمراحل واضحة قبل اعتمادها وتوزيعها لضمان السلامة وسهولة التتبع.",
              )}
            </p>
          </div>
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
      <section className="rounded-xl bg-white p-5 shadow-[0_6px_24px_rgba(23,75,87,.03)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className={isArabic ? "text-right" : "text-left"}>
            <h2 className="text-xl font-bold text-[#333333]">
              {t("العروض الواردة")}
            </h2>

            <p className="mt-1 text-xs text-[#A0B0B3]">
              {t("راجع العروض حسب الحالة والحملة")}
            </p>
          </div>

          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(240px,1fr)_180px_220px] xl:max-w-[760px]">
            <label className="flex h-11 items-center gap-2 rounded-lg border border-[#D8E6E8] bg-white px-3">
              <Search size={17} className="text-[#9BAEB2]" />

              <input
                dir={direction}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("ابحث باسم الدواء أو المتبرع...")}
                aria-label={t("ابحث باسم الدواء أو المتبرع...")}
                className={`min-w-0 flex-1 bg-transparent text-sm text-[#36565D] outline-none placeholder:text-[#B6C2C4] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </label>

            <SelectField
              direction={direction}
              value={status}
              onChange={setStatus}
              ariaLabel={t("حالة العرض")}
            >
              {offerStatuses.map((item) => (
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
        <UserLoadingState label={t("جاري تحميل عروض التبرع...")} />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !filteredOffers.length ? (
        <UserEmptyState
          title={t("لا توجد عروض مطابقة")}
          description={t(
            "ستظهر هنا عروض التبرع الموجهة إلى المنظمة أو حملاتها.",
          )}
        />
      ) : (
        <section
          className={`grid gap-4 xl:grid-cols-2 ${
            query.isFetching ? "opacity-60" : ""
          }`}
        >
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.offerId}
              offer={offer}
              pending={review.isPending}
              direction={direction}
              currentLanguage={currentLanguage}
              t={t}
              onReview={(payload) => {
                setNotice(null);

                review.mutate({
                  offerId: offer.offerId,
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

function OfferCard({
  offer,
  pending,
  onReview,
  t,
  direction,
  currentLanguage,
}) {
  const isArabic = currentLanguage === "ar";

  const [nextStatus, setNextStatus] = useState(
    offer.status === "Approved" ? "Received" : "Approved",
  );

  const [note, setNote] = useState(offer.reviewNote || "");

  const status = getStatusMeta(offer.status, "offer");

  const actionable = !["Cancelled", "Rejected", "Received"].includes(
    offer.status,
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
            <Gift size={18} />
          </span>

          <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
            <h3 className="truncate text-base font-bold text-[#29464D]">
              {offer.medicineName}
            </h3>

            <p className="mt-1 truncate text-[11px] text-[#93A4A8]">
              {offer.scientificName || t("الاسم العلمي غير محدد")}
            </p>
          </div>
        </div>

        <StatusBadge label={t(status.label)} status={offer.status} />
      </div>

      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            icon={UserRound}
            label={t("المتبرع")}
            value={offer.donorFullName || t("غير مسجل")}
            direction={direction}
          />

          <InfoCard
            icon={Phone}
            label={t("الهاتف")}
            value={offer.donorPhoneNumber || t("غير مسجل")}
            direction={direction}
          />

          <InfoCard
            icon={Package}
            label={t("عدد العبوات")}
            value={t("{{count}} عبوة", {
              count: offer.packageCount?.toLocaleString(numberLocale) ?? "0",
            })}
            direction={direction}
          />

          <InfoCard
            icon={CalendarDays}
            label={t("تاريخ الصلاحية")}
            value={formatOrgDate(offer.expiryDateUtc)}
            direction={direction}
          />

          <InfoCard
            icon={Building2}
            label={t("صيدلية التحقق")}
            value={offer.reviewingPharmacyName || t("غير محددة")}
            direction={direction}
          />

          <InfoCard
            icon={ShieldCheck}
            label={t("توثيق الصيدلية")}
            value={
              offer.pharmacyReviewStatus === "ReceivedByPharmacy"
                ? t("تم الاستلام والتحقق")
                : t("بانتظار التحقق")
            }
            direction={direction}
          />

          {offer.campaignTitle && (
            <InfoCard
              icon={Pill}
              label={t("الحملة")}
              value={offer.campaignTitle}
              direction={direction}
            />
          )}
        </div>

        {offer.notes && (
          <MessageBox
            title={t("ملاحظة المتبرع")}
            text={offer.notes}
            direction={direction}
          />
        )}

        {offer.pharmacyReviewNote && (
          <MessageBox
            title={t("ملاحظة صيدلية التحقق")}
            text={offer.pharmacyReviewNote}
            direction={direction}
            accent
          />
        )}
        {actionable ? (
          <div className="mt-5 border-t border-[#E7EFF0] pt-5">
            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <SelectField
                direction={direction}
                value={nextStatus}
                onChange={setNextStatus}
                ariaLabel={t("قرار المراجعة")}
              >
                <option value="Approved">{t("قبول العرض")}</option>

                <option value="Received">{t("تأكيد الاستلام")}</option>

                <option value="Rejected">{t("رفض العرض")}</option>
              </SelectField>

              <input
                dir={direction}
                maxLength={1000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("ملاحظة للمتبرع (اختيارية)")}
                aria-label={t("ملاحظة للمتبرع (اختيارية)")}
                className={`h-11 w-full rounded-lg border border-[#D8E6E8] bg-white px-4 text-sm text-[#36565D] outline-none transition placeholder:text-[#B6C2C4] hover:border-[#9ABCC1] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onReview({
                  status: nextStatus,
                  reviewNote: note.trim() || null,
                })
              }
              disabled={pending}
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-lg bg-[#174B57] px-5 text-sm font-bold text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {pending ? t("جاري الحفظ...") : t("حفظ القرار")}
            </button>
          </div>
        ) : (
          offer.reviewNote && (
            <MessageBox
              title={t("الرد المرسل")}
              text={offer.reviewNote}
              direction={direction}
            />
          )
        )}

        <p className="mt-4 flex items-center gap-1 border-t border-[#E7EFF0] pt-3 text-[11px] text-[#9AABAD]">
          <Check size={13} />

          <span>
            {t("وصل في")} {formatOrgDate(offer.createdAtUtc)}
          </span>
        </p>
      </div>
    </article>
  );
}

function StatusBadge({ label, status }) {
  const styles = {
    Pending: "border-[#D5E3E6] bg-[#F2F6F7] text-[#60777D]",
    Approved: "border-[#C9E0E5] bg-[#E6F3F6] text-[#216474]",
    Received: "border-[#BFD9DE] bg-[#EAF4F3] text-[#174B57]",
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
