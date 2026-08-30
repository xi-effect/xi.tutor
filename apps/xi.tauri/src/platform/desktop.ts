import type { PlatformModule } from './types';
import { tauriShellEnv } from '../env';
import { installCrossSiteSessionProbe } from '../tauri/crossSiteSession';
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
    // Only meaningful for local-bundle / localhost auth experiments.
    // Remote mode navigates to *.sovlium.ru where cookies are first-party.
    if (!tauriShellEnv.remoteMode) {
      await installCrossSiteSessionProbe();
    }

    // In remote mode the splash bootstrap awaits an updater budget before
    // navigating away (the delayed timer below would be cancelled by
    // location.replace). Local-bundle mode keeps the deferred check.
    if (tauriShellEnv.updaterAutoCheck && !tauriShellEnv.remoteMode) {
      window.setTimeout(() => {
        void checkAndApplyUpdate({ silent: true });
      }, 4_000);
    }
  },
};

export default desktop;
