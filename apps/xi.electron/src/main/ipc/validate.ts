import type { IpcMainInvokeEvent } from 'electron';
import { isTrustedRendererUrl } from '../security';

export function assertTrustedSender(event: IpcMainInvokeEvent, channel: string): void {
  const url = event.senderFrame?.url ?? event.sender.getURL();
  if (!isTrustedRendererUrl(url)) {
    throw new Error(`[xi.electron] blocked IPC ${channel} from ${url || 'unknown'}`);
  }
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
