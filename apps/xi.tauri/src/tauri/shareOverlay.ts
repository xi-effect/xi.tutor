/**
 * Desktop screen-share overlay IPC (Zoom-like always-on-top bar).
 * See `src-tauri/src/share_overlay.rs`.
 */

import { invoke } from '@tauri-apps/api/core';
import { detectPlatform } from '../platform';

export const SHARE_OVERLAY_STOP_EVENT = 'share-overlay-stop';

export async function showShareOverlay(): Promise<void> {
  if (detectPlatform() !== 'desktop') return;
  await invoke('share_overlay_show');
}

export async function hideShareOverlay(): Promise<void> {
  if (detectPlatform() !== 'desktop') return;
  await invoke('share_overlay_hide');
}

export async function focusMainFromShareOverlay(): Promise<void> {
  if (detectPlatform() !== 'desktop') return;
  await invoke('share_overlay_focus_main');
}

export async function requestStopShareOverlay(): Promise<void> {
  if (detectPlatform() !== 'desktop') return;
  await invoke('share_overlay_request_stop');
}
