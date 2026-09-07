import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { autoPatterns } from "../src/shared/i18n/autoMessages.js";
import i18n from "../src/shared/i18n/i18n.js";

const sourceRoot = fileURLToPath(new URL("../src", import.meta.url));
const scanRoot = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : sourceRoot;
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

  for (const expression of literalPatterns) {
    for (const match of source.matchAll(expression)) {
      const phrase = normalize(match[1]);
      if (
        phrase &&
        phrase.length <= 300 &&
        !phrase.includes("${") &&
        !phrase.includes("className")
      ) {
        phrases.add(phrase);
      }
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
      arabic.test(pattern) &&
      pattern.length <= 300 &&
      !pattern.includes("className")
    ) {
      patterns.add(pattern);
    }
  }
}

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (/\.(jsx?|tsx?)$/.test(entry.name) && entry.name !== "autoMessages.js") {
      collect(fs.readFileSync(target, "utf8"));
    }
  }
}

visit(scanRoot);

let failed = false;
for (const language of ["en", "tr"]) {
  const translatedPatterns = new Set(
    (autoPatterns[language] || []).map(({ source }) => source),
  );
  const missingPhrases = [...phrases].filter(
    (phrase) => !i18n.exists(phrase, { lng: language }),
  );
  const missingPatterns = [...patterns].filter(
    (pattern) => !translatedPatterns.has(pattern),
  );

  if (missingPhrases.length || missingPatterns.length) {
    failed = true;
    console.error(`Missing ${language} translations:`);
    for (const value of [...missingPhrases, ...missingPatterns]) {
      console.error(`- ${value}`);
    }
  }
}

if (failed) process.exitCode = 1;
else console.log(`Translation coverage OK: ${phrases.size} phrases, ${patterns.size} patterns.`);
