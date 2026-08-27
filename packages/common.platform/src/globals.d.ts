export {};

declare global {
  interface Window {
    __SOVLIUM_NATIVE__?: boolean;
    /** Compile-time OS of the shell (`ios` / `android` / `macos` / …). */
    __SOVLIUM_NATIVE_OS__?: string;
    __TAURI_INTERNALS__?: unknown;
  }
}
