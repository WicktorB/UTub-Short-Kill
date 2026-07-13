// Reproduit la contrainte « Trusted Types » de YouTube
// (require-trusted-types-for 'script') : toute assignation via innerHTML échoue.
// On sert la page sous ce CSP et on charge le script comme le fait YouTube
// (balise <script>), puis on vérifie que nos fenêtres s'affichent (logo compris).
import http from "node:http";
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CHROMIUM_EXE } from "./_server.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(join(ROOT, "dist/utub-short-kill.user.js"), "utf8");

const HTML = `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>
  <ytd-video-renderer id="vid-short"><a href="/shorts/bbb">un short</a></ytd-video-renderer>
  <script src="/usk.js"></script>
</body></html>`;

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/usk.js")) {
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    res.end(script);
  } else {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      // CSP identique à celui qui casse le script sur YouTube.
      "Content-Security-Policy": "require-trusted-types-for 'script'"
    });
    res.end(HTML);
  }
});
const url = await new Promise((r) => server.listen(0, "127.0.0.1", () => r("http://127.0.0.1:" + server.address().port + "/")));

let failures = 0;
const errors = [];
function check(name, cond) {
  console.log((cond ? "  ✓ " : "  ✗ ") + name);
  if (!cond) failures++;
}

const browser = await chromium.launch({ executablePath: CHROMIUM_EXE, args: ["--no-sandbox"] });
const page = await browser.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto(url);
await page.waitForTimeout(300);

console.log("\n[Trusted Types]");
check("script chargé (hooks présents)", await page.evaluate(() => !!window.__USK_TEST));

await page.evaluate(() => window.__USK_TEST && window.__USK_TEST.openSettings());
check("panneau réglages affiché sous Trusted Types", await page.evaluate(() => !!document.getElementById("usk-settings")));
check(
  "logo SVG présent (construit sans innerHTML)",
  await page.evaluate(() => !!document.querySelector("#usk-settings .usk-logo svg"))
);
check("aucune erreur TrustedHTML côté script", !errors.some((e) => /trustedhtml|trusted-types/i.test(e)));

// Confirme que le CSP Trusted Types est bien actif (sinon le test ne prouve rien).
const ttActive = await page.evaluate(() => {
  try {
    document.createElement("div").innerHTML = "<b>x</b>";
    return false;
  } catch (e) {
    return true;
  }
});
check("CSP Trusted Types bien actif", ttActive === true);

if (errors.length) {
  console.log("\nErreurs (avant sonde) :");
  errors.forEach((e) => console.log("   " + e));
}

await browser.close();
await new Promise((r) => server.close(r));
console.log("\n" + (failures === 0 ? "TRUSTED TYPES OK ✅" : failures + " échec(s) ❌"));
process.exit(failures === 0 ? 0 : 1);
