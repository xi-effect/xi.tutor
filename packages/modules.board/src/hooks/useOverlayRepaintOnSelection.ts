import { useEffect, useRef } from 'react';
import { Editor } from '@ibodr/draw';

/**
 * Canvas overlay в @ibodr/draw не всегда инвалидируется при смене selection.
 * Лёгкий «толчок» камеры заставляет EffectScheduler перерисовать .dr-canvas-overlays
 * (ручки ресайза и штатные indicators, если они работают).
 */
export function useOverlayRepaintOnSelection(editor: Editor | null) {
  const rafRef = useRef(0);

  useEffect(() => {
    if (!editor) return;

    let selectedKey = editor.getSelectedShapeIds().join(',');

    const repaint = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const cam = editor.getCamera();
        editor.setCamera({ x: cam.x + 1e-9, y: cam.y, z: cam.z });
        editor.setCamera(cam);
      });
    };

    const unsubscribe = editor.store.listen(
      () => {
        const nextKey = editor.getSelectedShapeIds().join(',');
        if (nextKey === selectedKey) return;
        selectedKey = nextKey;
        repaint();
      },
      { scope: 'session' },
    );

    return () => {
      cancelAnimationFrame(rafRef.current);
      unsubscribe();
    };
  }, [editor]);
}
