export const formatNumber = (value) =>
  new Intl.NumberFormat("ar-SA").format(value ?? 0);
export const formatCurrency = (value) =>
  `${new Intl.NumberFormat("ar-SY", { maximumFractionDigits: 2 }).format(value ?? 0)} ل.س`;
export const formatDate = (value, withTime = false) =>
  value
    ? new Intl.DateTimeFormat(
        "ar-SA",
        withTime
          ? { dateStyle: "medium", timeStyle: "short" }
          : { dateStyle: "medium" },
      ).format(new Date(value))
    : "غير محدد";
export const stockMeta = (status) =>
  ({
    InStock: { label: "متوفر", className: "bg-emerald-50 text-emerald-700" },
    LowStock: { label: "مخزون منخفض", className: "bg-amber-50 text-amber-700" },
    OutOfStock: { label: "غير متوفر", className: "bg-rose-50 text-rose-700" },
  })[status] || {
    label: status || "غير محدد",
    className: "bg-slate-100 text-slate-600",
  };
export const requestMeta = (status) =>
  ({
    Pending: { label: "بانتظار الرد", className: "bg-amber-50 text-amber-700" },
    Available: { label: "متوفر", className: "bg-emerald-50 text-emerald-700" },
    Unavailable: { label: "غير متوفر", className: "bg-rose-50 text-rose-700" },
    Cancelled: { label: "ملغي", className: "bg-slate-100 text-slate-600" },
  })[status] || {
    label: status || "غير محدد",
    className: "bg-slate-100 text-slate-600",
  };
export const dayNames = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
export const toTimeValue = (value) => (value ? String(value).slice(0, 5) : "");
