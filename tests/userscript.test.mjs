// Teste le userscript BUILDÉ (dist/) dans un vrai Chromium, sur une origine HTTP
// réelle (localStorage + pushState fonctionnels).
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startServer, FIXTURE, CHROMIUM_EXE } from "./_server.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(join(ROOT, "dist/utub-short-kill.user.js"), "utf8");

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
check("hooks de test exposés", await page.evaluate(() => !!window.__USK_TEST));

console.log("\n[Masquage]");
check("guide Shorts masqué", (await disp("#guide-shorts")) === "none");
check("étagère reel masquée", (await disp("#reel-shelf")) === "none");
check("vignette lockup masquée", (await disp("#lockup")) === "none");
check("short en grille masqué", (await disp("#rich-short")) === "none");
check("vidéo normale visible", (await disp("#vid-normal")) !== "none");

console.log("\n[Bouton ⚙️]");
check("bouton ⚙️ présent", await page.evaluate(() => !!document.getElementById("usk-gear")));
check("bouton ⚙️ visible hors Shorts", (await disp("#usk-gear")) === "flex");

console.log("\n[Réglages persistants]");
await page.evaluate(() => window.__USK_TEST.saveConfig({ unlockMinutes: 9, minAnswerLength: 3 }));
check("config appliquée en mémoire", await page.evaluate(() => window.__USK_TEST.getConfig().unlockMinutes === 9));
check(
  "config persistée dans localStorage",
  await page.evaluate(() => JSON.parse(localStorage.getItem("usk_config")).unlockMinutes === 9)
);
check("loadConfig relit la valeur", await page.evaluate(async () => (await window.__USK_TEST.loadConfig()).unlockMinutes === 9));

console.log("\n[Panneau de réglages]");
await page.evaluate(() => window.__USK_TEST.openSettings());
check("panneau ouvert", await page.evaluate(() => !!document.getElementById("usk-settings")));
check(
  "3 réglages à bascule (confort/réglage fin uniquement)",
  await page.evaluate(() => document.querySelectorAll("#usk-settings input[type=checkbox]").length === 3)
);
check(
  "aucun interrupteur de désactivation de la protection",
  await page.evaluate(() => !/Extension active|Protéger l'accès|Masquer les Shorts/.test(document.getElementById("usk-settings").textContent))
);
await page.evaluate(() => window.__USK_TEST.closeSettings());
check("panneau fermé", await page.evaluate(() => !document.getElementById("usk-settings")));

console.log("\n[Navigation → 3 questions → minuteur]");
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
check("déblocage persisté", await page.evaluate(() => parseInt(localStorage.getItem("usk_unlocked_until") || "0", 10) > Date.now()));
check("minuteur affiché", await page.evaluate(() => !!document.getElementById("usk-timer")));

console.log("\n[Re-verrouillage manuel]");
await page.evaluate(() => {
  window.__USK_TEST.openSettings();
  for (const b of document.querySelectorAll("#usk-settings .usk-btn")) if (/Verrouiller/.test(b.textContent)) b.click();
});
await page.waitForTimeout(150);
check("re-verrouillé → 3 questions ré-affichées", await page.evaluate(() => !!document.getElementById("usk-gate")));

if (errors.length) {
  console.log("\nErreurs :");
  errors.forEach((e) => console.log("   " + e));
}

await browser.close();
await srv.close();
console.log("\n" + (failures === 0 ? "USERSCRIPT (buildé) OK ✅" : failures + " échec(s) ❌"));
process.exit(failures === 0 ? 0 : 1);
