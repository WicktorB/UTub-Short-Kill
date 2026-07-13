// Contrôle statique : syntaxe JS + validité du manifest. Aucun navigateur requis.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const JS_FILES = [
  "src/common/defaults.js",
  "src/content/main.js",
  "src/options/options.js",
  "src/popup/popup.js",
  "userscript/utub-short-kill.user.js",
  "tools/diagnose.js",
  "tests/check.mjs",
  "tests/_server.mjs",
  "tests/dom.test.mjs",
  "tests/userscript.test.mjs"
];

let failures = 0;

console.log("[check] syntaxe JS");
for (const f of JS_FILES) {
  try {
    execFileSync(process.execPath, ["--check", join(ROOT, f)], { stdio: "pipe" });
    console.log("  ✓ " + f);
  } catch (e) {
    console.log("  ✗ " + f + "\n" + (e.stderr ? e.stderr.toString() : e.message));
    failures++;
  }
}

console.log("[check] manifest.json");
try {
  const m = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
  if (m.manifest_version !== 3) throw new Error("manifest_version doit valoir 3");
  if (!m.content_scripts || !m.content_scripts.length) throw new Error("content_scripts manquant");
  console.log("  ✓ manifest.json (v" + m.version + ")");
} catch (e) {
  console.log("  ✗ manifest.json — " + e.message);
  failures++;
}

console.log(failures === 0 ? "\n[check] OK ✅" : "\n[check] " + failures + " échec(s) ❌");
process.exit(failures === 0 ? 0 : 1);
