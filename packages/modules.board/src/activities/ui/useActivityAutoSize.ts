import { useEditor } from '@ibodr/draw';
import { useLayoutEffect, useRef } from 'react';
import { ACTIVITY_MIN_SIZE } from '../model/kinds';
import type { ActivityShape } from '../shape/ActivityShape';

export function useActivityAutoSize(shape: ActivityShape) {
  const editor = useEditor();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const syncHeight = () => {
      const height = Math.ceil(node.scrollHeight);
      if (!Number.isFinite(height) || height < ACTIVITY_MIN_SIZE.h) return;

      const current = editor.getShape(shape.id);
      if (!current || current.type !== 'activity') return;
      if (height <= current.props.h + 1) return;

      editor.updateShape({
        id: shape.id,
        type: 'activity',
        props: { h: height },
      });
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [editor, shape.id]);

  return rootRef;
}
