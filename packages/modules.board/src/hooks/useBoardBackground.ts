import type { DrBoardBackgroundType, Editor } from '@ibodr/draw';
import { useCallback, useEffect, useState } from 'react';
import type { BoardBackgroundColorId, BoardColorAppearance } from '../config';
import { applyBoardBackgroundToEditor, type BoardBackgroundState } from '../utils/boardBackground';
import { useYjsContext } from '../providers/YjsProvider';

function getThemeAppearance(): BoardColorAppearance {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

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
  const [appearance, setAppearance] = useState<BoardColorAppearance>(getThemeAppearance);

  useEffect(() => {
    const root = document.documentElement;
    const syncAppearance = () => setAppearance(getThemeAppearance());

    syncAppearance();
    const observer = new MutationObserver(syncAppearance);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editor) return;

    const sync = () => applyBoardBackgroundToEditor(editor, getBoardBackground(), appearance);
    sync();
    boardBackgroundMap.observe(sync);
    return () => boardBackgroundMap.unobserve(sync);
  }, [editor, boardBackgroundMap, getBoardBackground, appearance]);
}

export function useBoardBackground(editor?: Editor | null) {
  const state = useBoardBackgroundState();
  useBoardBackgroundSync(editor ?? null);
  return state;
}
