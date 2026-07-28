export const getActiveLocale = () => {
  const language = document.documentElement.lang || "ar";
  return language === "ar" ? "ar-SY" : language;
};

const distanceUnits = {
  ar: { kilometer: "كم", meter: "م" },
  en: { kilometer: "km", meter: "m" },
  tr: { kilometer: "km", meter: "m" },
};

const priceLabels = {
  ar: { unavailable: "السعر عند التواصل", currency: "ل.س" },
  en: { unavailable: "Contact for price", currency: "SYP" },
  tr: { unavailable: "Fiyat için iletişime geçin", currency: "SYP" },
};

export const formatDistance = (meters) =>
  meters >= 1000
    ? `${(meters / 1000).toLocaleString(getActiveLocale(), { maximumFractionDigits: 1 })} ${
        distanceUnits[document.documentElement.lang]?.kilometer || "km"
      }`
    : `${Math.round(meters || 0).toLocaleString(getActiveLocale())} ${
        distanceUnits[document.documentElement.lang]?.meter || "m"
      }`;

export const formatPrice = (value) => {
  const labels = priceLabels[document.documentElement.lang] || priceLabels.en;
  return value === null || value === undefined
    ? labels.unavailable
    : `${Number(value).toLocaleString(getActiveLocale())} ${labels.currency}`;
};
