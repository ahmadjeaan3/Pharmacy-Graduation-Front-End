import { useEffect } from "react";

import i18n, { normalizeLanguage } from "./i18n";

const arabicText = /[\u0600-\u06ff]/;
const translatedTextNodes = new WeakMap();
const translatedAttributes = new WeakMap();
const translatableAttributes = ["aria-label", "placeholder", "title"];

function splitWhitespace(value) {
  const match = String(value).match(/^(\s*)([\s\S]*?)(\s*)$/);
  return {
    leading: match?.[1] ?? "",
    content: match?.[2] ?? value,
    trailing: match?.[3] ?? "",
  };
}

function translateValue(value, language) {
  if (!arabicText.test(value)) return value;
  const { leading, content, trailing } = splitWhitespace(value);
  const key = content.trim();
  if (!key) return value;

  const translated = i18n.t(key, { lng: language, defaultValue: key });
  return translated === key ? value : `${leading}${translated}${trailing}`;
}

function shouldIgnore(node) {
  return Boolean(
    node.parentElement?.closest(
      "script, style, code, pre, [data-i18n-ignore='true']",
    ),
  );
}

function translateTree(root, language) {
  const isArabic = language === "ar";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (!shouldIgnore(node)) {
      const savedValue = translatedTextNodes.get(node);

      if (isArabic && savedValue != null) {
        if (node.nodeValue !== savedValue) node.nodeValue = savedValue;
        translatedTextNodes.delete(node);
      } else if (!isArabic) {
        const source = savedValue ?? node.nodeValue;
        const translated = translateValue(source, language);
        if (translated !== source) {
          if (savedValue == null) translatedTextNodes.set(node, source);
          if (node.nodeValue !== translated) node.nodeValue = translated;
        }
      }
    }
    node = walker.nextNode();
  }

  const elements = [
    ...(root.nodeType === Node.ELEMENT_NODE ? [root] : []),
    ...root.querySelectorAll("*"),
  ];

  for (const element of elements) {
    if (element.closest("[data-i18n-ignore='true']")) continue;
    const saved = translatedAttributes.get(element) ?? {};

    for (const attribute of translatableAttributes) {
      if (!element.hasAttribute(attribute) && saved[attribute] == null)
        continue;

      if (isArabic && saved[attribute] != null) {
        element.setAttribute(attribute, saved[attribute]);
        delete saved[attribute];
      } else if (!isArabic) {
        const source =
          saved[attribute] ?? element.getAttribute(attribute) ?? "";
        const translated = translateValue(source, language);
        if (translated !== source) {
          saved[attribute] ??= source;
          element.setAttribute(attribute, translated);
        }
      }
    }

    if (Object.keys(saved).length) translatedAttributes.set(element, saved);
    else translatedAttributes.delete(element);
  }
}

export function LegacyTranslationBridge() {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return undefined;

    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        observer.disconnect();
        translateTree(
          root,
          normalizeLanguage(i18n.resolvedLanguage || i18n.language),
        );
        observer.observe(root, {
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: translatableAttributes,
          subtree: true,
        });
      });
    });

    const applyLanguage = (language) => {
      observer.disconnect();
      translateTree(root, normalizeLanguage(language));
      observer.observe(root, {
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: translatableAttributes,
        subtree: true,
      });
    };

    applyLanguage(i18n.resolvedLanguage || i18n.language);
    i18n.on("languageChanged", applyLanguage);

    return () => {
      observer.disconnect();
      i18n.off("languageChanged", applyLanguage);
    };
  }, []);

  return null;
}
