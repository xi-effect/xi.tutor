import { isDesktopNative } from './detect';
import { invokeCommand, listenCommand } from './native';

export const SHARE_OVERLAY_STOP_EVENT = 'share-overlay-stop';

export async function showShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_show');
}

export async function hideShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_hide');
}

export async function focusMainFromShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_focus_main');
}

export async function requestStopShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_request_stop');
}

export async function onShareOverlayStop(handler: () => void): Promise<() => void> {
  if (!isDesktopNative()) return () => undefined;
  return listenCommand(SHARE_OVERLAY_STOP_EVENT, handler);
}
