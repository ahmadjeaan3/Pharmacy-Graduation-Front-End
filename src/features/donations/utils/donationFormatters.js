export const offerStatuses = [
  { value: "", label: "جميع الحالات" },
  { value: "PendingReview", label: "قيد المراجعة" },
  { value: "Approved", label: "مقبول" },
  { value: "Received", label: "تم الاستلام" },
  { value: "Rejected", label: "مرفوض" },
  { value: "Cancelled", label: "ملغي" },
];

export const assistanceStatuses = [
  { value: "", label: "جميع الحالات" },
  { value: "Open", label: "مفتوح" },
  { value: "UnderReview", label: "قيد المراجعة" },
  { value: "Fulfilled", label: "تمت تلبيته" },
  { value: "Rejected", label: "مرفوض" },
  { value: "Cancelled", label: "ملغي" },
];

const statusTone = {
  PendingReview: "bg-amber-50 text-amber-700",
  Approved: "bg-cyan-50 text-cyan-700",
  Received: "bg-emerald-50 text-emerald-700",
  Open: "bg-cyan-50 text-cyan-700",
  UnderReview: "bg-amber-50 text-amber-700",
  Fulfilled: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

export function getStatusMeta(status, type) {
  const options = type === "offer" ? offerStatuses : assistanceStatuses;
  return {
    label: options.find((item) => item.value === status)?.label || status,
    tone: statusTone[status] || "bg-slate-100 text-slate-600",
  };
}

export function inputDateAfter(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export const toUtcDate = (value) => (value ? `${value}T00:00:00.000Z` : null);
