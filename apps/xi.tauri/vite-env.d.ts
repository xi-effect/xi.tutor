/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAURI_REMOTE_URL?: string;
  readonly VITE_TAURI_UPDATER_AUTOCHECK?: string;
  readonly TAURI_DEV_REMOTE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
