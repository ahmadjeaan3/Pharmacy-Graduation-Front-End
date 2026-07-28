import { getActiveLocale } from "../../../shared/utils/formatters";

export const formatDate = (value, withTime = false) => {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat(getActiveLocale(), {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(new Date(value));
};

export { formatDistance, formatPrice } from "../../../shared/utils/formatters";

export const requestStatus = {
  Pending: {
    label: "قيد المراجعة",
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  Available: {
    label: "متوفر",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  Unavailable: {
    label: "غير متوفر",
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  Cancelled: {
    label: "ملغي",
    tone: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export const getRequestStatus = (status, displayText) =>
  requestStatus[status] ?? {
    label: displayText || status || "غير محدد",
    tone: "bg-slate-100 text-slate-600 border-slate-200",
  };

export const searchTypeLabels = {
  MedicineSearch: "بحث عن دواء",
  NearestPharmacies: "صيدليات قريبة",
  PharmacyDetails: "عرض صيدلية",
  MedicineRequest: "طلب دواء",
};

export const dayLabels = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
