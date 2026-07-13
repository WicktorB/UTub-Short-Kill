// Tests de l'extension (defaults.js + main.js + CSS) dans un vrai Chromium.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startServer, FIXTURE, CHROMIUM_EXE } from "./_server.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failures = 0;
function check(name, cond) {
  console.log((cond ? "  ✓ " : "  ✗ ") + name);
  if (!cond) failures++;
}

const srv = await startServer(FIXTURE);
const browser = await chromium.launch({ executablePath: CHROMIUM_EXE, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto(srv.url);
await page.addStyleTag({ content: read("src/content/preload.css") });
await page.addStyleTag({ content: read("src/content/shorts.css") });
await page.addStyleTag({ content: read("src/content/gate.css") });
await page.addScriptTag({ content: read("src/common/defaults.js") });
await page.addScriptTag({ content: read("src/content/main.js") });

const disp = (sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? getComputedStyle(el).display : "MISSING";
  }, sel);

console.log("\n[Chemins]");
const paths = await page.evaluate(() => {
  const t = window.USK.__test;
  return {
    a: t.isShortsPath("/shorts/abc"),
    b: t.isShortsPath("/watch?v=abc"),
    c: t.isChannelPath("/@foo"),
    d: t.isChannelPath("/@foo/shorts"),
    e: t.isChannelPath("/results?q=x"),
    f: t.shortsIdFromPath("/shorts/abc123?feature=1")
  };
});
check("isShortsPath /shorts", paths.a === true);
check("isShortsPath /watch", paths.b === false);
check("isChannelPath /@foo", paths.c === true);
check("isChannelPath /@foo/shorts", paths.d === true);
check("isChannelPath /results", paths.e === false);
check("shortsIdFromPath -> abc123", paths.f === "abc123");

console.log("\n[CSS — hors chaîne]");
check("guide Shorts masqué", (await disp("#guide-shorts")) === "none");
check("guide Accueil visible", (await disp("#guide-home")) !== "none");
check("étagère reel masquée", (await disp("#reel-shelf")) === "none");
check("vignette lockup masquée (CSS)", (await disp("#lockup")) === "none");
check("short en grille masqué (CSS :has)", (await disp("#rich-short")) === "none");
check("vidéo en grille visible", (await disp("#rich-normal")) !== "none");
check("section Shorts masquée (CSS :has)", (await disp("#rich-section")) === "none");

console.log("\n[CSS — sur une chaîne]");
await page.evaluate(() => document.documentElement.setAttribute("data-usk-channel", "1"));
check("étagère reel visible sur chaîne", (await disp("#reel-shelf")) !== "none");
check("vignette lockup visible sur chaîne", (await disp("#lockup")) !== "none");
await page.evaluate(() => document.documentElement.removeAttribute("data-usk-channel"));

console.log("\n[JS — hideShortItems]");
await page.evaluate(() => {
  window.USK.__test.setConfig({ enabled: true, hideShorts: true, allowFromChannels: true });
  window.USK.__test.hideShortItems(document);
});
check("item short masqué", (await disp("#vid-short")) === "none");
check("vidéo normale visible", (await disp("#vid-normal")) !== "none");

console.log("\n[Gate + minuteur]");
const gate = await page.evaluate(() => {
  return new Promise((resolve) => {
    const cfg = { unlockMinutes: 5, minAnswerLength: 5, questions: ["Q1", "Q2", "Q3"] };
    let count = 0;
    window.USK.showGate(cfg, () => resolve({ ok: true, count }));
    const tas = document.querySelectorAll("#usk-gate textarea");
    count = tas.length;
    const btn = document.querySelector("#usk-gate .usk-unlock");
    window.__b0 = btn.disabled;
    tas.forEach((t) => {
      t.value = "réponse suffisante";
      t.dispatchEvent(new Event("input"));
    });
    window.__b1 = btn.disabled;
    document.querySelector("#usk-gate form").dispatchEvent(new Event("submit", { cancelable: true }));
  });
});
const btn = await page.evaluate(() => ({ b0: window.__b0, b1: window.__b1 }));
check("3 questions générées", gate.count === 3);
check("bouton désactivé au départ", btn.b0 === true);
check("bouton actif une fois rempli", btn.b1 === false);
check("succès + gate retiré", gate.ok === true && (await page.evaluate(() => !document.getElementById("usk-gate"))));

const timer = await page.evaluate(() => {
  const t = window.USK.__test;
  return { a: t.formatTime(5), b: t.formatTime(65), c: t.formatTime(3600) };
});
check("formatTime 5 -> 0:05", timer.a === "0:05");
check("formatTime 65 -> 1:05", timer.b === "1:05");
check("formatTime 3600 -> 1:00:00", timer.c === "1:00:00");

await browser.close();
await srv.close();
console.log("\n" + (failures === 0 ? "DOM/EXTENSION OK ✅" : failures + " échec(s) ❌"));
process.exit(failures === 0 ? 0 : 1);
