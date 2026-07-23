export const formatDistance = (meters) =>
  meters >= 1000
    ? `${(meters / 1000).toLocaleString("ar-SY", { maximumFractionDigits: 1 })} كم`
    : `${Math.round(meters || 0).toLocaleString("ar-SY")} م`;

export const formatPrice = (value) =>
  value === null || value === undefined
    ? "السعر عند التواصل"
    : `${Number(value).toLocaleString("ar-SY")} ل.س`;
