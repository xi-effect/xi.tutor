/**
 * Native call PiP extras: a visible overlay control, minimize → floating
 * window, restore when leaving compact.
 *
 * CompactView's Document PiP button is easy to miss (compact mode + hover).
 * This control is shown for the whole call on desktop native.
 *
 * Electron uses a separate always-on-top BrowserWindow (Discord-like pop-out).
 * Tauri still uses the Document PiP shim on the main window.
 */

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useCallStore } from '@xipkg/calls-store';
import {
  enterCallPip,
  isDesktopNative,
  isElectronShell,
  leaveCallPip,
  onMainWindowFocusChanged,
  isMainWindowMinimized,
} from 'common.platform';
import { useElectronConferenceState } from './useElectronConferenceState';

const PIP_REQUEST = 'sovlium:call-pip-request';
const PIP_CLOSE = 'sovlium:call-pip-close';

function dispatch(name: string): void {
  window.dispatchEvent(new Event(name));
}

function closeNativePip(): void {
  dispatch(PIP_CLOSE);
  const pip = (
    window as Window & {
      documentPictureInPicture?: { window?: { close?: () => void } | null };
    }
  ).documentPictureInPicture?.window;
  pip?.close?.();
}

function isPipDomActive(): boolean {
  return (
    document.documentElement.hasAttribute('data-native-call-pip') ||
    Boolean(
      (window as Window & { documentPictureInPicture?: { window?: unknown } })
        .documentPictureInPicture?.window,
    )
  );
}

export function useNativeCallPip(): void {
  const token = useCallStore((state) => state.token);
  const mode = useCallStore((state) => state.mode);
  const previousMode = useRef(mode);

  useEffect(() => {
    if (!isDesktopNative() || isElectronShell() || !token) return;

    let cancelled = false;
    let blurTimer: number | undefined;
    let unlisten: (() => void) | undefined;

    void (async () => {
      unlisten = await onMainWindowFocusChanged(async (focused) => {
        if (cancelled) return;
        if (focused) {
          if (blurTimer !== undefined) window.clearTimeout(blurTimer);
          return;
        }
        try {
          const minimized = await isMainWindowMinimized();
          if (blurTimer !== undefined) window.clearTimeout(blurTimer);
          blurTimer = window.setTimeout(() => {
            if (cancelled || document.hasFocus()) return;
            dispatch(PIP_REQUEST);
          }, minimized ? 0 : 700);
        } catch (err) {
          console.warn('[modules.calls] native call pip minimize hook failed', err);
        }
      });
      if (cancelled) {
        unlisten?.();
      }
    })();

    return () => {
      cancelled = true;
      if (blurTimer !== undefined) window.clearTimeout(blurTimer);
      unlisten?.();
    };
  }, [token]);

  useEffect(() => {
    if (!isDesktopNative() || isElectronShell()) {
      previousMode.current = mode;
      return;
    }
    if (previousMode.current === 'compact' && mode === 'full') {
      closeNativePip();
    }
    previousMode.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      if (!isDesktopNative() || !token) return;
      if (isElectronShell()) {
        void leaveCallPip();
        return;
      }
      closeNativePip();
    };
  }, [token]);
}

function NativeCallPipButton(): ReactElement | null {
  const token = useCallStore((state) => state.token);
  const mode = useCallStore((state) => state.mode);
  const conference = useElectronConferenceState();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!isDesktopNative() || isElectronShell() || !token) {
      setActive(false);
      return;
    }

    const sync = () => setActive(isPipDomActive());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-native-call-pip'],
    });
    window.addEventListener(PIP_REQUEST, sync);
    window.addEventListener(PIP_CLOSE, sync);

    return () => {
      observer.disconnect();
      window.removeEventListener(PIP_REQUEST, sync);
      window.removeEventListener(PIP_CLOSE, sync);
    };
  }, [token]);

  if (!isDesktopNative() || !token) return null;
  if (!isElectronShell() && active) return null;

  const compact = mode === 'compact';
  const floating = isElectronShell() ? conference.floating : active;

  return (
    <button
      type="button"
      onClick={() => {
        if (isElectronShell()) {
          if (floating) {
            void leaveCallPip();
            return;
          }
          void enterCallPip({ width: 380, height: 280 });
          return;
        }
        dispatch(PIP_REQUEST);
      }}
      className={
        compact
          ? 'bg-background-surface/95 text-text-primary border-border-default hover:bg-background-hover fixed top-3 left-1/2 z-200 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-lg'
          : 'bg-background-surface/95 text-text-primary border-border-default hover:bg-background-hover fixed bottom-24 left-1/2 z-200 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-lg'
      }
      aria-label={floating ? 'Закрыть плавающее окно' : 'Открыть плавающее окно'}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5v2h5a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h5v-2H6a2 2 0 0 1-2-2z" />
        <path d="M10 12h8v8h-8z" />
      </svg>
      {floating ? 'Закрыть окно' : 'Поверх окон'}
    </button>
  );
}

export function NativeCallPipBridge(): ReactElement | null {
  useNativeCallPip();
  return <NativeCallPipButton />;
}
