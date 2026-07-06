import type { DrBoardBackgroundType, Editor } from '@ibodr/draw';
import { useCallback, useEffect, useState } from 'react';
import type { BoardBackgroundColorId } from '../config';
import { applyBoardBackgroundToEditor, type BoardBackgroundState } from '../utils/boardBackground';
import { useYjsContext } from '../providers/YjsProvider';

export function useBoardBackgroundState() {
  const {
    boardBackgroundMap,
    getBoardBackground,
    setBoardBackgroundType,
    setBoardBackgroundColor,
  } = useYjsContext();

  const [background, setBackground] = useState<BoardBackgroundState>(() => getBoardBackground());

  useEffect(() => {
    const handleChange = () => setBackground(getBoardBackground());
    boardBackgroundMap.observe(handleChange);
    handleChange();
    return () => boardBackgroundMap.unobserve(handleChange);
  }, [boardBackgroundMap, getBoardBackground]);

  const updateBackgroundType = useCallback(
    (type: DrBoardBackgroundType) => {
      setBoardBackgroundType(type);
    },
    [setBoardBackgroundType],
  );

  const updateBackgroundColor = useCallback(
    (color: BoardBackgroundColorId) => {
      setBoardBackgroundColor(color);
    },
    [setBoardBackgroundColor],
  );

  return {
    background,
    setBackgroundType: updateBackgroundType,
    setBackgroundColor: updateBackgroundColor,
  };
}

/** Синхронизирует фон доски из Yjs с редактором для всех участников. */
export function useBoardBackgroundSync(editor: Editor | null) {
  const { getBoardBackground, boardBackgroundMap } = useYjsContext();

  useEffect(() => {
    if (!editor) return;

    const sync = () => applyBoardBackgroundToEditor(editor, getBoardBackground());
    sync();
    boardBackgroundMap.observe(sync);
    return () => boardBackgroundMap.unobserve(sync);
  }, [editor, boardBackgroundMap, getBoardBackground]);
}

export function useBoardBackground(editor?: Editor | null) {
  const state = useBoardBackgroundState();
  useBoardBackgroundSync(editor ?? null);
  return state;
}
