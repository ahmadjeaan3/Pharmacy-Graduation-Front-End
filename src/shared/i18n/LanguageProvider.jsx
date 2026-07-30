/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from "react";
import { autoMessages, autoPatterns } from "./autoMessages";

const STORAGE_KEY = "hayat-dawaiya-language";
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const translatableAttributes = [
  "placeholder",
  "aria-label",
  "title",
  "alt",
  "data-label",
];
const compiledPatterns = Object.fromEntries(
  Object.entries(autoPatterns).map(([language, patterns]) => [
    language,
    patterns.map(({ source, target }) => {
      const parts = source.split(/(__HAYAT_VALUE_\d+__)/g);
      const expression = parts
        .map((part) =>
          /^__HAYAT_VALUE_\d+__$/.test(part)
            ? "(.*?)"
            : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        )
        .join("");
      return { expression: new RegExp(`^${expression}$`), target };
    }),
  ]),
);

export const languages = [
  { code: "ar", label: "العربية", shortLabel: "ع" },
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "tr", label: "Türkçe", shortLabel: "TR" },
];

const messages = {
  en: {
    "حياة دوائية": "Medical Life",
    الخدمات: "Services",
    "كيف تعمل المنصة": "How it works",
    "لمن المنصة؟": "Who is it for?",
    الأمان: "Security",
    "تسجيل الدخول": "Sign in",
    "إنشاء حساب": "Create account",
    الدخول: "Sign in",
    "حساب جديد": "New account",
    "التنقل الرئيسي": "Main navigation",
    "فتح القائمة": "Open menu",
    "إغلاق القائمة": "Close menu",
    "نظرة عامة": "Overview",
    الإشعارات: "Notifications",
    الإعدادات: "Settings",
    "القائمة الرئيسية": "Main menu",
    "تسجيل الخروج": "Sign out",
    "مرحباً بعودتك، {{name}}": "Welcome back, {{name}}",
    "لوحة {{role}}": "{{role}} dashboard",
    "حساب {{role}}": "{{role}} account",
    "{{count}} حساب نشط": "{{count}} active accounts",
    "{{count}} معتمدة": "{{count}} approved",
    "{{count}} نشطة": "{{count}} active",
    المستخدم: "User",
    الصيدلية: "Pharmacy",
    المنظمة: "Organization",
    الإدارة: "Administration",
    "البحث عن دواء": "Find medicine",
    "المساعد الدوائي": "Medicine assistant",
    طلباتي: "My requests",
    "التبرعات والمساعدة": "Donations & assistance",
    "المنظمات والحملات": "Organizations & campaigns",
    "ملفي الصحي": "My health profile",
    "سجل البحث": "Search history",
    المخزون: "Inventory",
    "طلبات الأدوية": "Medicine requests",
    "الملف والموقع": "Profile & location",
    "ساعات العمل": "Working hours",
    الحملات: "Campaigns",
    "عروض التبرع": "Donation offers",
    "طلبات المساعدة": "Assistance requests",
    "الملف والتحقق": "Profile & verification",
    "طلبات الاعتماد": "Approval requests",
    "دليل الأدوية": "Medicine catalog",
    "تحقق التبرعات": "Donation verification",
    "التحقق من التبرعات الدوائية": "Medicine donation verification",
    "شبكة تبرع آمنة": "Safe donation network",
    "صيدلية التحقق والاستلام": "Verification and receiving pharmacy",
    "اختر صيدلية قريبة ومعتمدة": "Choose a nearby approved pharmacy",
    "اختر الصيدلية التي ستسلّمها الدواء":
      "Choose the pharmacy where you will deliver the medicine",
    "بانتظار تحقق الصيدلية": "Awaiting pharmacy verification",
    "وافقت الصيدلية — بانتظار التسليم": "Pharmacy approved — awaiting delivery",
    "رفضت الصيدلية": "Rejected by pharmacy",
    "استلمت الصيدلية ووثّقت الدواء": "Received and verified by pharmacy",
    "صيدلية التحقق": "Verification pharmacy",
    "حالة تحقق الصيدلية": "Pharmacy verification status",
    "ملاحظة الصيدلية": "Pharmacy note",
    "توثيق الصيدلية": "Pharmacy verification",
    "تم الاستلام والتحقق": "Received and verified",
    "كيف تصل التبرعات إلى الجمعية؟": "How do donations reach the organization?",
    "1. تسجيل المستخدم": "1. User submission",
    "2. تحقق الصيدلية": "2. Pharmacy verification",
    "3. مراجعة الجمعية": "3. Organization review",
    "4. الاستلام والتوزيع": "4. Receipt and distribution",
    "المسار والموقع ضمن المنصة": "Route and location inside the platform",
    "الخريطة داخل منصة حياة دوائية": "Map inside Medical Life",
    "داخل الخريطة": "On the map",
    "متوفر الآن": "Available now",
    "صيدليات يتوفر لديها الدواء": "Pharmacies with this medicine",
    "المسار: المستخدم ← الصيدلية للتحقق ← الجمعية للمراجعة والتوزيع":
      "Flow: user → pharmacy verification → organization review and distribution",
    "قبول مبدئي وتحديد التسليم": "Initial approval and delivery arrangement",
    "رفض بعد الفحص": "Reject after inspection",
    "تأكيد الاستلام والتوثيق": "Confirm receipt and verification",
    "تم إرسال العرض إلى الصيدلية المختارة للتحقق من العبوة والصلاحية. لن يظهر للجمعية قبل توثيقه.":
      "The offer was sent to the selected pharmacy to inspect the package and expiry date. It will not appear to the organization until it is verified.",
    "تستلم الصيدلية الدواء منك، وتفحص سلامة العبوة والصلاحية، ثم تحوّل العرض الموثق إلى الجمعية. لا يوجد تسليم مباشر بين مستخدمين.":
      "The pharmacy receives the medicine from you, checks the package and expiry date, then forwards the verified offer to the organization. There is no direct user-to-user handoff.",
    "تعذر تحميل الصيدليات. حدّث موقعك ثم أعد المحاولة.":
      "Pharmacies could not be loaded. Update your location and try again.",
    "استلم الدواء من المتبرع، افحص سلامة العبوة والصلاحية، ثم وثّق الاستلام ليظهر العرض للجمعية المستفيدة.":
      "Receive the medicine from the donor, inspect the package and expiry date, then verify receipt so the offer appears to the beneficiary organization.",
    "تواصل واستلام": "Contact and receipt",
    "فحص مهني": "Professional inspection",
    "تحويل للجمعية": "Forward to organization",
    "تتواصل الصيدلية مع المتبرع وتستلم الدواء فقط داخل مسار موثق.":
      "The pharmacy contacts the donor and receives the medicine only through a documented workflow.",
    "تأكد من الإغلاق، الصلاحية، التخزين وسلامة العبوة.":
      "Check the seal, expiry date, storage conditions, and package integrity.",
    "بعد توثيق الاستلام يظهر العرض للجمعية لتقرر القبول والتوزيع.":
      "After receipt is verified, the offer appears to the organization for acceptance and distribution.",
    "لا توجد عروض بانتظار الصيدلية": "No offers are awaiting pharmacy review",
    "عندما يختار مستخدم صيدليتك للتحقق من تبرعه سيظهر العرض هنا.":
      "When a user selects your pharmacy to verify a donation, the offer will appear here.",
    "ملاحظة التحقق أو سبب الرفض": "Verification note or rejection reason",
    "دوّن نتيجة فحص العبوة والصلاحية وحالة التخزين":
      "Record the package, expiry, and storage inspection result",
    "اختر العلامة على الخريطة أو افتح صفحة الصيدلية من هنا دون مغادرة المنصة.":
      "Select a map marker or open the pharmacy page without leaving the platform.",
    "عرض الصيدلية داخل المنصة": "View pharmacy inside the platform",
    "سبب إيقاف الحساب": "Account suspension reason",
    "ملاحظة إعادة التفعيل (اختياري)": "Reactivation note (optional)",
    "اكتب سببًا واضحًا لصاحب الحساب (10 أحرف على الأقل)":
      "Write a clear reason for the account owner (at least 10 characters)",
    "اكتب ملاحظة توضيحية لصاحب الحساب إن لزم":
      "Add a clarification for the account owner if needed",
    "سيصل إشعار إلى صاحب الحساب يوضح القرار وملاحظة الإدارة.":
      "The account owner will receive a notification explaining the decision and administration note.",
    "تم تحديث حالة الحساب وإرسال إشعار إلى صاحبه بنجاح.":
      "The account status was updated and its owner was notified successfully.",
    "حالة الحساب": "Account status",
    "تحديث حالة الحساب": "Account status update",
    "الذهاب إلى الصيدلية": "Go to pharmacy",
    "إخفاء مسار الوصول": "Hide route",
    "جاري تجهيز مسار الوصول داخل المنصة...":
      "Preparing the route inside the platform...",
    "جاري تحميل خريطة الصيدلية...": "Loading the pharmacy map...",
    "مسار الوصول إلى الصيدلية": "Route to the pharmacy",
    "حدّث موقعك لعرض الصيدليات القريبة":
      "Update your location to view nearby pharmacies",
    "تعذر تحميل الصيدليات لأن موقعك غير محدد أو غير محدث.":
      "Pharmacies could not be loaded because your location is missing or outdated.",
    "اسمح للمتصفح بتحديد موقعك، وستُحدّث القائمة تلقائيًا.":
      "Allow the browser to access your location; the list will update automatically.",
    "لا توجد صيدليات معتمدة ضمن النطاق الحالي. حدّث موقعك أو جرّب لاحقًا.":
      "There are no approved pharmacies in the current area. Update your location or try later.",
    "تعذر تحميل صيدليات التحقق": "Verification pharmacies could not be loaded",
    "تعذر تحميل صيدليات التحقق المعتمدة.":
      "Approved verification pharmacies could not be loaded.",
    "أعد المحاولة، ولا يشترط تفعيل الموقع لاختيار الصيدلية.":
      "Try again. Location access is not required to select a pharmacy.",
    "لا توجد صيدليات معتمدة متاحة حاليًا. جرّب لاحقًا أو اطلب من الإدارة اعتماد صيدلية.":
      "No approved pharmacies are currently available. Try later or ask the administration to approve a pharmacy.",
    اللغة: "Language",
  },
  tr: {
    "حياة دوائية": "Medikal Yaşam",
    الخدمات: "Hizmetler",
    "كيف تعمل المنصة": "Nasıl çalışır?",
    "لمن المنصة؟": "Kimler için?",
    الأمان: "Güvenlik",
    "تسجيل الدخول": "Giriş yap",
    "إنشاء حساب": "Hesap oluştur",
    الدخول: "Giriş",
    "حساب جديد": "Yeni hesap",
    "التنقل الرئيسي": "Ana gezinme",
    "فتح القائمة": "Menüyü aç",
    "إغلاق القائمة": "Menüyü kapat",
    "نظرة عامة": "Genel bakış",
    الإشعارات: "Bildirimler",
    الإعدادات: "Ayarlar",
    "القائمة الرئيسية": "Ana menü",
    "تسجيل الخروج": "Çıkış yap",
    "مرحباً بعودتك، {{name}}": "Tekrar hoş geldin, {{name}}",
    "لوحة {{role}}": "{{role}} paneli",
    "حساب {{role}}": "{{role}} hesabı",
    "{{count}} حساب نشط": "{{count}} aktif hesap",
    "{{count}} معتمدة": "{{count}} onaylı",
    "{{count}} نشطة": "{{count}} aktif",
    المستخدم: "Kullanıcı",
    الصيدلية: "Eczane",
    المنظمة: "Kuruluş",
    الإدارة: "Yönetim",
    "البحث عن دواء": "İlaç ara",
    "المساعد الدوائي": "İlaç asistanı",
    طلباتي: "Taleplerim",
    "التبرعات والمساعدة": "Bağış ve yardım",
    "المنظمات والحملات": "Kuruluşlar ve kampanyalar",
    "ملفي الصحي": "Sağlık profilim",
    "سجل البحث": "Arama geçmişi",
    المخزون: "Stok",
    "طلبات الأدوية": "İlaç talepleri",
    "الملف والموقع": "Profil ve konum",
    "ساعات العمل": "Çalışma saatleri",
    الحملات: "Kampanyalar",
    "عروض التبرع": "Bağış teklifleri",
    "طلبات المساعدة": "Yardım talepleri",
    "الملف والتحقق": "Profil ve doğrulama",
    "طلبات الاعتماد": "Onay talepleri",
    "دليل الأدوية": "İlaç kataloğu",
    "تحقق التبرعات": "Bağış doğrulama",
    "التحقق من التبرعات الدوائية": "İlaç bağışı doğrulama",
    "شبكة تبرع آمنة": "Güvenli bağış ağı",
    "صيدلية التحقق والاستلام": "Doğrulama ve teslim eczanesi",
    "اختر صيدلية قريبة ومعتمدة": "Yakındaki onaylı bir eczaneyi seçin",
    "اختر الصيدلية التي ستسلّمها الدواء":
      "İlacı teslim edeceğiniz eczaneyi seçin",
    "بانتظار تحقق الصيدلية": "Eczane doğrulaması bekleniyor",
    "وافقت الصيدلية — بانتظار التسليم": "Eczane onayladı — teslimat bekleniyor",
    "رفضت الصيدلية": "Eczane tarafından reddedildi",
    "استلمت الصيدلية ووثّقت الدواء": "Eczane teslim aldı ve doğruladı",
    "صيدلية التحقق": "Doğrulama eczanesi",
    "حالة تحقق الصيدلية": "Eczane doğrulama durumu",
    "ملاحظة الصيدلية": "Eczane notu",
    "توثيق الصيدلية": "Eczane doğrulaması",
    "تم الاستلام والتحقق": "Teslim alındı ve doğrulandı",
    "كيف تصل التبرعات إلى الجمعية؟": "Bağışlar kuruluşa nasıl ulaşır?",
    "1. تسجيل المستخدم": "1. Kullanıcı kaydı",
    "2. تحقق الصيدلية": "2. Eczane doğrulaması",
    "3. مراجعة الجمعية": "3. Kuruluş incelemesi",
    "4. الاستلام والتوزيع": "4. Teslim alma ve dağıtım",
    "المسار والموقع ضمن المنصة": "Rota ve konum platform içinde",
    "الخريطة داخل منصة حياة دوائية": "Harita Medikal Yaşam içinde",
    "داخل الخريطة": "Haritada",
    "متوفر الآن": "Şu anda mevcut",
    "صيدليات يتوفر لديها الدواء": "İlacın bulunduğu eczaneler",
    "المسار: المستخدم ← الصيدلية للتحقق ← الجمعية للمراجعة والتوزيع":
      "Akış: kullanıcı → eczane doğrulaması → kuruluş incelemesi ve dağıtım",
    "قبول مبدئي وتحديد التسليم": "Ön onay ve teslimat planlama",
    "رفض بعد الفحص": "İnceleme sonrası reddet",
    "تأكيد الاستلام والتوثيق": "Teslim alma ve doğrulamayı onayla",
    "تم إرسال العرض إلى الصيدلية المختارة للتحقق من العبوة والصلاحية. لن يظهر للجمعية قبل توثيقه.":
      "Teklif, ambalaj ve son kullanma tarihi kontrolü için seçilen eczaneye gönderildi. Doğrulanmadan kuruluşa gösterilmeyecek.",
    "تستلم الصيدلية الدواء منك، وتفحص سلامة العبوة والصلاحية، ثم تحوّل العرض الموثق إلى الجمعية. لا يوجد تسليم مباشر بين مستخدمين.":
      "Eczane ilacı sizden teslim alır, ambalajı ve son kullanma tarihini kontrol eder, ardından doğrulanmış teklifi kuruluşa iletir. Kullanıcılar arasında doğrudan teslimat yoktur.",
    "تعذر تحميل الصيدليات. حدّث موقعك ثم أعد المحاولة.":
      "Eczaneler yüklenemedi. Konumunuzu güncelleyip tekrar deneyin.",
    "استلم الدواء من المتبرع، افحص سلامة العبوة والصلاحية، ثم وثّق الاستلام ليظهر العرض للجمعية المستفيدة.":
      "İlacı bağışçıdan teslim alın, ambalajı ve son kullanma tarihini kontrol edin, ardından teklifin yararlanıcı kuruluşa görünmesi için teslimatı doğrulayın.",
    "تواصل واستلام": "İletişim ve teslim alma",
    "فحص مهني": "Profesyonel inceleme",
    "تحويل للجمعية": "Kuruluşa iletme",
    "تتواصل الصيدلية مع المتبرع وتستلم الدواء فقط داخل مسار موثق.":
      "Eczane bağışçıyla iletişim kurar ve ilacı yalnızca kayıtlı iş akışı üzerinden teslim alır.",
    "تأكد من الإغلاق، الصلاحية، التخزين وسلامة العبوة.":
      "Mühür, son kullanma tarihi, saklama koşulları ve ambalaj bütünlüğünü kontrol edin.",
    "بعد توثيق الاستلام يظهر العرض للجمعية لتقرر القبول والتوزيع.":
      "Teslimat doğrulandıktan sonra teklif, kabul ve dağıtım kararı için kuruluşa görünür.",
    "لا توجد عروض بانتظار الصيدلية": "Eczane incelemesi bekleyen teklif yok",
    "عندما يختار مستخدم صيدليتك للتحقق من تبرعه سيظهر العرض هنا.":
      "Bir kullanıcı bağış doğrulaması için eczanenizi seçtiğinde teklif burada görünür.",
    "ملاحظة التحقق أو سبب الرفض": "Doğrulama notu veya ret nedeni",
    "دوّن نتيجة فحص العبوة والصلاحية وحالة التخزين":
      "Ambalaj, son kullanma tarihi ve saklama inceleme sonucunu kaydedin",
    "اختر العلامة على الخريطة أو افتح صفحة الصيدلية من هنا دون مغادرة المنصة.":
      "Platformdan ayrılmadan harita işaretini seçin veya eczane sayfasını açın.",
    "عرض الصيدلية داخل المنصة": "Eczaneyi platform içinde görüntüle",
    "سبب إيقاف الحساب": "Hesabı askıya alma nedeni",
    "ملاحظة إعادة التفعيل (اختياري)":
      "Yeniden etkinleştirme notu (isteğe bağlı)",
    "اكتب سببًا واضحًا لصاحب الحساب (10 أحرف على الأقل)":
      "Hesap sahibi için açık bir neden yazın (en az 10 karakter)",
    "اكتب ملاحظة توضيحية لصاحب الحساب إن لزم":
      "Gerekirse hesap sahibi için açıklayıcı bir not ekleyin",
    "سيصل إشعار إلى صاحب الحساب يوضح القرار وملاحظة الإدارة.":
      "Hesap sahibine kararı ve yönetim notunu açıklayan bir bildirim gönderilecektir.",
    "تم تحديث حالة الحساب وإرسال إشعار إلى صاحبه بنجاح.":
      "Hesap durumu güncellendi ve hesap sahibine başarıyla bildirim gönderildi.",
    "حالة الحساب": "Hesap durumu",
    "تحديث حالة الحساب": "Hesap durumu güncellemesi",
    "الذهاب إلى الصيدلية": "Eczaneye git",
    "إخفاء مسار الوصول": "Rotayı gizle",
    "جاري تجهيز مسار الوصول داخل المنصة...":
      "Platform içindeki rota hazırlanıyor...",
    "جاري تحميل خريطة الصيدلية...": "Eczane haritası yükleniyor...",
    "مسار الوصول إلى الصيدلية": "Eczaneye ulaşım rotası",
    "حدّث موقعك لعرض الصيدليات القريبة":
      "Yakındaki eczaneleri görmek için konumunuzu güncelleyin",
    "تعذر تحميل الصيدليات لأن موقعك غير محدد أو غير محدث.":
      "Konumunuz eksik veya güncel olmadığı için eczaneler yüklenemedi.",
    "اسمح للمتصفح بتحديد موقعك، وستُحدّث القائمة تلقائيًا.":
      "Tarayıcının konumunuza erişmesine izin verin; liste otomatik olarak güncellenecektir.",
    "لا توجد صيدليات معتمدة ضمن النطاق الحالي. حدّث موقعك أو جرّب لاحقًا.":
      "Mevcut bölgede onaylı eczane yok. Konumunuzu güncelleyin veya daha sonra tekrar deneyin.",
    "تعذر تحميل صيدليات التحقق": "Doğrulama eczaneleri yüklenemedi",
    "تعذر تحميل صيدليات التحقق المعتمدة.":
      "Onaylı doğrulama eczaneleri yüklenemedi.",
    "أعد المحاولة، ولا يشترط تفعيل الموقع لاختيار الصيدلية.":
      "Tekrar deneyin. Eczane seçmek için konum erişimi gerekli değildir.",
    "لا توجد صيدليات معتمدة متاحة حاليًا. جرّب لاحقًا أو اطلب من الإدارة اعتماد صيدلية.":
      "Şu anda onaylı eczane bulunmuyor. Daha sonra deneyin veya yönetimden bir eczaneyi onaylamasını isteyin.",
    اللغة: "Dil",
  },
};

export const LanguageContext = createContext(null);

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function translatedValue(value, language) {
  const normalized = normalizeText(value);
  const direct =
    messages[language]?.[normalized] || autoMessages[language]?.[normalized];
  if (direct) return direct;
  for (const pattern of compiledPatterns[language] || []) {
    const match = normalized.match(pattern.expression);
    if (!match) continue;
    let translated = pattern.target;
    match.slice(1).forEach((replacement, index) => {
      translated = translated.replaceAll(
        `__HAYAT_VALUE_${index}__`,
        replacement,
      );
    });
    return translated;
  }
  return normalized;
}

function localizeTextNode(node, language) {
  const current = node.nodeValue || "";
  const saved = originalText.get(node);
  const source = saved || current;
  const normalized = normalizeText(source);
  if (!normalized || (!saved && !/[\u0600-\u06ff]/.test(normalized))) return;
  if (!saved) originalText.set(node, source);
  const next =
    language === "ar" ? source : translatedValue(normalized, language);
  const leading = source.match(/^\s*/)?.[0] || "";
  const trailing = source.match(/\s*$/)?.[0] || "";
  const rendered = language === "ar" ? next : `${leading}${next}${trailing}`;
  if (current !== rendered) node.nodeValue = rendered;
}

function localizeElement(element, language) {
  let saved = originalAttributes.get(element);
  for (const attribute of translatableAttributes) {
    if (!element.hasAttribute?.(attribute)) continue;
    const current = element.getAttribute(attribute) || "";
    const original = saved?.[attribute];
    const source = original || current;
    if (!original && !/[\u0600-\u06ff]/.test(source)) continue;
    if (!saved) {
      saved = {};
      originalAttributes.set(element, saved);
    }
    if (!original) saved[attribute] = source;
    const next = language === "ar" ? source : translatedValue(source, language);
    if (current !== next) element.setAttribute(attribute, next);
  }
}

function localizeTree(root, language) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    localizeTextNode(root, language);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(root.tagName)) return;
  localizeElement(root, language);
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  );
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node, language);
    else localizeElement(node, language);
    node = walker.nextNode();
  }
}

function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (languages.some(({ code }) => code === stored)) return stored;
  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return languages.some(({ code }) => code === browserLanguage)
    ? browserLanguage
    : "ar";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    const direction = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    const root = document.getElementById("root");
    localizeTree(root, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          localizeTextNode(mutation.target, language);
        } else if (mutation.type === "attributes") {
          localizeElement(mutation.target, language);
        } else {
          mutation.addedNodes.forEach((node) => localizeTree(node, language));
        }
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => {
    const t = (key, variables = {}) => {
      let value =
        messages[language]?.[key] || autoMessages[language]?.[key] || key;
      Object.entries(variables).forEach(([name, replacement]) => {
        value = value.replaceAll(`{{${name}}}`, replacement ?? "");
      });
      return value;
    };
    return {
      language,
      direction: language === "ar" ? "rtl" : "ltr",
      locale: language === "ar" ? "ar-SY" : language,
      setLanguage,
      t,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
