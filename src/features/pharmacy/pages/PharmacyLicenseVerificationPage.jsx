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
      className="space-y-5"
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative isolate
          min-h-[220px]
          overflow-hidden
          rounded-[14px]
          text-white
          shadow-[0_22px_55px_rgba(23,75,87,.16)]
          sm:min-h-[230px]
          lg:min-h-[250px]
        "
      >
        {/* Hero Image */}

        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`
            absolute inset-0
            h-full w-full
            object-cover
            object-[center_38%]
            select-none
            ${
              isArabic
                ? "scale-x-[-1]"
                : ""
            }
          `}
        />

        {/* Overlay */}

        <div
          className="absolute inset-0"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)",
          }}
        />

        {/* Decorative Circle */}

        <div
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute
            -top-20
            ${
              isArabic
                ? "-left-14"
                : "-right-14"
            }
            size-64
            rounded-full
            border-[40px]
            border-white/[.04]
          `}
        />

        {/* Content */}

        <div
          className="
            relative z-10
            flex min-h-[220px]
            flex-col
            justify-center
            gap-7
            px-6 py-7
            sm:min-h-[230px]
            sm:px-8
            lg:min-h-[250px]
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-10
          "
        >
          {/* Title */}

          <div
            className={`
              flex
              items-center
              gap-5
              ${
                isArabic
                  ? "text-right"
                  : "text-left"
              }
            `}
          >
            <span
              className="
                grid size-12
                shrink-0
                place-items-center
                rounded-lg
                bg-[rgba(230,243,246,.10)]
                text-[#E6F3F6]
                backdrop-blur-sm
              "
            >
              <ShieldCheck
                size={28}
                strokeWidth={1.7}
              />
            </span>

            <div>
              <div
                className="
                  text-xs
                  font-bold
                  text-[#B9E6E4]
                "
              >
                {t("اعتماد المنشأة")}
              </div>

              <h1
                className="
                  mt-1
                  text-[28px]
                  font-medium
                  leading-[1.2]
                  text-white
                "
              >
                {t("الترخيص والتحقق")}
              </h1>

              <p
                className="
                  mt-3
                  max-w-[600px]
                  text-[14px]
                  leading-7
                  text-[#D6D6D6]
                "
              >
                {t(
                  "ارفع ترخيص الصيدلية بصورة واضحة لمطابقة البيانات، ثم تراجع الإدارة الملف قبل الاعتماد النهائي.",
                )}
              </p>
            </div>
          </div>

          {/* Approval Status */}

          <div
            className={`
              inline-flex
              h-11
              shrink-0
              items-center
              gap-2
              rounded-full
              px-5
              text-sm
              font-bold
              shadow-sm
              ${
                profile.data?.isApproved
                  ? "bg-[#EAF7F0] text-[#16804B]"
                  : "bg-[#F0F6F7] text-[#60777D]"
              }
            `}
          >
            {profile.data?.isApproved ? (
              <BadgeCheck size={17} />
            ) : (
              <ShieldCheck size={17} />
            )}

            {profile.data?.isApproved
              ? t("معتمدة من الإدارة")
              : t("بانتظار الاعتماد")}
          </div>
        </div>
      </section>

      {/* =====================================================
          NOTICE
      ===================================================== */}

      {notice && (
        <div
          className={`
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
            ${
              isArabic
                ? "text-right"
                : "text-left"
            }
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
          gap-5
          xl:grid-cols-[.9fr_1.1fr]
        "
      >
        {/* ===================================================
            UPLOAD
        =================================================== */}

        <section
          className="
            rounded-[14px]
            border
            border-[#DCE8EA]
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(23,75,87,.04)]
          "
        >
          <div
            className={`
              flex
              items-center
              gap-3
              ${
                isArabic
                  ? "text-right"
                  : "text-left"
              }
            `}
          >
            <span
              className="
                grid size-11
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#EAF4F3]
                text-[#216474]
              "
            >
              <Upload size={21} />
            </span>

            <div>
              <h3
                className="
                  font-black
                  text-[#29464D]
                "
              >
                {t("رفع ترخيص الصيدلية")}
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-[#829499]
                "
              >
                {t("PNG أو JPEG، بحد أقصى 8 MB")}
              </p>
            </div>
          </div>

          {/* Upload Box */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-dashed
              border-[#216474]/30
              bg-[#F7FBFA]
              p-6
              text-center
            "
          >
            <FileImage
              className="mx-auto text-[#216474]"
              size={36}
            />

            <p
              className="
                mt-3
                text-sm
                font-black
                text-[#29464D]
              "
            >
              {t(
                "صورة كاملة وواضحة ومن دون قص الحواف",
              )}
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-6
                text-[#829499]
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
                cursor-pointer
                justify-center
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

          {/* Selected File */}

          {file && (
            <div
              className="
                mt-4
                rounded-xl
                bg-[#EEF7F6]
                p-4
              "
            >
              <strong className="block truncate text-sm text-[#29464D]">
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

          {/* Upload Button */}

          <button
            type="button"
            className="
              btn-primary
              mt-4
              w-full
              justify-center
            "
            disabled={
              !file ||
              upload.isPending
            }
            onClick={() =>
              upload.mutate(file)
            }
          >
            <Upload size={17} />

            {upload.isPending
              ? t("جاري رفع المستند...")
              : data
                ? t("رفع نسخة جديدة")
                : t("إرسال الترخيص للتحقق")}
          </button>

          {/* Privacy */}

          <div
            className="
              mt-5
              rounded-xl
              bg-amber-50
              p-4
              text-xs
              font-bold
              leading-6
              text-amber-800
            "
          >
            {t(
              "المستند خاص، ولا يظهر للمستخدمين. يمكن للصيدلية والإدارة المخوّلة فقط الوصول إليه.",
            )}
          </div>
        </section>

        {/* ===================================================
            STATUS
        =================================================== */}

        <section
          className="
            rounded-[14px]
            border
            border-[#DCE8EA]
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(23,75,87,.04)]
          "
        >
          {/* Header */}

          <div
            className={`
              flex
              items-start
              justify-between
              gap-4
              ${
                isArabic
                  ? "text-right"
                  : "text-left"
              }
            `}
          >
            <div>
              <h3
                className="
                  font-black
                  text-[#29464D]
                "
              >
                {t("حالة الاعتماد")}
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-[#829499]
                "
              >
                {t("رقم الترخيص")}:{" "}
                <span dir="ltr">
                  {profile.data?.licenseNumber ||
                    "—"}
                </span>
              </p>
            </div>

            {profile.data?.isApproved ? (
              <span
                className="
                  inline-flex
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

          {/* Loading */}

          {verification.isLoading ? (
            <div
              className="
                grid
                min-h-64
                place-items-center
              "
            >
              <LoaderCircle
                className="
                  animate-spin
                  text-[#216474]
                "
              />
            </div>
          ) : missing ? (
            /* ===============================================
               NO DOCUMENT
            =============================================== */

            <div
              className="
                mt-6
                rounded-2xl
                bg-[#F7FAF9]
                p-8
                text-center
              "
            >
              <FileCheck2
                className="
                  mx-auto
                  text-[#829499]
                "
                size={38}
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
                  text-sm
                  text-[#829499]
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
                mt-6
                rounded-2xl
                bg-rose-50
                p-5
                text-sm
                font-bold
                text-rose-700
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

            <div className="mt-6">
              {/* Status */}

              <div
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  p-5
                  ${meta.tone}
                `}
              >
                <StatusIcon
                  className={
                    data.status === "Processing"
                      ? "animate-spin"
                      : ""
                  }
                />

                <div>
                  <strong className="block">
                    {t(meta.label)}
                  </strong>

                  <span
                    className="
                      mt-1
                      block
                      text-xs
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

              {/* Details */}

              <div
                className="
                  mt-5
                  grid
                  gap-3
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

              {/* Error / Rejection */}

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
                    text-rose-700
                  "
                >
                  {data.rejectionReason ||
                    data.failureReason}
                </div>
              )}

              {/* Document */}

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

          {/* Security Notice */}

          <div
            className="
              mt-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-[#174B57]/8
              p-4
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
                text-xs
                font-bold
                leading-6
                text-[#526A70]
                ${
                  isArabic
                    ? "text-right"
                    : "text-left"
                }
              `}
            >
              {t(
                "نجاح القراءة والمطابقة الآلية لا يعني الاعتماد النهائي. تظهر الصيدلية وتستقبل العمليات المعتمدة بعد قرار الإدارة.",
              )}
            </p>
          </div>

          {/* Refresh */}

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
        rounded-xl
        bg-[#F7FAF9]
        p-4
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