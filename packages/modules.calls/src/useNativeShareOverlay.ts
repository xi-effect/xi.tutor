/**
 * Syncs LiveKit local screen-share state with the Tauri always-on-top overlay.
 *
 * No-op outside the native desktop shell. Safe to mount in the browser web app.
 */

import { useEffect, useRef } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import {
  hideShareOverlay,
  isDesktopNative,
  onShareOverlayStop,
  showShareOverlay,
} from 'common.platform';

export function useNativeShareOverlay(): void {
  const { isScreenShareEnabled, localParticipant } = useLocalParticipant();
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!isDesktopNative()) return;

    let cancelled = false;
    let unlisten: (() => void) | undefined;

    void (async () => {
      try {
        unlisten = await onShareOverlayStop(() => {
          void localParticipant.setScreenShareEnabled(false).catch((err) => {
            console.error('[modules.calls] failed to stop screen share from overlay', err);
          });
        });
      } catch (err) {
        console.warn('[modules.calls] share overlay listen unavailable', err);
      }
      if (cancelled) {
        unlisten?.();
      }
    })();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [localParticipant]);

  useEffect(() => {
    if (!isDesktopNative()) return;

    let cancelled = false;

    void (async () => {
      try {
        if (isScreenShareEnabled) {
          await showShareOverlay();
          if (!cancelled) visibleRef.current = true;
        } else if (visibleRef.current) {
          await hideShareOverlay();
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

  useEffect(() => {
    return () => {
      if (!isDesktopNative() || !visibleRef.current) return;
      void hideShareOverlay().catch(() => {
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
