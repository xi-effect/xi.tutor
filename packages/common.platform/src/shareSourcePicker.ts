/**
 * In-app screen-share source picker for the Electron shell (Zoom-like).
 *
 * `getDisplayMedia` asks the registered UI to choose a display or window, tells
 * the shell which source to grant, and only then starts the capture.
 */

import { isElectronShell } from './detect';
import { getSovliumDesktop } from './electron';
import type { ShareSource } from './electron-api';

export type { ShareSource };

export type ShareSourcePicker = (sources: ShareSource[]) => Promise<ShareSource | null>;

let picker: ShareSourcePicker | null = null;
let lastSource: ShareSource | null = null;

export const SHARE_SOURCE_CHANGE_EVENT = 'sovlium:share-source-change';

export function registerShareSourcePicker(next: ShareSourcePicker): () => void {
  picker = next;
  return () => {
    if (picker === next) picker = null;
  };
}

/** Source granted for the current (or last) screen share; `null` when unknown. */
export function getLastShareSource(): ShareSource | null {
  return lastSource;
}

/**
 * @returns `false` when the user cancelled the picker; `true` when capture may
 * proceed (with a chosen source, or the shell's default when no UI is mounted).
 */
export async function chooseShareSource(): Promise<boolean> {
  const desktop = getSovliumDesktop();
  if (!isElectronShell() || !desktop) return true;

  lastSource = null;
  if (!picker) {
    await desktop.screenShare.selectSource(null);
    return true;
  }

  const sources = await desktop.screenShare.listSources();
  const chosen = await picker(sources);
  if (!chosen) return false;

  await desktop.screenShare.selectSource(chosen.id);
  lastSource = chosen;
  window.dispatchEvent(new Event(SHARE_SOURCE_CHANGE_EVENT));
  return true;
}
