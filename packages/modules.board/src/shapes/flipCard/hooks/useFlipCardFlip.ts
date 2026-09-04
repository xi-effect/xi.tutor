import { useCallback } from 'react';
import { useEditor } from '@ibodr/draw';
import type { FlipCardShape } from '../FlipCardShape';

export const useFlipCardFlip = (id: FlipCardShape['id']) => {
  const editor = useEditor();

  return useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const current = editor.getShape<FlipCardShape>(id);
      if (!current) return;

      const {
        richText: liveText,
        frontRichText: prevFront,
        backRichText: prevBack,
        isFlipped: currentlyFlipped,
      } = current.props;

      if (!currentlyFlipped) {
        editor.updateShape<FlipCardShape>({
          id,
          type: 'flip-card',
          props: { frontRichText: liveText, richText: prevBack, isFlipped: true },
        });
      } else {
        editor.updateShape<FlipCardShape>({
          id,
          type: 'flip-card',
          props: { backRichText: liveText, richText: prevFront, isFlipped: false },
        });
      }
    },
    [editor, id],
  );
};
