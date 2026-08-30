import { useCallback, useEffect, useRef, useState } from 'react';
import { DrawToolT, StrokeT } from '../types';
import { useInterfaceStore } from '../store/interfaceStore';
import { NodeSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';

function isNodeSelected(editor: Editor | null, position: number | undefined) {
  return (
    typeof position === 'number' &&
    editor?.state.selection instanceof NodeSelection &&
    editor.state.selection.from === position
  );
}

export function useDrawingToggle(
  editor: Editor | null,
  getPos: () => number | undefined,
  initial = false,
) {
  const [isDrawing, setIsDrawing] = useState(initial);

  const isModalOpen = useInterfaceStore((s) => s.activeModal !== null);
  const isBlockMenuOpen = useInterfaceStore((s) => s.isBlockMenuOpen);

  const toggle = useCallback(() => setIsDrawing((v) => !v), []);
  const close = useCallback(() => setIsDrawing(false), []);

  // Любой посторонний UI (блок-меню, модалка) поверх ноды -> выходим из режима рисования
  useEffect(() => {
    if (isModalOpen || isBlockMenuOpen) setIsDrawing(false);
  }, [isModalOpen, isBlockMenuOpen]);

  // "Последнее известное" значение isDrawing для обработчика selectionUpdate ниже.
  // Нужен, чтобы не пересоздавать подписку на editor.on(...) при каждом toggle
  const isDrawingRef = useRef(isDrawing);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  // Открытие: явный клик пользователя включил isDrawing -> синхронизируем
  // selection редактора с этой нодой, чтобы дальше можно было отследить её потерю.
  useEffect(() => {
    if (!editor || !isDrawing) return;
    const position = getPos();
    if (typeof position === 'number') {
      editor.commands.setNodeSelection(position);
    }
  }, [isDrawing, editor, getPos]);

  // Закрытие: подписка живёт всё время жизни editor/getPos, актуальность
  // isDrawing берём из рефа
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      if (!isDrawingRef.current) return;
      if (!isNodeSelected(editor, getPos())) setIsDrawing(false);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, getPos]);

  return { isDrawing, toggle, close };
}

export const DEFAULT_DRAW_TOOL: DrawToolT = { mode: 'draw', color: '#1A1A1A', size: 0.006 };

export function useDrawingTool(strokes: StrokeT[], onChangeStrokes: (next: StrokeT[]) => void) {
  const [tool, setTool] = useState<DrawToolT>(DEFAULT_DRAW_TOOL);

  const undo = useCallback(() => onChangeStrokes(strokes.slice(0, -1)), [strokes, onChangeStrokes]);
  const clear = useCallback(() => onChangeStrokes([]), [onChangeStrokes]);

  return { tool, setTool, undo, clear, canUndo: strokes.length > 0 };
}
