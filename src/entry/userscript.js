// Point d'entrée userscript : cœur commun + stockage localStorage.
import { createApp } from "../core/app.js";
import { createUserscriptStorage } from "../platform/storage-userscript.js";

if (window.top === window.self) {
  createApp(createUserscriptStorage())
    .init()
    .catch(function () {
      /* ignore */
    });
}
