import { useCallback, useEffect, useState } from 'react';
import { DrawToolT, StrokeT } from '../types';
import { useInterfaceStore } from '../store/interfaceStore';

export function useDrawingToggle(initial = false) {
  const [isDrawing, setIsDrawing] = useState(initial);
  const isModalOpen = useInterfaceStore((s) => s.activeModal !== null);
  const isBlockMenuOpen = useInterfaceStore((s) => s.isBlockMenuOpen);

  const toggle = useCallback(() => setIsDrawing((v) => !v), []);
  const close = useCallback(() => setIsDrawing(false), []);

  useEffect(() => {
    if (isBlockMenuOpen) setIsDrawing(false);
  }, [isBlockMenuOpen]);

  useEffect(() => {
    if (isModalOpen) setIsDrawing(false);
  }, [isModalOpen]);

  return { isDrawing, toggle, close };
}

export const DEFAULT_DRAW_TOOL: DrawToolT = { mode: 'draw', color: '#1A1A1A', size: 0.006 };

export function useDrawingTool(strokes: StrokeT[], onChangeStrokes: (next: StrokeT[]) => void) {
  const [tool, setTool] = useState<DrawToolT>(DEFAULT_DRAW_TOOL);

  const undo = useCallback(() => onChangeStrokes(strokes.slice(0, -1)), [strokes, onChangeStrokes]);
  const clear = useCallback(() => onChangeStrokes([]), [onChangeStrokes]);

  return { tool, setTool, undo, clear, canUndo: strokes.length > 0 };
}
