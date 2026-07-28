import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../src", import.meta.url));
const replacements = [
  [/\bml-/g, "me-"],
  [/\bmr-/g, "ms-"],
  [/\bpl-/g, "pe-"],
  [/\bpr-/g, "ps-"],
  [/\btext-right\b/g, "text-start"],
];
const repairExisting = process.argv.includes("--repair");
let changed = 0;

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (/\.(jsx?|tsx?|css)$/.test(entry.name)) {
      const original = fs.readFileSync(target, "utf8");
      let source = original;
      if (repairExisting) {
        source = source
          .replace(/\bms-/g, "__HAYAT_MS__")
          .replace(/\bme-/g, "ms-")
          .replace(/__HAYAT_MS__/g, "me-")
          .replace(/\bps-/g, "__HAYAT_PS__")
          .replace(/\bpe-/g, "ps-")
          .replace(/__HAYAT_PS__/g, "pe-");
      }
      const output = replacements.reduce(
        (value, [pattern, replacement]) => value.replace(pattern, replacement),
        source,
      );
      if (output !== original) {
        fs.writeFileSync(target, output, "utf8");
        changed += 1;
      }
    }
  }
}

visit(sourceRoot);
console.log(`Updated ${changed} files to use logical direction utilities.`);
