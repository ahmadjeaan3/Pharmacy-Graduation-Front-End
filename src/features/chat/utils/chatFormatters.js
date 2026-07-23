export const quickPrompts = [
  "ابحث عن دواء",
  "أين أقرب 3 صيدليات؟",
  "اعرض بطاقتي الصحية",
];

export function formatChatDate(value, withTime = false) {
  if (!value) return "";
  return new Intl.DateTimeFormat(
    "ar-SY",
    withTime
      ? { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }
      : { day: "numeric", month: "short", year: "numeric" },
  ).format(new Date(value));
}

export const intentLabel = {
  Greeting: "ترحيب",
  NearestPharmacies: "صيدليات قريبة",
  MedicineSearch: "بحث دوائي",
  HealthCard: "البطاقة الصحية",
  LocationHelp: "تحديد الموقع",
  EndSession: "إنهاء المحادثة",
  Unknown: "مساعدة عامة",
};
