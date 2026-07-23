export const verificationMeta = {
  PendingDocuments: {
    label: "بانتظار المستندات",
    tone: "bg-slate-100 text-slate-600",
  },
  PendingReview: { label: "قيد المراجعة", tone: "bg-amber-50 text-amber-700" },
  Approved: { label: "موثقة", tone: "bg-emerald-50 text-emerald-700" },
  NeedsUpdate: { label: "تحتاج تحديثًا", tone: "bg-orange-50 text-orange-700" },
  Rejected: { label: "غير مقبولة", tone: "bg-rose-50 text-rose-700" },
};

export const campaignStatuses = [
  { value: "", label: "جميع الحالات" },
  { value: "Draft", label: "مسودة" },
  { value: "Active", label: "نشطة" },
  { value: "Closed", label: "مغلقة" },
  { value: "Cancelled", label: "ملغاة" },
];

export const campaignStatusMeta = Object.fromEntries(
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
  { value: "RegistrationCertificate", label: "شهادة تسجيل المنظمة" },
  { value: "OperatingLicense", label: "ترخيص مزاولة النشاط" },
  { value: "ManagerIdentityDocument", label: "هوية مدير المنظمة" },
  { value: "TaxOrLegalDocument", label: "مستند ضريبي أو قانوني" },
  { value: "Other", label: "مستند داعم آخر" },
];

export const documentTypeLabel = (value) =>
  documentTypes.find((item) => item.value === value)?.label || value;
export const formatOrgDate = (value) =>
  value
    ? new Intl.DateTimeFormat("ar-SY", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "غير محدد";
export const formatFileSize = (bytes) =>
  bytes >= 1048576
    ? `${(bytes / 1048576).toLocaleString("ar-SY", { maximumFractionDigits: 1 })} م.ب`
    : `${Math.ceil(bytes / 1024).toLocaleString("ar-SY")} ك.ب`;
export const toUtcDate = (value) => (value ? `${value}T00:00:00.000Z` : null);
