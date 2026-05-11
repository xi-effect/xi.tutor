import type { PlatformModule } from './types';
import { tauriShellEnv } from '../env';
import { checkAndApplyUpdate } from '../tauri/updater';

const desktop: PlatformModule = {
  kind: 'desktop',
  capabilities: {
    updater: true,
    notifications: true,
    deepLinks: true,
    windowChrome: true,
  },
  async init() {
    // Kick off an updater check shortly after boot so it doesn't compete with
    // initial render. The implementation is non-fatal: failures are logged and
    // surfaced through the platform event bus rather than throwing here.
    if (tauriShellEnv.updaterAutoCheck) {
      window.setTimeout(() => {
        void checkAndApplyUpdate({ silent: true });
      }, 4_000);
    }
  },
};

export default desktop;
