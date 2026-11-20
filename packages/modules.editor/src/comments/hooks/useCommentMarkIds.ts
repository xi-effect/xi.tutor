import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

function collectThreadIds(editor: Editor): Set<string> {
  const ids = new Set<string>();
  editor.state.doc.descendants((node) => {
    if (!node.isText) return true;
    for (const mark of node.marks) {
      if (mark.type.name === 'comment' && mark.attrs.threadId) ids.add(mark.attrs.threadId);
    }
    return true;
  });
  return ids;
}

function isSameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

/** Id тредов, чья марка сейчас реально есть в документе. Обновляется при любых правках (свои и чужие). */
export function useCommentMarkIds(editor: Editor | null): Set<string> {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const sync = () => {
      if (editor.isDestroyed) return;
      const next = collectThreadIds(editor);
      setIds((prev) => (isSameSet(prev, next) ? prev : next));
    };

    sync();
    editor.on('create', sync);
    editor.on('update', sync);
    return () => {
      editor.off('create', sync);
      editor.off('update', sync);
    };
  }, [editor]);

  return ids;
}
