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
    // Intentionally minimal. Mobile-specific wiring (status bar, safe area,
    // back-button handling) can be added here as features land.
  },
};

export default mobile;
