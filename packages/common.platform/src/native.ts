import { isNativeShell } from './detect';

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

export async function listenCommand<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  const { listen } = await import('@tauri-apps/api/event');
  const unlisten = await listen<T>(event, (e) => {
    handler(e.payload);
  });
  return unlisten;
}

export function assertNativeAvailable(apiName: string): void {
  if (!isNativeShell()) {
    throw new Error(`[common.platform] ${apiName} is only available in the native shell`);
  }
}
