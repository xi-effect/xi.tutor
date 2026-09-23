/**
 * Native call PiP extras: a visible overlay control, minimize → floating
 * window, restore when leaving compact.
 *
 * CompactView's Document PiP button is easy to miss (compact mode + hover), so
 * full mode gets a button in the call header next to «Вид».
 *
 * Electron opens CompactView's PiP in a separate always-on-top popup window
 * (Discord-like pop-out). Tauri still uses the Document PiP shim on the main window.
 */

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { useCallStore } from '@xipkg/calls-store';
import {
  CALL_OVERLAY_CHANGE_EVENT,
  closeElectronCallOverlay,
  isDesktopNative,
  isElectronCallOverlayOpen,
  isElectronShell,
  onMainWindowFocusChanged,
  isMainWindowMinimized,
} from 'common.platform';

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
          blurTimer = window.setTimeout(
            () => {
              if (cancelled || document.hasFocus()) return;
              dispatch(PIP_REQUEST);
            },
            minimized ? 0 : 700,
          );
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
        closeElectronCallOverlay();
        return;
      }
      closeNativePip();
    };
  }, [token]);
}

function useElectronCallOverlayOpen(enabled: boolean): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      return;
    }
    const sync = () => setOpen(isElectronCallOverlayOpen());
    sync();
    window.addEventListener(CALL_OVERLAY_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CALL_OVERLAY_CHANGE_EVENT, sync);
  }, [enabled]);

  return open;
}

function NativeCallPipButton(): ReactElement | null {
  const token = useCallStore((state) => state.token);
  const mode = useCallStore((state) => state.mode);
  const overlayOpen = useElectronCallOverlayOpen(isElectronShell() && Boolean(token));
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

  const compact = mode === 'compact';
  const enabled = isDesktopNative() && Boolean(token);
  // Full mode: next to «Вид» in the call header. Compact mode on Electron uses
  // CompactView's own PiP button (the shim makes it work).
  const headerSlot = useCallHeaderSlot(enabled && !compact);

  if (!enabled) return null;
  if (!isElectronShell() && active) return null;

  const floating = isElectronShell() ? overlayOpen : active;
  const label = floating ? 'Закрыть плавающее окно' : 'Поверх окон';
  const toggle = () => {
    if (isElectronShell() && floating) {
      closeElectronCallOverlay();
      return;
    }
    dispatch(PIP_REQUEST);
  };

  if (!compact) {
    if (!headerSlot) return null;
    return createPortal(
      <button
        type="button"
        onClick={toggle}
        title={label}
        aria-label={label}
        aria-pressed={floating}
        className={`flex h-10 w-10 flex-row items-center justify-center rounded-xl p-0 ${
          floating ? 'bg-background-page' : 'hover:bg-background-page bg-transparent'
        }`}
        data-umami-event="call-native-pip"
      >
        <PipIcon />
      </button>,
      headerSlot,
    );
  }

  if (isElectronShell()) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="bg-background-surface/95 text-text-primary border-border-default hover:bg-background-hover fixed top-3 left-1/2 z-200 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-lg"
      aria-label={label}
    >
      <PipIcon />
      Поверх окон
    </button>
  );
}

function PipIcon(): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className="fill-icon-primary"
      aria-hidden="true"
    >
      <path d="M5 3h14a3 3 0 0 1 3 3v5h-2V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6v2H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" />
      <rect x="13" y="13" width="9" height="7" rx="1.5" />
    </svg>
  );
}

const HEADER_ANCHOR_SELECTOR = '[data-umami-event="call-toggle-layout"]';

/**
 * `UpBar` from `@xipkg/calls-ui` has no extension point, so the button is
 * portalled into a node placed right after its «Вид» button.
 */
function useCallHeaderSlot(enabled: boolean): HTMLElement | null {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSlot(null);
      return;
    }

    const node = document.createElement('div');
    node.style.display = 'contents';
    let frame: number | undefined;

    const attach = () => {
      frame = undefined;
      const anchor = document.querySelector(HEADER_ANCHOR_SELECTOR);
      if (!anchor) {
        node.remove();
        setSlot(null);
        return;
      }
      if (anchor.nextElementSibling !== node) anchor.insertAdjacentElement('afterend', node);
      setSlot(node);
    };
    const schedule = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(attach);
    };

    attach();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      node.remove();
      setSlot(null);
    };
  }, [enabled]);

  return slot;
}

export function NativeCallPipBridge(): ReactElement | null {
  useNativeCallPip();
  return <NativeCallPipButton />;
}
