/**
 * Syncs LiveKit local screen-share state with the Tauri always-on-top overlay.
 *
 * No-op outside the native desktop shell (`__SOVLIUM_NATIVE__` /
 * `__TAURI_INTERNALS__`). Safe to mount in the browser web app.
 */

import { useEffect, useRef } from 'react';
import { useLocalParticipant } from '@livekit/components-react';

const STOP_EVENT = 'share-overlay-stop';

function isNativeDesktopShell(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.__SOVLIUM_NATIVE__ || w.__TAURI_INTERNALS__);
}

async function invokeShareOverlay(
  command: 'share_overlay_show' | 'share_overlay_hide',
): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke(command);
}

export function useNativeShareOverlay(): void {
  const { isScreenShareEnabled, localParticipant } = useLocalParticipant();
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!isNativeDesktopShell()) return;

    let cancelled = false;
    let unlisten: (() => void) | undefined;

    void (async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        if (cancelled) return;
        unlisten = await listen(STOP_EVENT, () => {
          void localParticipant.setScreenShareEnabled(false).catch((err) => {
            console.error('[modules.calls] failed to stop screen share from overlay', err);
          });
        });
      } catch (err) {
        console.warn('[modules.calls] share overlay listen unavailable', err);
      }
    })();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [localParticipant]);

  useEffect(() => {
    if (!isNativeDesktopShell()) return;

    let cancelled = false;

    void (async () => {
      try {
        if (isScreenShareEnabled) {
          await invokeShareOverlay('share_overlay_show');
          if (!cancelled) visibleRef.current = true;
        } else if (visibleRef.current) {
          await invokeShareOverlay('share_overlay_hide');
          if (!cancelled) visibleRef.current = false;
        }
      } catch (err) {
        console.warn('[modules.calls] share overlay sync failed', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isScreenShareEnabled]);

  // Hide overlay if the call shell unmounts while still sharing.
  useEffect(() => {
    return () => {
      if (!isNativeDesktopShell() || !visibleRef.current) return;
      void invokeShareOverlay('share_overlay_hide').catch(() => {
        // ignore teardown errors
      });
    };
  }, []);
}

/** Mount-only wrapper for provider trees that cannot call hooks conditionally. */
export function NativeShareOverlayBridge(): null {
  useNativeShareOverlay();
  return null;
}
