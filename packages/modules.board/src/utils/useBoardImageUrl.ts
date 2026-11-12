import { useEffect, useRef, useState } from 'react';
import { resolveDisplayImageUrl, type ImagePixelsHint } from './displayImage';
import { retainBlobUrl } from './resolveAssetUrl';
import { useRetainedBlobUrl } from './useRetainedBlobUrl';
import { scheduleImageResolution } from './imageResolutionRequest';

/** Resolution updates wait for camera idle; first loads and file replacements do not. */
export function useBoardImageUrl(options: {
  src: string;
  token: string;
  maxEdge: number | null;
  hint?: ImagePixelsHint;
  moving: boolean;
  enabled: boolean;
  direct?: boolean;
}) {
  const { src, token, maxEdge, moving, enabled, direct = false } = options;
  const w = options.hint?.w,
    h = options.hint?.h;
  const key = JSON.stringify([src, token]);
  const [result, setResult] = useState<{ key: string; url: string | null } | null>(null);
  const completedRequest = useRef<string | null>(null);
  const requestKey = JSON.stringify([key, maxEdge, w, h, direct]);
  const completed = useRef<string | null>(null);
  const held = useRef<(() => void) | null>(null);
  const url = result?.key === key ? result.url : null;
  useRetainedBlobUrl(url);
  // The displayed URL is retained by the effect above before the request's lease is released.
  useEffect(() => {
    held.current?.();
    held.current = null;
  }, [result]);
  useEffect(() => {
    completed.current = null;
    completedRequest.current = null;
    setResult(null);
  }, [key]);
  useEffect(() => {
    if (!src || !enabled || completedRequest.current === requestKey) return;
    const replacement = completed.current !== key;
    if (!replacement && moving) return;
    let releasePending: (() => void) | null = null;
    const cancel = scheduleImageResolution({
      delay: replacement ? 0 : 150,
      resolve: async (signal) => {
        const next = direct
          ? src
          : await resolveDisplayImageUrl(
              src,
              token,
              maxEdge,
              w && h ? { w, h } : undefined,
              signal,
            );
        signal.throwIfAborted();
        releasePending = retainBlobUrl(next);
        const image = new Image();
        image.src = next;
        await image.decode();
        signal.throwIfAborted();
        return next;
      },
      ready: (next) => {
        completed.current = key;
        completedRequest.current = requestKey;
        held.current?.();
        held.current = releasePending;
        releasePending = null;
        setResult({ key, url: next });
      },
      error: () => {
        releasePending?.();
        releasePending = null;
        // Keep a successfully displayed resolution on transient upgrade failures.
        if (completed.current !== key) setResult({ key, url: null });
      },
    });
    return () => {
      cancel();
      releasePending?.();
      releasePending = null;
    };
  }, [src, token, key, requestKey, maxEdge, w, h, moving, enabled, direct]);
  useEffect(
    () => () => {
      held.current?.();
      held.current = null;
    },
    [],
  );
  return url;
}
