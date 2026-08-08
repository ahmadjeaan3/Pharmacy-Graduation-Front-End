import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { autoMessages } from "./autoMessages";
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
  const value = String(language)
    .trim()
    .toLowerCase()
    .slice(0, 2);

  const isSupported = languages.some(
    ({ code }) => code === value,
  );

  return isSupported ? value : "ar";
}

function getInitialLanguage() {
  try {
    const storedLanguage =
      localStorage.getItem(STORAGE_KEY);

    if (storedLanguage) {
      return normalizeLanguage(storedLanguage);
    }
  } catch {
    // localStorage غير متاح.
  }

  const browserLanguage =
    typeof navigator !== "undefined"
      ? navigator.language
      : "ar";

  return normalizeLanguage(browserLanguage);
}

const resources = {
 ar: {
  translation: {
    "الخطوة {{step}} من {{total}}":
      "الخطوة {{step}} من {{total}}",

    "بيانات {{account}}":
      "بيانات {{account}}",

    "صورة تسجيل {{account}}":
      "صورة تسجيل {{account}}",

    "إضافة إحداثيات {{owner}}":
      "إضافة إحداثيات {{owner}}",

    "تمت إضافة إحداثيات موقع {{owner}}.":
      "تمت إضافة إحداثيات موقع {{owner}}.",
  },
},

  en: {
    translation: {
      ...autoMessages.en,
      ...landingMessages.en,
    },
  },

  tr: {
    translation: {
      ...autoMessages.tr,
      ...landingMessages.tr,
    },
  },
};

await i18n
  .use(initReactI18next)
  .init({
    resources,

    lng: getInitialLanguage(),

    fallbackLng: "ar",

    supportedLngs: languages.map(
      ({ code }) => code,
    ),

    load: "languageOnly",

    interpolation: {
      escapeValue: false,
    },

    returnEmptyString: false,
    returnNull: false,

    parseMissingKeyHandler: (key) => key,

    saveMissing: import.meta.env.DEV,

    missingKeyHandler: (
      _languages,
      _namespace,
      key,
    ) => {
      if (
        import.meta.env.DEV &&
        normalizeLanguage(i18n.language) !== "ar"
      ) {
        console.warn(
          `[i18n] Missing translation: ${key}`,
        );
      }
    },
  });

export function getLanguageDirection(language) {
  return normalizeLanguage(language) === "ar"
    ? "rtl"
    : "ltr";
}

function applyDocumentLanguage(language) {
  const normalizedLanguage =
    normalizeLanguage(language);

  const direction =
    getLanguageDirection(
      normalizedLanguage,
    );

  if (typeof document !== "undefined") {
    document.documentElement.lang =
      normalizedLanguage;

    document.documentElement.dir =
      direction;

    document.documentElement.dataset.language =
      normalizedLanguage;

    if (document.body) {
      document.body.lang =
        normalizedLanguage;

      document.body.dir =
        direction;
    }
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      normalizedLanguage,
    );
  } catch {
    // تجاهل خطأ التخزين.
  }
}

export async function changeAppLanguage(language) {
  const normalizedLanguage =
    normalizeLanguage(language);

  await i18n.changeLanguage(
    normalizedLanguage,
  );
}

export function getCurrentLanguage() {
  return normalizeLanguage(
    i18n.resolvedLanguage ||
      i18n.language ||
      getInitialLanguage(),
  );
}

applyDocumentLanguage(
  getCurrentLanguage(),
);

i18n.on(
  "languageChanged",
  applyDocumentLanguage,
);

export default i18n;