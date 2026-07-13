// Build : génère le userscript ET l'extension depuis la source unique (src/).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const VERSION = pkg.version;
const RAW = "https://raw.githubusercontent.com/WicktorB/YouTube-Short-Kill/main/dist/utub-short-kill.user.js";

const banner = [
  "// ==UserScript==",
  "// @name         UTub Short Kill",
  "// @namespace    utub-short-kill",
  "// @version      " + VERSION,
  "// @description  Masque les YouTube Shorts (sauf sur les chaînes) et protège leur accès par 3 questions, avec minuteur et panneau de réglages.",
  "// @author       victor",
  "// @match        *://*.youtube.com/*",
  "// @match        *://youtube.com/*",
  "// @run-at       document-start",
  "// @grant        none",
  "// @downloadURL  " + RAW,
  "// @updateURL    " + RAW,
  "// ==/UserScript=="
].join("\n");

const common = {
  bundle: true,
  format: "iife",
  target: ["chrome90", "firefox90", "safari14"],
  loader: { ".css": "text" },
  legalComments: "none",
  logLevel: "warning"
};

rmSync(join(ROOT, "dist"), { recursive: true, force: true });
mkdirSync(join(ROOT, "dist/extension/icons"), { recursive: true });

// 1) Userscript
await build({
  ...common,
  entryPoints: [join(ROOT, "src/entry/userscript.js")],
  outfile: join(ROOT, "dist/utub-short-kill.user.js"),
  banner: { js: banner }
});

// 2) Extension (content script)
await build({
  ...common,
  entryPoints: [join(ROOT, "src/entry/extension.js")],
  outfile: join(ROOT, "dist/extension/content.js")
});

// 3) Manifest de l'extension (version synchronisée avec package.json)
const manifest = {
  manifest_version: 3,
  name: "UTub Short Kill",
  version: VERSION,
  description: "Masque les YouTube Shorts (sauf sur les chaînes) et protège leur accès par 3 questions.",
  icons: { 48: "icons/icon-48.png", 128: "icons/icon-128.png" },
  content_scripts: [
    {
      matches: ["*://*.youtube.com/*", "*://youtube.com/*"],
      run_at: "document_start",
      all_frames: false,
      js: ["content.js"]
    }
  ],
  browser_specific_settings: { gecko: { id: "utub-short-kill@victor.bauchet", strict_min_version: "115.0" } }
};
writeFileSync(join(ROOT, "dist/extension/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// 4) Icônes
cpSync(join(ROOT, "icons/icon-48.png"), join(ROOT, "dist/extension/icons/icon-48.png"));
cpSync(join(ROOT, "icons/icon-128.png"), join(ROOT, "dist/extension/icons/icon-128.png"));

console.log("build OK — v" + VERSION);
console.log("  dist/utub-short-kill.user.js");
console.log("  dist/extension/ (manifest.json + content.js + icons)");
