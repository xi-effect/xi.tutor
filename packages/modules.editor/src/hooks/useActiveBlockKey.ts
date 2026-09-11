import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { BlockTypeT } from '../types';

/** Ключ активного блока — совпадает с `type` в INSERT_BLOCK_ACTIONS (+ 'code'). */
export type ActiveBlockKey = BlockTypeT | 'code';

/**
 * Тип блока под курсором, с приоритетом от специфичного к общему
 * (список/чеклист/код/заголовок → и только потом параграф, т.к. внутри
 * элемента списка `isActive('paragraph')` тоже true).
 */
const readActiveBlockKey = (editor: Editor): ActiveBlockKey | null => {
  if (editor.isActive('codeBlock')) return 'code';
  if (editor.isActive('taskList')) return 'taskList';
  if (editor.isActive('bulletList')) return 'bulletList';
  if (editor.isActive('orderedList')) return 'orderedList';
  if (editor.isActive('heading', { level: 1 })) return 'heading1';
  if (editor.isActive('heading', { level: 2 })) return 'heading2';
  if (editor.isActive('heading', { level: 3 })) return 'heading3';
  if (editor.isActive('paragraph')) return 'paragraph';
  return null;
};

/**
 * Реактивная подсветка активной кнопки в мобильном тулбаре редактора.
 *
 * `transaction` летит на каждое нажатие клавиши и каждый удалённый Yjs-апдейт,
 * поэтому пересчёт (до 8 `isActive`) коалесцируем через requestAnimationFrame —
 * не чаще раза за кадр.
 */
export const useActiveBlockKey = (editor: Editor): ActiveBlockKey | null => {
  const [key, setKey] = useState<ActiveBlockKey | null>(() => {
    try {
      return readActiveBlockKey(editor);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let raf = 0;

    const flush = () => {
      raf = 0;
      try {
        const next = readActiveBlockKey(editor);
        setKey((prev) => (prev === next ? prev : next));
      } catch {
        // переходное невалидное состояние — оставляем прошлое значение
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };

    editor.on('selectionUpdate', schedule);
    editor.on('transaction', schedule);
    flush();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      editor.off('selectionUpdate', schedule);
      editor.off('transaction', schedule);
    };
  }, [editor]);

  return key;
};
