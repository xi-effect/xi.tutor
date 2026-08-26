import { StrokeT } from '../types';
import { useDrawingTool } from './useDrawing';

export function useDrawingLayer(strokes: StrokeT[], onChangeStrokes: (next: StrokeT[]) => void) {
  const { tool, setTool, undo, clear, canUndo } = useDrawingTool(strokes, onChangeStrokes);

  const overlayProps = { strokes, onChangeStrokes, tool };
  const toolbarProps = { tool, onToolChange: setTool, onUndo: undo, onClear: clear, canUndo };

  return { overlayProps, toolbarProps };
}
