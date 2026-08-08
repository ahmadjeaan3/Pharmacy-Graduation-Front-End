export const verificationMeta = {
  PendingDocuments: {
    label: "بانتظار المستندات",
    tone: "bg-slate-100 text-slate-600",
  },

  PendingReview: {
    label: "قيد المراجعة",
    tone: "bg-amber-50 text-amber-700",
  },

  Approved: {
    label: "موثقة",
    tone: "bg-emerald-50 text-emerald-700",
  },

  NeedsUpdate: {
    label: "تحتاج تحديثًا",
    tone: "bg-orange-50 text-orange-700",
  },

  Rejected: {
    label: "غير مقبولة",
    tone: "bg-rose-50 text-rose-700",
  },
};

export const campaignStatuses = [
  {
    value: "",
    label: "جميع الحالات",
  },
  {
    value: "Draft",
    label: "مسودة",
  },
  {
    value: "Active",
    label: "نشطة",
  },
  {
    value: "Closed",
    label: "مغلقة",
  },
  {
    value: "Cancelled",
    label: "ملغاة",
  },
];

export const campaignStatusMeta =
  Object.fromEntries(
    campaignStatuses
      .filter((item) => item.value)
      .map((item) => [
        item.value,
        {
          label: item.label,

          tone:
            item.value === "Active"
              ? "bg-emerald-50 text-emerald-700"
              : item.value === "Draft"
                ? "bg-amber-50 text-amber-700"
                : item.value === "Cancelled"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-600",
        },
      ]),
  );

export const documentTypes = [
  {
    value: "RegistrationCertificate",
    label: "شهادة تسجيل المنظمة",
  },
  {
    value: "OperatingLicense",
    label: "ترخيص مزاولة النشاط",
  },
  {
    value: "ManagerIdentityDocument",
    label: "هوية مدير المنظمة",
  },
  {
    value: "TaxOrLegalDocument",
    label: "مستند ضريبي أو قانوني",
  },
  {
    value: "Other",
    label: "مستند داعم آخر",
  },
];

export const documentTypeLabel = (value) =>
  documentTypes.find(
    (item) => item.value === value,
  )?.label ||
  value ||
  "غير محدد";

/**
 * يعيد Locale مناسبًا للغة الحالية.
 */
export const getOrganizationLocale = (
  currentLanguage = "ar",
) => {
  const language = String(
    currentLanguage || "ar",
  )
    .split("-")[0]
    .toLowerCase();

  if (language === "tr") {
    return "tr-TR";
  }

  if (language === "en") {
    return "en-US";
  }

  return "ar-SY";
};

/**
 * تنسيق التاريخ حسب اللغة الحالية.
 *
 * في حال عدم وجود تاريخ تعيد الدالة المفتاح العربي
 * "غير محدد"، ويجب تمريره إلى t() داخل الصفحة.
 */
export const formatOrgDate = (
  value,
  currentLanguage = "ar",
) => {
  if (!value) {
    return "غير محدد";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "غير محدد";
  }

  const locale = getOrganizationLocale(
    currentLanguage,
  );

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

/**
 * تنسيق حجم الملف حسب اللغة الحالية.
 */
export const formatFileSize = (
  bytes,
  currentLanguage = "ar",
) => {
  const language = String(
    currentLanguage || "ar",
  )
    .split("-")[0]
    .toLowerCase();

  const locale = getOrganizationLocale(
    language,
  );

  const normalizedBytes = Number(bytes);

  if (
    !Number.isFinite(normalizedBytes) ||
    normalizedBytes <= 0
  ) {
    return language === "ar"
      ? "0 ك.ب"
      : "0 KB";
  }

  if (normalizedBytes >= 1048576) {
    const size = (
      normalizedBytes / 1048576
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    });

    return language === "ar"
      ? `${size} م.ب`
      : `${size} MB`;
  }

  const size = Math.ceil(
    normalizedBytes / 1024,
  ).toLocaleString(locale);

  return language === "ar"
    ? `${size} ك.ب`
    : `${size} KB`;
};

/**
 * تحويل التاريخ المختار إلى بداية اليوم بتوقيت UTC.
 */
export const toUtcDate = (value) =>
  value
    ? `${value}T00:00:00.000Z`
    : null;