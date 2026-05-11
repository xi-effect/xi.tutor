import ReactDOM from 'react-dom/client';
import './index.css';

// Reuse xi.web bootstrap modules verbatim — the alias `web/*` maps to
// `apps/xi.web/src/*`. This keeps i18n, error reporting and providers in
// lockstep with the web app.
import { i18nInitPromise } from 'web/config/i18n';
import { initBugsink } from 'web/config/bugsink';

import { App } from './App';
import { initPlatform } from './platform';
import { tauriShellEnv } from './env';

// Initialise platform side effects before React mounts so updater hooks and
// permission grants are ready by the time the UI dispatches user actions.
const platformReady = initPlatform();

// Initialise error reporting as early as possible. Same DSN/transport as web.
initBugsink();

// Canary path: in remote mode we hand control over to the live deployment.
// This is opt-in via env (`VITE_TAURI_REMOTE_URL`) and is meant for QA only —
// production users always run the locally bundled UI.
if (tauriShellEnv.remoteUrl) {
  // Replace the current document with the remote URL. Tauri's WebView trusts
  // the navigation because the host frame is local.
  window.location.replace(tauriShellEnv.remoteUrl);
} else {
  const rootElement = document.getElementById('root')!;
  if (!rootElement.innerHTML) {
    Promise.all([i18nInitPromise, platformReady])
      .catch((error) => {
        console.error('[xi.tauri] bootstrap failed, rendering anyway:', error);
      })
      .finally(() => {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<App />);
      });
  }
}
