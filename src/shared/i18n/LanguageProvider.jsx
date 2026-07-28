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
