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
import { bootstrapRemoteShell } from './remote/bootstrap';

// Initialise platform side effects before React mounts so updater hooks and
// permission grants are ready by the time the UI dispatches user actions.
const platformReady = initPlatform();

// Initialise error reporting as early as possible. Same DSN/transport as web.
initBugsink();

if (tauriShellEnv.remoteMode && tauriShellEnv.remoteUrl) {
  // Remote shell: local splash → health/compat → navigate to *.sovlium.ru.
  // Session cookies stay same-site with api.sovlium.ru (unlike tauri://).
  void platformReady
    .catch((error) => {
      console.error('[xi.tauri] platform init failed before remote boot:', error);
    })
    .finally(() => {
      void bootstrapRemoteShell();
    });
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
