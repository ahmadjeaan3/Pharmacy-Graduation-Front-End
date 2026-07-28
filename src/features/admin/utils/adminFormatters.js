import { getActiveLocale } from "../../../shared/utils/formatters";

export const verificationStatuses = {
  PendingDocuments: {
    label: "بانتظار المستندات",
    className: "bg-slate-100 text-slate-600",
  },
  PendingReview: {
    label: "بانتظار المراجعة",
    className: "bg-amber-50 text-amber-700",
  },
  Approved: { label: "معتمدة", className: "bg-emerald-50 text-emerald-700" },
  NeedsUpdate: { label: "تحتاج تحديثاً", className: "bg-sky-50 text-sky-700" },
  Rejected: { label: "مرفوضة", className: "bg-rose-50 text-rose-700" },
};

export function getVerificationStatus(status) {
  return (
    verificationStatuses[status] ?? {
      label: status || "غير محددة",
      className: "bg-slate-100 text-slate-600",
    }
  );
}

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(getActiveLocale(), {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(new Date(value));
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDocumentType(type) {
  const labels = {
    RegistrationCertificate: "شهادة التسجيل",
    License: "الترخيص",
    Identity: "إثبات الهوية",
    AuthorizationLetter: "كتاب التفويض",
  };
  return (
    labels[type] ?? type?.replace(/([a-z])([A-Z])/g, "$1 $2") ?? "مستند تحقق"
  );
}

export function formatRequestStatus(status) {
  return (
    {
      Pending: "بانتظار الصيدلية",
      Available: "متوفر",
      Unavailable: "غير متوفر",
      Cancelled: "ملغي",
    }[status] ??
    status ??
    "غير محدد"
  );
}
