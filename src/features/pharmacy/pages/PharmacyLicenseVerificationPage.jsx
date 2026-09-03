
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Download,
  FileCheck2,
  FileImage,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  downloadLicenseDocument,
  getLicenseVerification,
  getMyPharmacy,
  pharmacyKeys,
  submitLicenseVerification,
} from "../api/pharmacyApi";

/* =========================================================
   HERO
========================================================= */

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

/* =========================================================
   STATUS
========================================================= */

const statusInfo = {
  Pending: {
    label: "بانتظار الفحص",
    tone: "bg-amber-50 text-amber-800",
    icon: LoaderCircle,
  },

  Processing: {
    label: "جاري فحص المستند",
    tone: "bg-cyan-50 text-cyan-800",
    icon: LoaderCircle,
  },

  Matched: {
    label: "اجتاز الفحص الآلي",
    tone: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  NeedsReview: {
    label: "بحاجة إلى مراجعة الإدارة",
    tone: "bg-violet-50 text-violet-700",
    icon: AlertTriangle,
  },

  Failed: {
    label: "تعذر فحص المستند",
    tone: "bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },

  Rejected: {
    label: "مرفوض من الإدارة",
    tone: "bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },

  ManuallyApproved: {
    label: "تم الاعتماد بعد مراجعة الإدارة",
    tone: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  ManuallyRejected: {
    label: "مرفوض بعد مراجعة الإدارة",
    tone: "bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const formatBytes = (bytes) =>
  `${(Number(bytes || 0) / 1024 / 1024).toFixed(2)} MB`;

const formatDate = (value, locale = "ar-SY") =>
  value
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

/* =========================================================
   PAGE
========================================================= */

export function PharmacyLicenseVerificationPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "ar"
  )
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const locale =
    currentLanguage === "en"
      ? "en-US"
      : currentLanguage === "tr"
        ? "tr-TR"
        : "ar-SY";

  const client = useQueryClient();

  const [file, setFile] = useState(null);
  const [notice, setNotice] = useState(null);

  /* =======================================================
     VERIFICATION
  ======================================================= */

  const verification = useQuery({
    queryKey: ["pharmacy", "license-verification"],

    queryFn: getLicenseVerification,

    retry: false,

    refetchInterval: (query) =>
      ["Pending", "Processing"].includes(
        query.state.data?.status,
      )
        ? 4000
        : false,
  });

  /* =======================================================
     PROFILE
  ======================================================= */

  const profile = useQuery({
    queryKey: pharmacyKeys.profile,
    queryFn: getMyPharmacy,
  });

  /* =======================================================
     UPLOAD
  ======================================================= */

  const upload = useMutation({
    mutationFn: submitLicenseVerification,

    onSuccess: async () => {
      setFile(null);

      setNotice({
        ok: true,
        text: t(
          "تم رفع الترخيص وإرساله للفحص. ستتحدث الحالة تلقائيًا.",
        ),
      });

      await Promise.all([
        client.invalidateQueries({
          queryKey: ["pharmacy", "license-verification"],
        }),

        client.invalidateQueries({
          queryKey: pharmacyKeys.profile,
        }),

        client.invalidateQueries({
          queryKey: pharmacyKeys.dashboard,
        }),
      ]);
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  /* =======================================================
     DOCUMENT
  ======================================================= */

  const openDocument = async () => {
    try {
      const blob = await downloadLicenseDocument(
        verification.data.verificationId,
      );

      const url = URL.createObjectURL(blob);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      });
    }
  };

  /* =======================================================
     FILE
  ======================================================= */

  const chooseFile = (selected) => {
    setNotice(null);

    if (!selected) {
      setFile(null);
      return;
    }

    if (
      !["image/png", "image/jpeg"].includes(
        selected.type,
      )
    ) {
      setFile(null);

      setNotice({
        ok: false,
        text: t(
          "يُسمح فقط بصورة PNG أو JPEG واضحة للترخيص.",
        ),
      });

      return;
    }

    if (selected.size > 8 * 1024 * 1024) {
      setFile(null);

      setNotice({
        ok: false,
        text: t(
          "يجب ألا يتجاوز حجم صورة الترخيص 8 ميغابايت.",
        ),
      });

      return;
    }

    setFile(selected);
  };

  /* =======================================================
     DATA
  ======================================================= */

  const data = verification.data;

  const meta =
    statusInfo[data?.status] ||
    statusInfo.Pending;

  const StatusIcon = meta.icon;

  const missing =
    verification.isError &&
    verification.error?.response?.status === 404;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="
        w-full
        min-w-0
        space-y-5
        overflow-x-hidden
        sm:space-y-6
      "
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          isolate
          block
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          rounded-[14px]
          bg-[#10505A]
          text-white
          shadow-[0_22px_55px_rgba(23,75,87,.16)]
          min-h-[140px]
          sm:min-h-[180px]
          lg:min-h-[250px]
        "
      >
        {/* =====================================================
            BACKGROUND IMAGE
            تظهر فقط على الشاشات الكبيرة
        ====================================================== */}

        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`
            pointer-events-none
            absolute
            inset-0
            hidden
            h-full
            w-full
            min-w-0
            max-w-none
            select-none
            object-cover
            object-[center_38%]
            lg:block
            ${isArabic ? "scale-x-[-1]" : ""}
          `}
        />

        {/* =====================================================
            OVERLAY
            يظهر فقط على الشاشات الكبيرة
        ====================================================== */}

        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)",
          }}
        />

        {/* =====================================================
            DECORATIVE CIRCLE
            يظهر فقط على الشاشات الكبيرة
        ====================================================== */}

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

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div
          className="
            relative
            z-10
            flex
            min-h-[140px]
            w-full
            min-w-0
            max-w-full
            items-center
            overflow-hidden
            px-5
            py-5
            sm:min-h-[180px]
            sm:px-7
            lg:min-h-[250px]
            lg:px-10
            lg:py-7
          "
        >
          <div
            className={`
              flex
              w-full
              min-w-0
              max-w-[690px]
              items-center
              gap-4
              sm:gap-5
              ${isArabic ? "ml-auto" : "mr-auto"}
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
              <ShieldCheck
                size={24}
                strokeWidth={1.7}
                className="sm:hidden"
              />

              <ShieldCheck
                size={28}
                strokeWidth={1.7}
                className="hidden sm:block"
              />
            </span>

            <div
              className={`
                min-w-0
                flex-1
                overflow-hidden
                ${isArabic ? "text-right" : "text-left"}
              `}
            >
              <div
                className="
                  text-[10px]
                  font-bold
                  text-[#B9E6E4]
                  sm:text-xs
                "
              >
                {t("اعتماد المنشأة")}
              </div>

              <h1
                className="
                  m-0
                  mt-1
                  break-words
                  text-[21px]
                  font-medium
                  leading-[1.25]
                  text-white
                  sm:text-[26px]
                  lg:text-[28px]
                "
              >
                {t("الترخيص والتحقق")}
              </h1>

              <p
                className="
                  mt-2
                  max-w-full
                  break-words
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
                  "ارفع ترخيص الصيدلية بصورة واضحة لمطابقة البيانات، ثم تراجع الإدارة الملف قبل الاعتماد النهائي.",
                )}
              </p>
            </div>
          </div>
        </div>
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
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          grid
          min-w-0
          gap-5
          xl:grid-cols-[.9fr_1.1fr]
        "
      >
        {/* ===================================================
            UPLOAD
        ==================================================== */}

        <section
          className="
            min-w-0
            rounded-[14px]
            border
            border-[#DCE8EA]
            bg-white
            p-4
            shadow-[0_10px_30px_rgba(23,75,87,.04)]
            sm:p-5
            lg:p-6
          "
        >
          <div
            className={`
              flex
              min-w-0
              items-center
              gap-3
              ${isArabic ? "text-right" : "text-left"}
            `}
          >
            <span
              className="
                grid
                size-10
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#EAF4F3]
                text-[#216474]
                sm:size-11
              "
            >
              <Upload size={20} />
            </span>

            <div className="min-w-0">
              <h3 className="font-black text-[#29464D]">
                {t("رفع ترخيص الصيدلية")}
              </h3>

              <p className="mt-1 text-[11px] text-[#829499] sm:text-xs">
                {t("PNG أو JPEG، بحد أقصى 8 MB")}
              </p>
            </div>
          </div>

          {/* =================================================
              UPLOAD BOX
          ================================================= */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-dashed
              border-[#216474]/30
              bg-[#F7FBFA]
              p-4
              text-center
              sm:p-6
            "
          >
            <FileImage
              className="mx-auto text-[#216474]"
              size={34}
            />

            <p
              className="
                mt-3
                text-[13px]
                font-black
                leading-6
                text-[#29464D]
                sm:text-sm
              "
            >
              {t(
                "صورة كاملة وواضحة ومن دون قص الحواف",
              )}
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-[#829499]
                sm:text-xs
                sm:leading-6
              "
            >
              {t(
                "إعادة الرفع تلغي المستند النشط السابق وتعيد الحساب إلى انتظار الاعتماد.",
              )}
            </p>

            <label
              className="
                btn-secondary
                mt-4
                w-full
                cursor-pointer
                justify-center
                sm:w-auto
              "
            >
              <FileImage size={17} />

              {t("اختيار صورة")}

              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) =>
                  chooseFile(
                    event.target.files?.[0],
                  )
                }
              />
            </label>
          </div>

          {/* =================================================
              SELECTED FILE
          ================================================= */}

          {file && (
            <div
              className="
                mt-4
                min-w-0
                rounded-xl
                bg-[#EEF7F6]
                p-4
              "
            >
              <strong
                className="
                  block
                  truncate
                  text-sm
                  text-[#29464D]
                "
              >
                {file.name}
              </strong>

              <span
                className="
                  mt-1
                  block
                  text-xs
                  text-[#71858A]
                "
              >
                {formatBytes(file.size)}
              </span>
            </div>
          )}

          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          <button
            type="button"
            className="
              btn-primary
              mt-4
              w-full
              justify-center
            "
            disabled={!file || upload.isPending}
            onClick={() => upload.mutate(file)}
          >
            <Upload size={17} />

            {upload.isPending
              ? t("جاري رفع المستند...")
              : data
                ? t("رفع نسخة جديدة")
                : t("إرسال الترخيص للتحقق")}
          </button>

          {/* =================================================
              PRIVACY
          ================================================= */}

          <div
            className="
              mt-5
              rounded-xl
              bg-amber-50
              p-3
              text-[11px]
              font-bold
              leading-6
              text-amber-800
              sm:p-4
              sm:text-xs
            "
          >
            {t(
              "المستند خاص، ولا يظهر للمستخدمين. يمكن للصيدلية والإدارة المخوّلة فقط الوصول إليه.",
            )}
          </div>
        </section>

        {/* ===================================================
            STATUS
        ==================================================== */}

        <section
          className="
            min-w-0
            rounded-[14px]
            border
            border-[#DCE8EA]
            bg-white
            p-4
            shadow-[0_10px_30px_rgba(23,75,87,.04)]
            sm:p-5
            lg:p-6
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className={`
              flex
              min-w-0
              flex-col
              gap-3
              sm:flex-row
              sm:items-start
              sm:justify-between
              ${isArabic ? "text-right" : "text-left"}
            `}
          >
            <div className="min-w-0">
              <h3 className="font-black text-[#29464D]">
                {t("حالة الاعتماد")}
              </h3>

              <p className="mt-1 text-xs text-[#829499]">
                {t("رقم الترخيص")}:{" "}
                <span dir="ltr">
                  {profile.data?.licenseNumber || "—"}
                </span>
              </p>
            </div>

            {profile.data?.isApproved ? (
              <span
                className="
                  inline-flex
                  w-fit
                  max-w-full
                  shrink-0
                  items-center
                  gap-2
                  rounded-full
                  bg-emerald-50
                  px-3
                  py-2
                  text-xs
                  font-black
                  text-emerald-700
                "
              >
                <BadgeCheck size={16} />

                {t("معتمدة من الإدارة")}
              </span>
            ) : (
              <span
                className="
                  w-fit
                  max-w-full
                  shrink-0
                  rounded-full
                  bg-slate-100
                  px-3
                  py-2
                  text-xs
                  font-black
                  text-slate-600
                "
              >
                {t("غير معتمدة بعد")}
              </span>
            )}
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {verification.isLoading ? (
            <div
              className="
                grid
                min-h-56
                place-items-center
                sm:min-h-64
              "
            >
              <LoaderCircle
                className="animate-spin text-[#216474]"
              />
            </div>
          ) : missing ? (
            /* ===============================================
               NO DOCUMENT
            =============================================== */

            <div
              className="
                mt-5
                rounded-2xl
                bg-[#F7FAF9]
                p-5
                text-center
                sm:mt-6
                sm:p-8
              "
            >
              <FileCheck2
                className="mx-auto text-[#829499]"
                size={36}
              />

              <h4
                className="
                  mt-4
                  font-black
                  text-[#29464D]
                "
              >
                {t("لم يُرفع ترخيص بعد")}
              </h4>

              <p
                className="
                  mt-2
                  text-[13px]
                  leading-6
                  text-[#829499]
                  sm:text-sm
                "
              >
                {t(
                  "اختر صورة الترخيص من النموذج وأرسلها لبدء التحقق.",
                )}
              </p>
            </div>
          ) : verification.isError ? (
            /* ===============================================
               ERROR
            =============================================== */

            <div
              className="
                mt-5
                rounded-2xl
                bg-rose-50
                p-4
                text-sm
                font-bold
                leading-6
                text-rose-700
                sm:mt-6
                sm:p-5
              "
            >
              {getApiErrorMessage(
                verification.error,
              )}
            </div>
          ) : (
            /* ===============================================
               DATA
            =============================================== */

            <div className="mt-5 sm:mt-6">
              {/* =================================================
                  STATUS
              ================================================= */}

              <div
                className={`
                  flex
                  min-w-0
                  items-start
                  gap-3
                  rounded-2xl
                  p-4
                  sm:items-center
                  sm:p-5
                  ${meta.tone}
                `}
              >
                <StatusIcon
                  className={`
                    mt-0.5
                    shrink-0
                    sm:mt-0
                    ${
                      data.status === "Processing"
                        ? "animate-spin"
                        : ""
                    }
                  `}
                />

                <div className="min-w-0">
                  <strong className="block break-words">
                    {t(meta.label)}
                  </strong>

                  <span
                    className="
                      mt-1
                      block
                      text-xs
                      leading-5
                      opacity-75
                    "
                  >
                    {t("أُرسل في")}{" "}
                    {formatDate(
                      data.submittedAtUtc,
                      locale,
                    )}
                  </span>
                </div>
              </div>

              {/* =================================================
                  DETAILS
              ================================================= */}

              <div
                className="
                  mt-4
                  grid
                  min-w-0
                  gap-3
                  sm:mt-5
                  sm:grid-cols-2
                "
              >
                <Detail
                  label={t("اسم الملف")}
                  value={data.originalFileName}
                />

                <Detail
                  label={t("حجم الملف")}
                  value={formatBytes(
                    data.fileSizeBytes,
                  )}
                />

                <Detail
                  label={t("الاسم المسجل")}
                  value={data.registeredName}
                />

                <Detail
                  label={t("الاسم المستخرج")}
                  value={data.extractedName}
                />

                <Detail
                  label={t("رقم السجل المستخرج")}
                  value={data.registryNumber}
                />

                <Detail
                  label={t("درجة المطابقة")}
                  value={
                    data.matchScore == null
                      ? "—"
                      : `${Math.round(
                          data.matchScore,
                        )}%`
                  }
                />
              </div>

              {/* =================================================
                  ERROR / REJECTION
              ================================================= */}

              {(data.rejectionReason ||
                data.failureReason) && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    bg-rose-50
                    p-4
                    text-sm
                    font-bold
                    leading-6
                    text-rose-700
                  "
                >
                  {data.rejectionReason ||
                    data.failureReason}
                </div>
              )}

              {/* =================================================
                  DOCUMENT
              ================================================= */}

              <button
                type="button"
                className="
                  btn-secondary
                  mt-5
                  w-full
                  justify-center
                "
                onClick={openDocument}
              >
                <Download size={17} />

                {t("عرض المستند المرفوع")}
              </button>
            </div>
          )}

          {/* =================================================
              SECURITY NOTICE
          ================================================= */}

          <div
            className="
              mt-5
              flex
              min-w-0
              items-start
              gap-3
              rounded-2xl
              border
              border-[#174B57]/8
              p-3
              sm:mt-6
              sm:p-4
            "
          >
            <ShieldCheck
              className="
                mt-0.5
                shrink-0
                text-[#216474]
              "
              size={20}
            />

            <p
              className={`
                min-w-0
                text-[11px]
                font-bold
                leading-6
                text-[#526A70]
                sm:text-xs
                ${isArabic ? "text-right" : "text-left"}
              `}
            >
              {t(
                "نجاح القراءة والمطابقة الآلية لا يعني الاعتماد النهائي. تظهر الصيدلية وتستقبل العمليات المعتمدة بعد قرار الإدارة.",
              )}
            </p>
          </div>

          {/* =================================================
              REFRESH
          ================================================= */}

          {!profile.data?.isApproved &&
            data?.status === "Matched" && (
              <button
                type="button"
                className="
                  btn-quiet
                  mt-3
                  w-full
                  justify-center
                "
                onClick={() =>
                  verification.refetch()
                }
              >
                <RefreshCw size={16} />

                {t("تحديث حالة المراجعة")}
              </button>
            )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({ label, value }) {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        bg-[#F7FAF9]
        p-3
        sm:p-4
      "
    >
      <span
        className="
          text-[11px]
          text-[#829499]
        "
      >
        {label}
      </span>

      <strong
        className="
          mt-1
          block
          min-w-0
          truncate
          text-sm
          text-[#29464D]
        "
      >
        {value || "—"}
      </strong>
    </div>
  );
}

