import type { WebContents } from 'electron';

export function sendToRenderer(
  contents: WebContents | null | undefined,
  channel: string,
  ...args: unknown[]
): void {
  if (!contents || contents.isDestroyed()) return;
  try {
    contents.send(channel, ...args);
  } catch {
    // Frame gone during reload / HMR / window close.
  }
}
