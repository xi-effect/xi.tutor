/**
 * Remote control of the shared screen, Electron shell only
 * (see apps/xi.electron/src/main/remote-control.ts).
 */

import { isElectronShell } from './detect';
import { getSovliumDesktop } from './electron';
import type { RemoteControlStatus, RemoteInput } from './electron-api';

export type {
  RemoteControlStatus,
  RemoteInput,
  RemoteModifiers,
  RemoteMouseButton,
  RemoteOrigin,
} from './electron-api';

const UNSUPPORTED: RemoteControlStatus = { supported: false, trusted: false };

export async function getRemoteControlStatus(): Promise<RemoteControlStatus> {
  if (!isElectronShell()) return UNSUPPORTED;
  return (await getSovliumDesktop()?.remoteControl?.status()) ?? UNSUPPORTED;
}

/** macOS: shows the Accessibility prompt and opens its settings pane. */
export async function requestRemoteControlAccess(): Promise<RemoteControlStatus> {
  if (!isElectronShell()) return UNSUPPORTED;
  return (await getSovliumDesktop()?.remoteControl?.requestAccess()) ?? UNSUPPORTED;
}

/** Input is dropped by the shell unless control is currently granted. */
export async function setRemoteControlActive(enabled: boolean): Promise<void> {
  if (!isElectronShell()) return;
  await getSovliumDesktop()?.remoteControl?.setActive(enabled);
}

export function sendRemoteInput(input: RemoteInput): void {
  getSovliumDesktop()?.remoteControl?.input(input);
}
