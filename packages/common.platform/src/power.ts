import { isElectronShell } from './detect';
import { getSovliumDesktop } from './electron';

/** Prevents the display from sleeping (Electron). No-op in the browser. */
export async function setDisplaySleepBlocked(enabled: boolean): Promise<void> {
  if (!isElectronShell()) return;
  try {
    await getSovliumDesktop()?.power.setDisplaySleepBlocked(enabled);
  } catch (err) {
    console.warn('[common.platform] setDisplaySleepBlocked failed', err);
  }
}
