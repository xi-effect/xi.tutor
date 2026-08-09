/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAURI_REMOTE_MODE?: string;
  readonly VITE_TAURI_REMOTE_URL?: string;
  readonly VITE_TAURI_REMOTE_FALLBACK_URL?: string;
  readonly VITE_TAURI_REMOTE_TIMEOUT_MS?: string;
  readonly VITE_TAURI_UPDATER_AUTOCHECK?: string;
  readonly VITE_TAURI_CROSS_SITE_SESSION_PROBE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
