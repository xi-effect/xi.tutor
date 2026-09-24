/**
 * Native always-on-top call window (Zoom-like mini meeting).
 *
 * Electron moves the conference `WebContentsView` into a floating window.
 */

import { isDesktopNative } from './detect';
import { invokeCommand, listenCommand } from './native';

export const CALL_PIP_RESTORED_EVENT = 'call-pip-restored';

export interface CallPipSize {
  width: number;
  height: number;
}

export async function enterCallPip(size: CallPipSize): Promise<CallPipSize> {
  if (!isDesktopNative()) {
    return size;
  }
  return invokeCommand<CallPipSize>('call_pip_enter', {
    width: size.width,
    height: size.height,
  });
}

export async function leaveCallPip(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('call_pip_leave');
}

export async function resizeCallPip(size: CallPipSize): Promise<CallPipSize> {
  if (!isDesktopNative()) {
    return size;
  }
  return invokeCommand<CallPipSize>('call_pip_resize', {
    width: size.width,
    height: size.height,
  });
}

export async function onCallPipRestored(handler: () => void): Promise<() => void> {
  if (!isDesktopNative()) return () => undefined;
  return listenCommand(CALL_PIP_RESTORED_EVENT, handler);
}
