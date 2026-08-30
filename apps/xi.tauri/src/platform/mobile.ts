import type { PlatformModule } from './types';

const mobile: PlatformModule = {
  kind: 'mobile',
  capabilities: {
    // Updates are always handled by the App Store / Play Store on mobile.
    updater: false,
    notifications: true,
    deepLinks: true,
    windowChrome: false,
  },
  async init() {
    // WebAPI bridges (media, notifications, clipboard, files) live in
    // `common.platform.installNativeWebApiBridges` and run from xi.web / CallsShell.
  },
};

export default mobile;
