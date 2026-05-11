import type { PlatformModule } from './types';

/**
 * Web fallback used only when the bundle is opened outside of a Tauri host
 * (e.g. `vite dev` in a plain browser). It exists so that developers can run
 * and debug the shell without launching the native runtime.
 */
const web: PlatformModule = {
  kind: 'web',
  capabilities: {
    updater: false,
    notifications: false,
    deepLinks: false,
    windowChrome: false,
  },
  async init() {
    // No-op.
  },
};

export default web;
