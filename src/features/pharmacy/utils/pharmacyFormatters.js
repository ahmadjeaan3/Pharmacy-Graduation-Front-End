const localeMap = {
  ar: "ar-SA",
  en: "en-US",
  tr: "tr-TR",
};

const currencyLabelMap = {
  ar: "ل.س",
  en: "SYP",
  tr: "SYP",
};

const resolveLanguage = (language = "ar") =>
  String(language).split("-")[0].toLowerCase();

const resolveLocale = (language = "ar") => {
  const normalized = resolveLanguage(language);

  return localeMap[normalized] || localeMap.ar;
};

export const formatNumber = (value, language = "ar") => {
  const locale = resolveLocale(language);

  return new Intl.NumberFormat(locale).format(value ?? 0);
};

export const formatCurrency = (value, language = "ar") => {
  const normalized = resolveLanguage(language);

  const locale = normalized === "ar" ? "ar-SY" : resolveLocale(normalized);

  const formattedValue = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value ?? 0);

  const currencyLabel = currencyLabelMap[normalized] || currencyLabelMap.ar;

  return `${formattedValue} ${currencyLabel}`;
};

export const formatDate = (value, withTime = false, language = "ar") => {
  if (!value) return "";

  const locale = resolveLocale(language);

  return new Intl.DateTimeFormat(
    locale,
    withTime
      ? {
          dateStyle: "medium",
          timeStyle: "short",
        }
      : {
          dateStyle: "medium",
        },
  ).format(new Date(value));
};

export const stockMeta = (status) =>
  ({
    InStock: {
      label: "متوفر",
      className: "bg-emerald-50 text-emerald-700",
    },

    LowStock: {
      label: "مخزون منخفض",
      className: "bg-amber-50 text-amber-700",
    },

    OutOfStock: {
      label: "غير متوفر",
      className: "bg-rose-50 text-rose-700",
    },

    Expired: {
      label: "منتهي الصلاحية",
      className: "bg-slate-100 text-slate-700",
    },
  })[status] || {
    label: status || "غير محدد",
    className: "bg-slate-100 text-slate-600",
  };

export const requestMeta = (status) =>
  ({
    Pending: {
      label: "بانتظار الرد",
      className: "bg-amber-50 text-amber-700",
    },

    Available: {
      label: "جاهز للاستلام",
      className: "bg-emerald-50 text-emerald-700",
    },

    Unavailable: {
      label: "غير متوفر",
      className: "bg-rose-50 text-rose-700",
    },

    Cancelled: {
      label: "ملغي",
      className: "bg-slate-100 text-slate-600",
    },
    Reserved: { label: "محجوز", className: "bg-sky-50 text-sky-700" },
    ReadyForPickup: { label: "جاهز للاستلام", className: "bg-emerald-50 text-emerald-700" },
    Collected: { label: "تم الاستلام", className: "bg-teal-50 text-teal-700" },
    Completed: { label: "تم الاستلام", className: "bg-teal-50 text-teal-700" },
    Expired: { label: "منتهي", className: "bg-slate-100 text-slate-600" },
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
