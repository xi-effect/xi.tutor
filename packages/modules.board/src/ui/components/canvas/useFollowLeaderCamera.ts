import { useEffect } from 'react';
import type { DrInstancePresence, DrStore, Editor } from '@ibodr/draw';
import {
  followCameraTarget,
  followCamerasClose,
  nextZoomHoldUntil,
  snapFollowedCamera,
} from './followCamera';

/**
 * Пока ученик следит за ведущим, камера держит центр его вида.
 * В обычном слежении масштаб тоже залочен.
 * В режиме презентации ученик может зумить: центр остаётся на репетиторе,
 * а выбранный масштаб не сбрасывается, пока ученик сам не вернёт вид презентации.
 */
export const useFollowLeaderCamera = (
  editor: Editor | null,
  store: DrStore | null,
  followingPresenceId: string | null,
  allowLocalZoom: boolean,
) => {
  useEffect(() => {
    if (!editor || !store || !followingPresenceId) return;

    const id = followingPresenceId;
    let raf = 0;
    let disposed = false;
    let applyingFollow = false;
    let zoomOverride: number | null = null;
    let zoomHoldUntil = 0;

    const readLeader = () => {
      const presence = store.get(id as DrInstancePresence['id']) as DrInstancePresence | undefined;
      if (!presence?.camera) return null;
      const leaderScreen = presence.screenBounds;
      if (!leaderScreen || leaderScreen.w <= 0 || leaderScreen.h <= 0) return null;
      const viewport = editor.getViewportScreenBounds();
      return {
        leaderCamera: presence.camera,
        leaderScreen: { w: leaderScreen.w, h: leaderScreen.h },
        viewport: { w: viewport.w, h: viewport.h },
      };
    };

    const apply = () => {
      const leader = readLeader();
      if (!leader) return;
      const target = followCameraTarget({
        ...leader,
        zoom: allowLocalZoom ? zoomOverride : null,
      });
      if (!target) return;
      if (followCamerasClose(editor.getCamera(), target)) return;

      if (!allowLocalZoom) editor.setCameraOptions({ isLocked: false });
      applyingFollow = true;
      try {
        editor.setCamera(target, allowLocalZoom ? { immediate: true } : undefined);
      } finally {
        applyingFollow = false;
      }
      if (!allowLocalZoom) editor.setCameraOptions({ isLocked: true });
    };

    const schedule = () => {
      if (disposed || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (disposed) return;
        if (allowLocalZoom && performance.now() < zoomHoldUntil) {
          schedule();
          return;
        }
        apply();
      });
    };

    const beginZoomHold = () => {
      const speed = editor.user.getAnimationSpeed() ?? 1;
      zoomHoldUntil = nextZoomHoldUntil(
        performance.now(),
        editor.options.animationMediumMs,
        speed,
        zoomHoldUntil,
      );
    };

    const stopCameraGuard = allowLocalZoom
      ? editor.sideEffects.registerBeforeChangeHandler('camera', (previous, next, source) => {
          if (disposed || applyingFollow || source !== 'user') return next;
          if (next.id !== editor.getCamera().id) return next;

          const snapped = snapFollowedCamera({
            previous,
            next,
            leader: readLeader(),
            zoomOverride,
          });
          zoomOverride = snapped.zoomOverride;
          if (snapped.mode === 'keep') return previous;
          if (snapped.mode === 'allow') return next;
          return { ...next, x: snapped.camera.x, y: snapped.camera.y, z: snapped.camera.z };
        })
      : null;

    const restoreZoom = allowLocalZoom
      ? installPresentationZoom(editor, beginZoomHold, () => {
          zoomOverride = null;
          zoomHoldUntil = 0;
          schedule();
        })
      : null;

    if (allowLocalZoom) editor.setCameraOptions({ isLocked: false });

    schedule();

    const unsub = store.listen(
      ({ changes }) => {
        const added = (changes.added ?? {}) as Record<string, unknown>;
        const updated = (changes.updated ?? {}) as Record<string, unknown>;
        if (added[id] || updated[id]) schedule();
      },
      { scope: 'presence' },
    );

    const observer = new ResizeObserver(() => schedule());
    observer.observe(editor.getContainer());

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      unsub();
      stopCameraGuard?.();
      restoreZoom?.();
      editor.setCameraOptions({ isLocked: false });
    };
  }, [allowLocalZoom, editor, followingPresenceId, store]);
};

const install = <K extends keyof Editor>(editor: Editor, key: K, value: Editor[K]) => {
  Object.defineProperty(editor, key, { configurable: true, writable: true, value });
};

const installPresentationZoom = (
  editor: Editor,
  beginZoomHold: () => void,
  resetToPresentation: () => void,
) => {
  const zoomIn = editor.zoomIn.bind(editor);
  const zoomOut = editor.zoomOut.bind(editor);
  const resetZoom = editor.resetZoom.bind(editor);
  const zoomToBounds = editor.zoomToBounds.bind(editor);

  install(editor, 'zoomIn', ((...args: Parameters<Editor['zoomIn']>) => {
    beginZoomHold();
    return zoomIn(...args);
  }) as Editor['zoomIn']);
  install(editor, 'zoomOut', ((...args: Parameters<Editor['zoomOut']>) => {
    beginZoomHold();
    return zoomOut(...args);
  }) as Editor['zoomOut']);
  install(editor, 'resetZoom', ((...args: Parameters<Editor['resetZoom']>) => {
    beginZoomHold();
    return resetZoom(...args);
  }) as Editor['resetZoom']);
  install(editor, 'zoomToBounds', ((...args: Parameters<Editor['zoomToBounds']>) => {
    beginZoomHold();
    return zoomToBounds(...args);
  }) as Editor['zoomToBounds']);
  // Двойной клик и «показать всё» не могут уехать с кадра презентации:
  // возвращаем масштаб, который вписывает вид репетитора.
  install(editor, 'zoomToFit', (() => {
    resetToPresentation();
    return editor;
  }) as Editor['zoomToFit']);

  return () => {
    delete (editor as unknown as Record<string, unknown>).zoomIn;
    delete (editor as unknown as Record<string, unknown>).zoomOut;
    delete (editor as unknown as Record<string, unknown>).resetZoom;
    delete (editor as unknown as Record<string, unknown>).zoomToBounds;
    delete (editor as unknown as Record<string, unknown>).zoomToFit;
  };
};
