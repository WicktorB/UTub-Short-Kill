// Teste le content script BUILDÉ de l'extension (dist/extension/content.js).
// Sans `chrome` dans la page, l'adaptateur de stockage no-op et le cœur tourne
// avec les réglages par défaut — on vérifie le comportement (masquage, garde…).
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startServer, FIXTURE, CHROMIUM_EXE } from "./_server.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(join(ROOT, "dist/extension/content.js"), "utf8");

let failures = 0;
const errors = [];
function check(name, cond) {
  console.log((cond ? "  ✓ " : "  ✗ ") + name);
  if (!cond) failures++;
}

const srv = await startServer(FIXTURE);
const browser = await chromium.launch({ executablePath: CHROMIUM_EXE, args: ["--no-sandbox"] });
const page = await browser.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto(srv.url);
await page.addScriptTag({ content: script });
await page.waitForTimeout(300);

const disp = (sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? getComputedStyle(el).display : "MISSING";
  }, sel);

console.log("\n[Chargement]");
check("aucune erreur JS", errors.length === 0);
check("CSS injecté", await page.evaluate(() => !!document.getElementById("usk-style")));
check("cœur initialisé (hooks)", await page.evaluate(() => !!window.__USK_TEST));

console.log("\n[Chemins]");
const paths = await page.evaluate(() => {
  const t = window.__USK_TEST;
  return {
    a: t.isShortsPath("/shorts/abc"),
    b: t.isChannelPath("/@foo/shorts"),
    c: t.isChannelPath("/results"),
    d: t.shortsIdFromPath("/shorts/abc123?x=1"),
    e: t.formatTime(65)
  };
});
check("isShortsPath /shorts", paths.a === true);
check("isChannelPath /@foo/shorts", paths.b === true);
check("isChannelPath /results = false", paths.c === false);
check("shortsIdFromPath -> abc123", paths.d === "abc123");
check("formatTime 65 -> 1:05", paths.e === "1:05");

console.log("\n[Masquage — hors chaîne]");
check("guide Shorts masqué", (await disp("#guide-shorts")) === "none");
check("guide Accueil visible", (await disp("#guide-home")) !== "none");
check("étagère reel masquée", (await disp("#reel-shelf")) === "none");
check("vignette lockup masquée", (await disp("#lockup")) === "none");
check("short en grille masqué", (await disp("#rich-short")) === "none");
check("section Shorts masquée", (await disp("#rich-section")) === "none");
check("vidéo en grille visible", (await disp("#rich-normal")) !== "none");

console.log("\n[Exception chaîne]");
// L'étagère reel est masquée par CSS uniquement (pas par la classe JS) : c'est
// le bon témoin pour vérifier la règle :not([data-usk-channel]).
await page.evaluate(() => document.documentElement.setAttribute("data-usk-channel", "1"));
check("étagère reel visible sur chaîne (CSS)", (await disp("#reel-shelf")) !== "none");
await page.evaluate(() => document.documentElement.removeAttribute("data-usk-channel"));

console.log("\n[Bouton ⚙️ + navigation → 3 questions]");
check("bouton ⚙️ présent", await page.evaluate(() => !!document.getElementById("usk-gear")));
await page.evaluate(() => history.pushState({}, "", "/shorts/xyz"));
await page.waitForTimeout(200);
check("fenêtre 3 questions affichée", await page.evaluate(() => !!document.getElementById("usk-gate")));
check("3 questions", await page.evaluate(() => document.querySelectorAll("#usk-gate textarea").length === 3));
check("bouton ⚙️ masqué sur un Short", (await disp("#usk-gear")) === "none");

await page.evaluate(() => {
  document.querySelectorAll("#usk-gate textarea").forEach((t) => {
    t.value = "réponse assez longue";
    t.dispatchEvent(new Event("input"));
  });
  document.querySelector("#usk-gate form").dispatchEvent(new Event("submit", { cancelable: true }));
});
await page.waitForTimeout(150);
check("gate retiré après déblocage", await page.evaluate(() => !document.getElementById("usk-gate")));
check("minuteur affiché sur un Short débloqué", await page.evaluate(() => !!document.getElementById("usk-timer")));

if (errors.length) {
  console.log("\nErreurs :");
  errors.forEach((e) => console.log("   " + e));
}

await browser.close();
await srv.close();
console.log("\n" + (failures === 0 ? "EXTENSION (buildée) OK ✅" : failures + " échec(s) ❌"));
process.exit(failures === 0 ? 0 : 1);
