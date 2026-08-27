import { useCallback } from 'react';
import { Editor } from '@tiptap/core';
import { NodeViewProps } from '@tiptap/react';
import { ActiveBlockT } from '../types';

export function useNodeActiveBlock(
  editor: Editor | null,
  getPos: NodeViewProps['getPos'],
  typeName: string,
) {
  return useCallback((): ActiveBlockT | undefined => {
    if (typeof getPos !== 'function' || !editor) return;
    try {
      const pos = getPos();
      if (pos == null || pos < 0) return;
      const { doc } = editor.state;
      if (pos >= doc.content.size) return;

      const $pos = doc.resolve(pos);
      const nodeAtPos = $pos.nodeAfter;

      if (nodeAtPos?.type.name === typeName) {
        return { editor, node: nodeAtPos, pos };
      }
    } catch {
      return;
    }
  }, [editor, getPos, typeName]);
}
