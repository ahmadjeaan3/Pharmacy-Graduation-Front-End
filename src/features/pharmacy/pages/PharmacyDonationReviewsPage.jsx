import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Gift,
  PackageCheck,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { apiClient } from "../../../shared/api/client";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../shared/components/AsyncStates";
import { PharmacyPageHeader } from "../components/PharmacyPageHeader";

const pharmacyDonationKeys = {
  offers: ["pharmacy", "donations", "offers"],
};

const getOffers = async () =>
  (
    await apiClient.get("/pharmacy/donations/offers", {
      params: { take: 100 },
    })
  ).data;

const reviewOffer = async ({ offerId, status, reviewNote }) =>
  (
    await apiClient.put(`/pharmacy/donations/offers/${offerId}/review`, {
      status,
      reviewNote: reviewNote || null,
    })
  ).data;

const statusMeta = {
  PendingPharmacyReview: {
    label: "بانتظار الفحص",
    tone: "bg-amber-50 text-amber-700",
  },
  PharmacyApproved: {
    label: "مقبول — بانتظار التسليم",
    tone: "bg-sky-50 text-sky-700",
  },
  PharmacyRejected: {
    label: "مرفوض من الصيدلية",
    tone: "bg-rose-50 text-rose-700",
  },
  ReceivedByPharmacy: {
    label: "مستلم وموثّق",
    tone: "bg-emerald-50 text-emerald-700",
  },
};

const localeMap = {
  ar: "ar-SY",
  en: "en-US",
  tr: "tr-TR",
};

const normalizeLanguage = (language = "ar") =>
  String(language).split("-")[0].toLowerCase();

const resolveLocale = (language = "ar") =>
  localeMap[normalizeLanguage(language)] || localeMap.ar;

export function PharmacyDonationReviewsPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const client = useQueryClient();
  const [notice, setNotice] = useState(null);

  const query = useQuery({
    queryKey: pharmacyDonationKeys.offers,
    queryFn: getOffers,
  });

  const mutation = useMutation({
    mutationFn: reviewOffer,
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم حفظ قرار الصيدلية وإرسال الإشعارات اللازمة."),
      });

      await client.invalidateQueries({
        queryKey: pharmacyDonationKeys.offers,
      });
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  return (
    <div dir={direction} lang={currentLanguage} className="space-y-6">
      <PharmacyPageHeader
        eyebrow={t("شبكة تبرع آمنة")}
        title={t("التحقق من التبرعات الدوائية")}
        description={t(
          "استلم الدواء من المتبرع، افحص سلامة العبوة والصلاحية، ثم وثّق الاستلام ليظهر العرض للجمعية المستفيدة.",
        )}
        actions={null}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Step
          icon={Gift}
          number="1"
          title={t("تواصل واستلام")}
          text={t(
            "تتواصل الصيدلية مع المتبرع وتستلم الدواء فقط داخل مسار موثق.",
          )}
          isArabic={isArabic}
          t={t}
        />

        <Step
          icon={ShieldCheck}
          number="2"
          title={t("فحص مهني")}
          text={t("تأكد من الإغلاق، الصلاحية، التخزين وسلامة العبوة.")}
          isArabic={isArabic}
          t={t}
        />

        <Step
          icon={PackageCheck}
          number="3"
          title={t("تحويل للجمعية")}
          text={t(
            "بعد توثيق الاستلام يظهر العرض للجمعية لتقرر القبول والتوزيع.",
          )}
          isArabic={isArabic}
          t={t}
        />
      </section>

      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${
            notice.ok
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-rose-100 bg-rose-50 text-rose-700"
          } ${isArabic ? "text-right" : "text-left"}`}
        >
          {notice.text}
        </div>
      )}

      {query.isLoading ? (
        <LoadingState label={t("جاري تحميل عروض التبرع...")} />
      ) : query.isError ? (
        <ErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !query.data?.length ? (
        <EmptyState
          title={t("لا توجد عروض بانتظار الصيدلية")}
          description={t(
            "عندما يختار مستخدم صيدليتك للتحقق من تبرعه سيظهر العرض هنا.",
          )}
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {query.data.map((offer) => (
            <OfferCard
              key={offer.offerId}
              offer={offer}
              pending={mutation.isPending}
              onReview={(status, reviewNote) => {
                setNotice(null);

                mutation.mutate({
                  offerId: offer.offerId,
                  status,
                  reviewNote,
                });
              }}
              t={t}
              currentLanguage={currentLanguage}
              isArabic={isArabic}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function Step({ icon: Icon, number, title, text, isArabic, t }) {
  return (
    <article className="rounded-2xl border border-[#174b57]/8 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
          <Icon size={19} />
        </span>

        <span className="text-xs font-black text-[#216474]">
          {t("الخطوة")} {number}
        </span>
      </div>

      <h3
        className={`mt-3 font-black text-[#29464d] ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1 text-xs leading-6 text-[#71858a] ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {text}
      </p>
    </article>
  );
}

function OfferCard({ offer, pending, onReview, t, currentLanguage, isArabic }) {
  const [note, setNote] = useState(offer.pharmacyReviewNote || "");

  const meta =
    statusMeta[offer.pharmacyReviewStatus] || statusMeta.PendingPharmacyReview;

  const waiting = offer.pharmacyReviewStatus === "PendingPharmacyReview";

  const accepted = offer.pharmacyReviewStatus === "PharmacyApproved";

  const formattedExpiry = offer.expiryDateUtc
    ? new Intl.DateTimeFormat(resolveLocale(currentLanguage), {
        dateStyle: "medium",
      }).format(new Date(offer.expiryDateUtc))
    : t("غير محددة");

  return (
    <article className="rounded-[1.45rem] border border-[#174b57]/8 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={isArabic ? "text-right" : "text-left"}>
          <p className="text-xs font-bold text-[#216474]">
            {offer.targetOrganizationName}
          </p>

          <h2 className="mt-1 text-lg font-black text-[#29464d]">
            {offer.medicineName}
          </h2>

          <p className="mt-1 text-xs text-[#829499]">
            {offer.scientificName || t("الاسم العلمي غير محدد")}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${meta.tone}`}
        >
          {t(meta.label)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-[#f8fbfa] p-4 text-xs sm:grid-cols-2">
        <Detail
          icon={Gift}
          label={t("المتبرع")}
          value={offer.donorFullName || t("مستخدم المنصة")}
          isArabic={isArabic}
        />

        <Detail
          icon={Phone}
          label={t("الهاتف")}
          value={offer.donorPhoneNumber || t("غير مسجل")}
          isArabic={isArabic}
          ltr
        />

        <Detail
          icon={PackageCheck}
          label={t("عدد العبوات")}
          value={offer.packageCount}
          isArabic={isArabic}
        />

        <Detail
          icon={Clock3}
          label={t("الصلاحية")}
          value={formattedExpiry}
          isArabic={isArabic}
        />
      </div>

      {offer.notes && (
        <p
          className={`mt-3 rounded-xl border border-[#174b57]/8 p-3 text-xs leading-6 text-[#71858a] ${
            isArabic ? "text-right" : "text-left"
          }`}
        >
          {offer.notes}
        </p>
      )}

      {(waiting || accepted) && (
        <div className="mt-4 border-t border-[#174b57]/8 pt-4">
          <label>
            <span
              className={`form-label block ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              {t("ملاحظة التحقق أو سبب الرفض")}
            </span>

            <textarea
              dir={isArabic ? "rtl" : "ltr"}
              className={`form-textarea min-h-20 ${
                isArabic ? "text-right" : "text-left"
              }`}
              value={note}
              maxLength={1000}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("دوّن نتيجة فحص العبوة والصلاحية وحالة التخزين")}
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {waiting && (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={pending}
                  onClick={() => onReview("PharmacyApproved", note.trim())}
                >
                  <CheckCircle2 size={16} />
                  {t("قبول مبدئي وتحديد التسليم")}
                </button>

                <button
                  type="button"
                  className="btn-secondary text-rose-700"
                  disabled={pending}
                  onClick={() => onReview("PharmacyRejected", note.trim())}
                >
                  <XCircle size={16} />
                  {t("رفض بعد الفحص")}
                </button>
              </>
            )}

            {accepted && (
              <button
                type="button"
                className="btn-primary"
                disabled={pending}
                onClick={() => onReview("ReceivedByPharmacy", note.trim())}
              >
                <PackageCheck size={16} />
                {t("تأكيد الاستلام والتوثيق")}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function Detail({ icon: Icon, label, value, isArabic, ltr = false }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-[#6f888d]" />

      <span className="text-[#829499]">{label}</span>

      <strong
        dir={ltr ? "ltr" : undefined}
        className={`ms-auto text-[#29464d] ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {value}
      </strong>
    </div>
  );
}
