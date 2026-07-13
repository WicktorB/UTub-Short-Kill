// Petit serveur HTTP local : sert la même page HTML pour toutes les routes.
// Donne une vraie origine (localStorage fonctionnel, pushState autorisé).
import http from "node:http";

export function startServer(html) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        url: "http://127.0.0.1:" + port + "/",
        close: () => new Promise((r) => server.close(r))
      });
    });
  });
}

export const FIXTURE = `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>
  <ytd-guide-entry-renderer id="guide-shorts"><a href="/shorts" title="Shorts">Shorts</a></ytd-guide-entry-renderer>
  <ytd-guide-entry-renderer id="guide-home"><a href="/" title="Accueil">Accueil</a></ytd-guide-entry-renderer>
  <ytd-reel-shelf-renderer id="reel-shelf"><a href="/shorts/aaa">short shelf</a></ytd-reel-shelf-renderer>
  <ytd-video-renderer id="vid-short"><a href="/shorts/bbb">un short</a></ytd-video-renderer>
  <ytd-video-renderer id="vid-normal"><a href="/watch?v=ccc">vidéo normale</a></ytd-video-renderer>
  <ytm-shorts-lockup-view-model id="lockup"><a href="/shorts/ddd">vignette short</a></ytm-shorts-lockup-view-model>
  <ytd-rich-item-renderer id="rich-short"><a href="/shorts/eee">short en grille</a></ytd-rich-item-renderer>
  <ytd-rich-item-renderer id="rich-normal"><a href="/watch?v=fff">vidéo en grille</a></ytd-rich-item-renderer>
  <ytd-rich-section-renderer id="rich-section"><ytm-shorts-lockup-view-model><a href="/shorts/ggg">section short</a></ytm-shorts-lockup-view-model></ytd-rich-section-renderer>
</body></html>`;

export const CHROMIUM_EXE = process.env.USK_CHROMIUM || undefined;
