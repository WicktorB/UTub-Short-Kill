// Contrôle statique : syntaxe JS (source + bundles) + validité du manifest buildé.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const JS_FILES = [
  "src/core/config.js",
  "src/core/app.js",
  "src/platform/storage-extension.js",
  "src/platform/storage-userscript.js",
  "src/entry/extension.js",
  "src/entry/userscript.js",
  "build/build.mjs",
  "dist/utub-short-kill.user.js",
  "dist/extension/content.js",
  "tools/diagnose.js",
  "tests/check.mjs",
  "tests/_server.mjs",
  "tests/extension.test.mjs",
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

console.log("[check] dist/extension/manifest.json");
try {
  const m = JSON.parse(readFileSync(join(ROOT, "dist/extension/manifest.json"), "utf8"));
  if (m.manifest_version !== 3) throw new Error("manifest_version doit valoir 3");
  if (!m.content_scripts || !m.content_scripts.length) throw new Error("content_scripts manquant");
  if (m.content_scripts[0].js[0] !== "content.js") throw new Error("content.js attendu");
  console.log("  ✓ manifest.json (v" + m.version + ")");
} catch (e) {
  console.log("  ✗ manifest.json — " + e.message);
  failures++;
}

// YouTube impose les Trusted Types : toute assignation via innerHTML échoue.
console.log("[check] pas de .innerHTML (incompatible Trusted Types de YouTube)");
for (const f of ["src/core/app.js", "dist/utub-short-kill.user.js", "dist/extension/content.js"]) {
  const txt = readFileSync(join(ROOT, f), "utf8");
  if (/\.innerHTML\b/.test(txt)) {
    console.log("  ✗ innerHTML interdit dans " + f);
    failures++;
  } else {
    console.log("  ✓ " + f);
  }
}

console.log(failures === 0 ? "\n[check] OK ✅" : "\n[check] " + failures + " échec(s) ❌");
process.exit(failures === 0 ? 0 : 1);
