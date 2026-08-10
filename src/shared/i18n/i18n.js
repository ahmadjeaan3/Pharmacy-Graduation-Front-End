import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { autoMessages } from "./autoMessages";
import { inventoryMessages } from "./inventoryMessages";
import { landingMessages } from "./landingMessages";

export const STORAGE_KEY = "hayat-dawaiya-language";

export const languages = [
  {
    code: "ar",
    label: "العربية",
    shortLabel: "ع",
    direction: "rtl",
  },
  {
    code: "en",
    label: "English",
    shortLabel: "EN",
    direction: "ltr",
  },
  {
    code: "tr",
    label: "Türkçe",
    shortLabel: "TR",
    direction: "ltr",
  },
];

export function normalizeLanguage(language = "ar") {
  const value = String(language).trim().toLowerCase().slice(0, 2);

  const isSupported = languages.some(({ code }) => code === value);

  return isSupported ? value : "ar";
}

function getInitialLanguage() {
  try {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);

    if (storedLanguage) {
      return normalizeLanguage(storedLanguage);
    }
  } catch {
    // localStorage غير متاح.
  }

  const browserLanguage =
    typeof navigator !== "undefined" ? navigator.language : "ar";

  return normalizeLanguage(browserLanguage);
}

const resources = {
  ar: {
    translation: {
      "الخطوة {{step}} من {{total}}": "الخطوة {{step}} من {{total}}",

      "بيانات {{account}}": "بيانات {{account}}",

      "صورة تسجيل {{account}}": "صورة تسجيل {{account}}",

      "إضافة إحداثيات {{owner}}": "إضافة إحداثيات {{owner}}",

      "تمت إضافة إحداثيات موقع {{owner}}.":
        "تمت إضافة إحداثيات موقع {{owner}}.",

      "تحليل مخزون {{name}}": "تحليل مخزون {{name}}",

      notifications: {
        ariaLabel: "فتح الإشعارات",
        ariaLabelUnread: "فتح الإشعارات، لديك {{count}} غير مقروءة",
        title: "الإشعارات",
        unreadCount: "{{count}} إشعارات غير مقروءة",
        noNew: "لا توجد إشعارات جديدة",
        markingAll: "جارٍ التحديد...",
        markAllRead: "تحديد الكل كمقروء",
        loading: "جارٍ تحميل الإشعارات...",
        loadError: "تعذر تحميل الإشعارات",
        empty: "لا توجد إشعارات حالياً",
        viewAll: "عرض جميع الإشعارات",
      },
    },
  },

  en: {
    translation: {
      ...autoMessages.en,
      ...landingMessages.en,
      ...inventoryMessages.en,
      "نسيت كلمة المرور؟": "Forgot password?",
      "روابط الصفحة": "Page links",
      "الوصفة الذكية": "Smart prescription",
      "تحليل مخزون {{name}}": "Analyze {{name}} inventory",
      notifications: {
        ariaLabel: "Open notifications",
        ariaLabelUnread: "Open notifications, {{count}} unread",
        title: "Notifications",
        unreadCount: "{{count}} unread notifications",
        noNew: "No new notifications",
        markingAll: "Marking...",
        markAllRead: "Mark all as read",
        loading: "Loading notifications...",
        loadError: "Unable to load notifications",
        empty: "No notifications yet",
        viewAll: "View all notifications",
      },
      دوائي: "Dawaai",
      "شبكة دوائي للأعمال": "Dawaai Business Network",
      "حجوزات الأدوية": "Medicine reservations",
      "تابع رحلة الدواء من الحجز والتجهيز حتى الاستلام من الصيدلية.":
        "Track your medicine from reservation and preparation through pharmacy pickup.",
      "حجز دواء": "Reserve medicine",
      "حجز من {{pharmacy}}": "Reserved from {{pharmacy}}",
      "رحلة الحصول على الدواء": "Medicine pickup journey",
      "من نتيجة البحث حتى تأكيد الاستلام من الصيدلية":
        "From the search result to confirmed pharmacy pickup",
      "تم العثور على الدواء": "Medicine found",
      "ظهر ضمن مخزون الصيدلية": "Listed in the pharmacy inventory",
      "تم حجز الكمية": "Quantity reserved",
      "الحجز مرتبط برقم الطلب": "Reservation linked to the request number",
      "جاهز للتوجه": "Ready to go",
      "افتح الاتجاهات إلى الصيدلية": "Open directions to the pharmacy",
      "ارسم مسار الوصول": "Draw the route",
      "ارسم المسار": "Draw route",
      "مسار الوصول إلى الصيدلية": "Route to the pharmacy",
      "جاري رسم طريق الوصول إلى الصيدلية...":
        "Drawing the route to the pharmacy...",
      "جاري تحميل خريطة المسار...": "Loading the route map...",
      "تأكيد الاستلام": "Pickup confirmation",
      "تكتمل الرحلة عند التسليم": "The journey completes upon handover",
      "الدواء محجوز وجاهز. خذ رقم الطلب وتوجه إلى الصيدلية.":
        "Your medicine is reserved and ready. Take the request number to the pharmacy.",
      "تم تسجيل الحجز وتنتظر تجهيز الصيدلية للكمية.":
        "Your reservation is recorded and awaiting pharmacy preparation.",
      "إلغاء الحجز": "Cancel reservation",
      "ابدأ التوجه للصيدلية": "Navigate to pharmacy",
      "ظهور الدواء في صفحة الصيدلية يعني أنه متوفر، وعند إنشاء الطلب تُربط الكمية برقم الحجز حتى الاستلام أو الإلغاء.":
        "A medicine shown on the pharmacy page is available. Once requested, its quantity is linked to the reservation until pickup or cancellation.",
      "جاهز للاستلام": "Ready for pickup",
      "تم الحجز": "Reserved",
      "تم الاستلام": "Collected",
      "انتهت مهلة الحجز": "Reservation expired",
      "محجوز لهذا الطلب": "Reserved for this request",
      "تجهيز الحجز": "Prepare reservation",
      "الكمية محجوزة مسبقاً؛ أكد فقط أنها جاهزة للاستلام":
        "The quantity is already reserved; confirm when it is ready for pickup",
      "الكمية محجوزة من المخزون": "Quantity reserved from inventory",
      "جاري التأكيد...": "Confirming...",
      "تأكيد الجاهزية للاستلام": "Confirm ready for pickup",
      "تم تأكيد استلام المريض للدواء.":
        "The patient's medicine pickup was confirmed.",
      "تأكيد أن المريض استلم الدواء": "Confirm patient collected medicine",
      "المخزون والدفعات": "Inventory & batches",
      التوفر: "Availability",
      "نبض المنصة": "Platform pulse",
      "تحديثات مباشرة": "Live updates",
      "دواؤك أقرب مما تتوقع — ابحث، احجز وتوجه إلى الصيدلية بثقة.":
        "Your medicine is closer than you think — search, reserve, and visit the pharmacy with confidence.",
    },
  },

  tr: {
    translation: {
      ...autoMessages.tr,
      ...landingMessages.tr,
      ...inventoryMessages.tr,
      "نسيت كلمة المرور؟": "Şifrenizi mi unuttunuz?",
      "روابط الصفحة": "Sayfa bağlantıları",
      "الوصفة الذكية": "Akıllı reçete",
      "تحليل مخزون {{name}}": "{{name}} stokunu analiz et",
      notifications: {
        ariaLabel: "Bildirimleri aç",
        ariaLabelUnread: "Bildirimleri aç, {{count}} okunmamış",
        title: "Bildirimler",
        unreadCount: "{{count}} okunmamış bildirim",
        noNew: "Yeni bildirim yok",
        markingAll: "İşaretleniyor...",
        markAllRead: "Tümünü okundu işaretle",
        loading: "Bildirimler yükleniyor...",
        loadError: "Bildirimler yüklenemedi",
        empty: "Henüz bildirim yok",
        viewAll: "Tüm bildirimleri görüntüle",
      },
      دوائي: "Dawaai",
      "شبكة دوائي للأعمال": "Dawaai İş Ağı",
      "حجوزات الأدوية": "İlaç rezervasyonları",
      "تابع رحلة الدواء من الحجز والتجهيز حتى الاستلام من الصيدلية.":
        "İlacınızı rezervasyondan hazırlığa ve eczaneden teslim almaya kadar takip edin.",
      "حجز دواء": "İlaç ayırt",
      "حجز من {{pharmacy}}": "{{pharmacy}} eczanesinden ayrıldı",
      "رحلة الحصول على الدواء": "İlaç teslim alma yolculuğu",
      "من نتيجة البحث حتى تأكيد الاستلام من الصيدلية":
        "Arama sonucundan eczane teslim onayına kadar",
      "تم العثور على الدواء": "İlaç bulundu",
      "ظهر ضمن مخزون الصيدلية": "Eczane stoklarında listelendi",
      "تم حجز الكمية": "Miktar ayrıldı",
      "الحجز مرتبط برقم الطلب": "Rezervasyon talep numarasına bağlıdır",
      "جاهز للتوجه": "Yola çıkmaya hazır",
      "افتح الاتجاهات إلى الصيدلية": "Eczaneye yol tarifini açın",
      "تأكيد الاستلام": "Teslim alma onayı",
      "تكتمل الرحلة عند التسليم": "Teslimle süreç tamamlanır",
      "الدواء محجوز وجاهز. خذ رقم الطلب وتوجه إلى الصيدلية.":
        "İlacınız ayrıldı ve hazır. Talep numarasıyla eczaneye gidin.",
      "تم تسجيل الحجز وتنتظر تجهيز الصيدلية للكمية.":
        "Rezervasyonunuz kaydedildi ve eczanenin hazırlaması bekleniyor.",
      "إلغاء الحجز": "Rezervasyonu iptal et",
      "ابدأ التوجه للصيدلية": "Eczaneye git",
      "ظهور الدواء في صفحة الصيدلية يعني أنه متوفر، وعند إنشاء الطلب تُربط الكمية برقم الحجز حتى الاستلام أو الإلغاء.":
        "Eczane sayfasında görünen ilaç mevcuttur. Talep edildiğinde miktarı teslim alma veya iptale kadar rezervasyona bağlanır.",
      "جاهز للاستلام": "Teslim almaya hazır",
      "تم الحجز": "Ayrıldı",
      "تم الاستلام": "Teslim alındı",
      "انتهت مهلة الحجز": "Rezervasyon süresi doldu",
      "محجوز لهذا الطلب": "Bu talep için ayrıldı",
      "تجهيز الحجز": "Rezervasyonu hazırla",
      "الكمية محجوزة مسبقاً؛ أكد فقط أنها جاهزة للاستلام":
        "Miktar zaten ayrıldı; teslim almaya hazır olduğunda onaylayın",
      "الكمية محجوزة من المخزون": "Miktar stoktan ayrıldı",
      "جاري التأكيد...": "Onaylanıyor...",
      "تأكيد الجاهزية للاستلام": "Teslime hazır olduğunu onayla",
      "تم تأكيد استلام المريض للدواء.":
        "Hastanın ilacı teslim aldığı onaylandı.",
      "تأكيد أن المريض استلم الدواء": "Hastanın ilacı aldığını onayla",
      "المخزون والدفعات": "Stok ve partiler",
      التوفر: "Mevcudiyet",
      "نبض المنصة": "Platform gündemi",
      "تحديثات مباشرة": "Canlı güncellemeler",
      "دواؤك أقرب مما تتوقع — ابحث، احجز وتوجه إلى الصيدلية بثقة.":
        "İlacınız düşündüğünüzden daha yakın — arayın, ayırtın ve eczaneye güvenle gidin.",
    },
  },
};

await i18n.use(initReactI18next).init({
  resources,

  lng: getInitialLanguage(),

  fallbackLng: "ar",

  supportedLngs: languages.map(({ code }) => code),

  load: "languageOnly",

  interpolation: {
    escapeValue: false,
  },

  returnEmptyString: false,
  returnNull: false,

  parseMissingKeyHandler: (key) => key,

  saveMissing: import.meta.env.DEV,

  missingKeyHandler: (_languages, _namespace, key) => {
    if (import.meta.env.DEV && normalizeLanguage(i18n.language) !== "ar") {
      console.warn(`[i18n] Missing translation: ${key}`);
    }
  },
});

export function getLanguageDirection(language) {
  return normalizeLanguage(language) === "ar" ? "rtl" : "ltr";
}

function applyDocumentLanguage(language) {
  const normalizedLanguage = normalizeLanguage(language);

  const direction = getLanguageDirection(normalizedLanguage);

  if (typeof document !== "undefined") {
    document.documentElement.lang = normalizedLanguage;

    document.documentElement.dir = direction;

    document.documentElement.dataset.language = normalizedLanguage;

    if (document.body) {
      document.body.lang = normalizedLanguage;

      document.body.dir = direction;
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, normalizedLanguage);
  } catch {
    // تجاهل خطأ التخزين.
  }
}

export async function changeAppLanguage(language) {
  const normalizedLanguage = normalizeLanguage(language);

  await i18n.changeLanguage(normalizedLanguage);
}

export function getCurrentLanguage() {
  return normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || getInitialLanguage(),
  );
}

applyDocumentLanguage(getCurrentLanguage());

i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
