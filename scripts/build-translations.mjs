import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../src", import.meta.url));
const outputFile = path.join(sourceRoot, "shared/i18n/autoMessages.js");
const arabic = /[\u0600-\u06ff]/;
const phrases = new Set();
const patterns = new Set();

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function collect(source) {
  const literalPatterns = [
    /"([^"\r\n]*[\u0600-\u06ff][^"\r\n]*)"/g,
    /'([^'\r\n]*[\u0600-\u06ff][^'\r\n]*)'/g,
    />([^<>{}]*[\u0600-\u06ff][^<>{}]*)</gs,
  ];
  for (const pattern of literalPatterns) {
    for (const match of source.matchAll(pattern)) {
      const phrase = normalize(match[1]);
      if (
        phrase &&
        arabic.test(phrase) &&
        phrase.length <= 300 &&
        !phrase.includes("${") &&
        !phrase.includes("className")
      )
        phrases.add(phrase);
    }
  }
  for (const match of source.matchAll(/`([^`]*[\u0600-\u06ff][^`]*)`/gs)) {
    let index = 0;
    const pattern = normalize(match[1]).replace(
      /\$\{[^}]+\}/g,
      () => `__HAYAT_VALUE_${index++}__`,
    );
    if (
      index > 0 &&
      pattern.length <= 300 &&
      !pattern.includes("className") &&
      !pattern.includes("<")
    )
      patterns.add(pattern);
  }
}

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (
      /\.(jsx?|tsx?)$/.test(entry.name) &&
      entry.name !== "autoMessages.js"
    )
      collect(fs.readFileSync(target, "utf8"));
  }
}

async function translateBatch(values, language) {
  const separator = "\n__HAYAT_TRANSLATION_SEPARATOR__\n";
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "ar");
  url.searchParams.set("tl", language);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", values.join(separator));
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
  const payload = await response.json();
  const translated = payload[0].map((part) => part[0]).join("");
  const parts = translated
    .split(/__HAYAT_TRANSLATION_SEPARATOR__/)
    .map(normalize);
  if (parts.length !== values.length)
    throw new Error(`Unexpected count: ${parts.length}/${values.length}`);
  return parts;
}

async function translateAll(values, language) {
  const translated = [];
  for (let index = 0; index < values.length; index += 20)
    translated.push(
      ...(await translateBatch(values.slice(index, index + 20), language)),
    );
  return Object.fromEntries(
    values.map((value, index) => [value, translated[index]]),
  );
}

visit(sourceRoot);
const values = [...phrases].sort((a, b) => a.localeCompare(b, "ar"));
const patternValues = [...patterns].sort((a, b) => a.localeCompare(b, "ar"));
const allValues = [...values, ...patternValues];
const [english, turkish] = await Promise.all([
  translateAll(allValues, "en"),
  translateAll(allValues, "tr"),
]);
const phraseMessages = {
  en: Object.fromEntries(values.map((value) => [value, english[value]])),
  tr: Object.fromEntries(values.map((value) => [value, turkish[value]])),
};
const dynamicMessages = {
  en: patternValues.map((source) => ({ source, target: english[source] })),
  tr: patternValues.map((source) => ({ source, target: turkish[source] })),
};
fs.writeFileSync(
  outputFile,
  `// Generated from visible Arabic UI copy. Regenerate with npm run translations:build.\nexport const autoMessages = ${JSON.stringify(phraseMessages, null, 2)};\n\nexport const autoPatterns = ${JSON.stringify(dynamicMessages, null, 2)};\n`,
  "utf8",
);
console.log(
  `Generated ${values.length} phrases and ${patternValues.length} dynamic patterns in English and Turkish.`,
);
