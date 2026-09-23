import type { SovliumDesktopAPI } from './electron-api';

export {};

declare global {
  interface Window {
    __SOVLIUM_NATIVE__?: boolean;
    /** Compile-time OS of the shell (`ios` / `android` / `macos` / …). */
    __SOVLIUM_NATIVE_OS__?: string;
    __SOVLIUM_ELECTRON__?: boolean;
    __SOVLIUM_ELECTRON_SURFACE__?: 'main' | 'conference';
    sovliumDesktop?: SovliumDesktopAPI;
  }
}
