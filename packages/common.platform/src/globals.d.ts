export {};

declare global {
  interface Window {
    __SOVLIUM_NATIVE__?: boolean;
    __TAURI_INTERNALS__?: unknown;
  }
}
