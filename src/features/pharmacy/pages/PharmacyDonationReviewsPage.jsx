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

/* =========================================================
   HERO
========================================================= */

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

/* =========================================================
   QUERY KEYS
========================================================= */

const pharmacyDonationKeys = {
  offers: ["pharmacy", "donations", "offers"],
};

/* =========================================================
   API
========================================================= */

const getOffers = async () =>
  (
    await apiClient.get("/pharmacy/donations/offers", {
      params: {
        take: 100,
      },
    })
  ).data;

const reviewOffer = async ({
  offerId,
  status,
  reviewNote,
}) =>
  (
    await apiClient.put(
      `/pharmacy/donations/offers/${offerId}/review`,
      {
        status,
        reviewNote: reviewNote || null,
      },
    )
  ).data;

/* =========================================================
   STATUS
========================================================= */

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

/* =========================================================
   LOCALE
========================================================= */

const localeMap = {
  ar: "ar-SY-u-nu-latn",
  en: "en-US",
  tr: "tr-TR",
};

const normalizeLanguage = (language = "ar") =>
  String(language)
    .split("-")[0]
    .toLowerCase();

const resolveLocale = (language = "ar") =>
  localeMap[normalizeLanguage(language)] || localeMap.ar;

/* =========================================================
   PAGE
========================================================= */

export function PharmacyDonationReviewsPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage ||
      i18n.language ||
      "ar",
  );

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const client = useQueryClient();

  const [notice, setNotice] = useState(null);

  /* =======================================================
     OFFERS
  ======================================================= */

  const query = useQuery({
    queryKey: pharmacyDonationKeys.offers,
    queryFn: getOffers,
  });

  /* =======================================================
     REVIEW
  ======================================================= */

  const mutation = useMutation({
    mutationFn: reviewOffer,

    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t(
          "تم حفظ قرار الصيدلية وإرسال الإشعارات اللازمة.",
        ),
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
    <div
      dir={direction}
      lang={currentLanguage}
      className="w-full min-w-0 space-y-5 overflow-x-hidden sm:space-y-6"
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <DonationHero
        t={t}
        isArabic={isArabic}
      />

      {/* =====================================================
          STEPS
      ===================================================== */}

      <section className="grid min-w-0 gap-3 sm:grid-cols-3">
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
          text={t(
            "تأكد من الإغلاق، الصلاحية، التخزين وسلامة العبوة.",
          )}
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

      {/* =====================================================
          NOTICE
      ===================================================== */}

      {notice && (
        <div
          className={`
            w-full
            rounded-2xl
            border
            p-4
            text-sm
            font-bold
            ${
              notice.ok
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }
            ${isArabic ? "text-right" : "text-left"}
          `}
        >
          {notice.text}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {query.isLoading ? (
        <LoadingState
          label={t("جاري تحميل عروض التبرع...")}
        />
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
        /* ===================================================
           OFFERS
        =================================================== */

        <section className="grid min-w-0 gap-4 xl:grid-cols-2">
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

/* =========================================================
   DONATION HERO
   RESPONSIVE
========================================================= */

function DonationHero({ t, isArabic }) {
  return (
    <section
      className="
        relative
        isolate
        min-h-[140px]
        w-full
        overflow-hidden
        rounded-[14px]
        bg-[#10505A]
        text-white
        shadow-[0_22px_55px_rgba(23,75,87,.16)]
        sm:min-h-[180px]
        lg:min-h-[250px]
      "
    >
      {/* ===================================================
          BACKGROUND IMAGE
          تظهر فقط على الشاشات الكبيرة
      =================================================== */}

      <img
        src={PHARMACY_HERO_IMAGE}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`
          absolute
          inset-0
          hidden
          h-full
          w-full
          select-none
          object-cover
          object-[center_38%]
          lg:block
          ${isArabic ? "scale-x-[-1]" : ""}
        `}
      />

      {/* ===================================================
          OVERLAY
          يظهر فقط على الشاشات الكبيرة
      =================================================== */}

      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background: isArabic
            ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.96) 38%,rgba(33,100,116,.78) 70%,rgba(33,100,116,.58) 100%)"
            : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.96) 38%,rgba(33,100,116,.78) 70%,rgba(33,100,116,.58) 100%)",
        }}
      />

      {/* ===================================================
          DECORATIVE CIRCLE
          يظهر فقط على الشاشات الكبيرة
      =================================================== */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -top-20
          hidden
          size-64
          rounded-full
          border-[40px]
          border-white/[.04]
          lg:block
          ${isArabic ? "-left-14" : "-right-14"}
        `}
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[140px]
          w-full
          items-center
          px-5
          py-5
          sm:min-h-[180px]
          sm:px-7
          lg:min-h-[250px]
          lg:px-10
          lg:py-7
        "
      >
        {/* =================================================
            TITLE
        ================================================= */}

        <div
          className={`
            flex
            min-w-0
            w-full
            items-center
            gap-4
            sm:gap-5
            lg:max-w-[690px]
            ${isArabic ? "ml-auto" : "mr-auto"}
            ${isArabic ? "text-right" : "text-left"}
          `}
        >
          <span
            className="
              grid
              size-10
              shrink-0
              place-items-center
              rounded-lg
              bg-[rgba(230,243,246,.10)]
              text-[#E6F3F6]
              backdrop-blur-sm
              sm:size-12
            "
          >
            <Gift
              size={24}
              strokeWidth={1.7}
              className="sm:hidden"
            />

            <Gift
              size={28}
              strokeWidth={1.7}
              className="hidden sm:block"
            />
          </span>

          <div className="min-w-0 flex-1">
            <p
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-bold
                text-[#BFE8E7]
                sm:text-[12px]
              "
            >
              <ShieldCheck size={14} />

              {t("شبكة تبرع آمنة")}
            </p>

            <h1
              className="
                mt-1
                text-[21px]
                font-medium
                leading-[1.25]
                text-white
                sm:mt-2
                sm:text-[26px]
                lg:text-[28px]
              "
            >
              {t("التحقق من التبرعات الدوائية")}
            </h1>

            <p
              className="
                mt-2
                max-w-[560px]
                text-[11px]
                leading-5
                text-[#D6D6D6]
                sm:mt-3
                sm:text-[13px]
                sm:leading-6
                lg:text-[14px]
                lg:leading-7
              "
            >
              {t(
                "استلم الدواء من المتبرع، افحص سلامة العبوة والصلاحية، ثم وثّق الاستلام ليظهر العرض للجمعية المستفيدة.",
              )}
            </p>
          </div>
        </div>

        {/* =================================================
            SERVICE STATUS
            يظهر فقط على الشاشات الكبيرة
        ================================================= */}

        <div
          className="
            hidden
            shrink-0
            items-center
            gap-3
            rounded-[14px]
            border
            border-white/15
            bg-[rgba(2,77,82,.58)]
            px-4
            py-3.5
            backdrop-blur-[10px]
            lg:flex
            lg:min-w-[190px]
          "
        >
          <span
            className="
              grid
              size-11
              shrink-0
              place-items-center
              rounded-xl
              bg-[rgba(230,243,246,.10)]
              text-[#E6F3F6]
            "
          >
            <PackageCheck
              size={21}
              strokeWidth={1.8}
            />
          </span>

          <div className="min-w-0">
            <p className="text-xs text-[#D6D6D6]">
              {t("حالة الخدمة")}
            </p>

            <strong
              className="
                mt-1
                block
                truncate
                text-lg
                font-black
                text-[#E6F3F6]
              "
            >
              {t("مراجعة التبرعات")}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   STEP
========================================================= */

function Step({
  icon: Icon,
  number,
  title,
  text,
  isArabic,
  t,
}) {
  return (
    <article
      className="
        min-w-0
        rounded-2xl
        border
        border-[#174b57]/8
        bg-white
        p-4
        sm:p-5
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="
            grid
            size-10
            shrink-0
            place-items-center
            rounded-xl
            bg-[#eaf4f3]
            text-[#216474]
          "
        >
          <Icon size={19} />
        </span>

        <span className="text-xs font-black text-[#216474]">
          {t("الخطوة")} {number}
        </span>
      </div>

      <h3
        className={`
          mt-3
          font-black
          text-[#29464d]
          ${isArabic ? "text-right" : "text-left"}
        `}
      >
        {title}
      </h3>

      <p
        className={`
          mt-1
          text-xs
          leading-6
          text-[#71858a]
          ${isArabic ? "text-right" : "text-left"}
        `}
      >
        {text}
      </p>
    </article>
  );
}

/* =========================================================
   OFFER CARD
========================================================= */

function OfferCard({
  offer,
  pending,
  onReview,
  t,
  currentLanguage,
  isArabic,
}) {
  const [note, setNote] = useState(
    offer.pharmacyReviewNote || "",
  );

  const meta =
    statusMeta[offer.pharmacyReviewStatus] ||
    statusMeta.PendingPharmacyReview;

  const waiting =
    offer.pharmacyReviewStatus ===
    "PendingPharmacyReview";

  const accepted =
    offer.pharmacyReviewStatus ===
    "PharmacyApproved";

  const formattedExpiry = offer.expiryDateUtc
    ? new Intl.DateTimeFormat(
        resolveLocale(currentLanguage),
        {
          dateStyle: "medium",
        },
      ).format(new Date(offer.expiryDateUtc))
    : t("غير محددة");

  return (
    <article
      className="
        min-w-0
        overflow-hidden
        rounded-[1.45rem]
        border
        border-[#174b57]/8
        bg-white
        p-4
        sm:p-5
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-col
          gap-3
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div
          className={`
            min-w-0
            flex-1
            ${isArabic ? "text-right" : "text-left"}
          `}
        >
          <p className="truncate text-xs font-bold text-[#216474]">
            {offer.targetOrganizationName}
          </p>

          <h2 className="mt-1 break-words text-lg font-black text-[#29464d]">
            {offer.medicineName}
          </h2>

          <p className="mt-1 break-words text-xs text-[#829499]">
            {offer.scientificName ||
              t("الاسم العلمي غير محدد")}
          </p>
        </div>

        <span
          className={`
            w-fit
            max-w-full
            shrink-0
            rounded-full
            px-3
            py-1.5
            text-[11px]
            font-black
            ${meta.tone}
          `}
        >
          {t(meta.label)}
        </span>
      </div>

      {/* ===================================================
          DETAILS
      =================================================== */}

      <div
        className="
          mt-4
          grid
          min-w-0
          gap-2
          rounded-2xl
          bg-[#f8fbfa]
          p-3
          text-xs
          sm:grid-cols-2
          sm:p-4
        "
      >
        <Detail
          icon={Gift}
          label={t("المتبرع")}
          value={
            offer.donorFullName ||
            t("مستخدم المنصة")
          }
          isArabic={isArabic}
        />

        <Detail
          icon={Phone}
          label={t("الهاتف")}
          value={
            offer.donorPhoneNumber ||
            t("غير مسجل")
          }
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

      {/* ===================================================
          DONOR NOTES
      =================================================== */}

      {offer.notes && (
        <p
          className={`
            mt-3
            break-words
            rounded-xl
            border
            border-[#174b57]/8
            p-3
            text-xs
            leading-6
            text-[#71858a]
            ${isArabic ? "text-right" : "text-left"}
          `}
        >
          {offer.notes}
        </p>
      )}

      {/* ===================================================
          REVIEW
      =================================================== */}

      {(waiting || accepted) && (
        <div
          className="
            mt-4
            border-t
            border-[#174b57]/8
            pt-4
          "
        >
          <label>
            <span
              className={`
                form-label
                block
                ${isArabic ? "text-right" : "text-left"}
              `}
            >
              {t("ملاحظة التحقق أو سبب الرفض")}
            </span>

            <textarea
              dir={isArabic ? "rtl" : "ltr"}
              className={`
                form-textarea
                min-h-20
                w-full
                max-w-full
                resize-y
                ${isArabic ? "text-right" : "text-left"}
              `}
              value={note}
              maxLength={1000}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder={t(
                "دوّن نتيجة فحص العبوة والصلاحية وحالة التخزين",
              )}
            />
          </label>

          <div
            className="
              mt-3
              flex
              w-full
              flex-col
              gap-2
              sm:flex-row
              sm:flex-wrap
              sm:justify-start
            "
          >
            {/* =================================================
                APPROVE
            ================================================= */}

            {waiting && (
              <>
                <button
                  type="button"
                  className="
                    btn-primary
                    w-full
                    justify-center
                    sm:w-auto
                  "
                  disabled={pending}
                  onClick={() =>
                    onReview(
                      "PharmacyApproved",
                      note.trim(),
                    )
                  }
                >
                  <CheckCircle2 size={16} />

                  {t(
                    "قبول مبدئي وتحديد التسليم",
                  )}
                </button>

                {/* =================================================
                    REJECT
                ================================================= */}

                <button
                  type="button"
                  className="
                    btn-secondary
                    w-full
                    justify-center
                    text-rose-700
                    sm:w-auto
                  "
                  disabled={pending}
                  onClick={() =>
                    onReview(
                      "PharmacyRejected",
                      note.trim(),
                    )
                  }
                >
                  <XCircle size={16} />

                  {t("رفض بعد الفحص")}
                </button>
              </>
            )}

            {/* =================================================
                RECEIVE
            ================================================= */}

            {accepted && (
              <button
                type="button"
                className="
                  btn-primary
                  w-full
                  justify-center
                  sm:w-auto
                "
                disabled={pending}
                onClick={() =>
                  onReview(
                    "ReceivedByPharmacy",
                    note.trim(),
                  )
                }
              >
                <PackageCheck size={16} />

                {t(
                  "تأكيد الاستلام والتوثيق",
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({
  icon: Icon,
  label,
  value,
  isArabic,
  ltr = false,
}) {
  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-2
      "
    >
      <Icon
        size={14}
        className="shrink-0 text-[#6f888d]"
      />

      <span className="shrink-0 text-[#829499]">
        {label}
      </span>

      <strong
        dir={ltr ? "ltr" : undefined}
        className={`
          ms-auto
          min-w-0
          truncate
          text-[#29464d]
          ${isArabic ? "text-right" : "text-left"}
        `}
      >
        {value}
      </strong>
    </div>
  );
}