// Point d'entrée extension : cœur commun + stockage chrome/browser.storage.
import { createApp } from "../core/app.js";
import { createExtensionStorage } from "../platform/storage-extension.js";

if (window.top === window.self) {
  createApp(createExtensionStorage())
    .init()
    .catch(function () {
      /* ignore */
    });
}
