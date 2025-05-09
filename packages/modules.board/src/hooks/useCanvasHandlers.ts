import { useRef } from 'react';
import Konva from 'konva';
import { useDebouncedFunction } from '@xipkg/utils';
import { useBoardStore, useUIStore } from '../store';
import { useStage } from '../providers';
import { useZoom } from './useWheelZoom';
import { BoardElement } from '../types';

export const useCanvasHandlers = () => {
  const { stageRef, layerRef, getRelativePointerPosition } = useStage();
  const { addElement, selectedTool, selectElement, updateElement, removeElement } = useBoardStore();
  const { setStagePosition } = useUIStore();

  const currentLineId = useRef<string>('');
  const currentElementRef = useRef<BoardElement | null>(null);
  const isDrawing = useRef(false);
  const isErasing = useRef(false);
  const toEraseRef = useRef<Set<string>>(new Set());
  const eraserTrailRef = useRef<Konva.Line | null>(null);
  const prevPointerRef = useRef<{ x: number; y: number } | null>(null);

  const { handleWheel } = useZoom(stageRef);

  const debouncedElementUpdate = useDebouncedFunction(updateElement, 300);

  const handleOnWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    setStagePosition(e.currentTarget.position());
    handleWheel(e);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool === 'pen') {
      isDrawing.current = true;
      const pos = getRelativePointerPosition();
      if (!pos) return;

      const newLineId = `line-${Date.now()}`;
      currentLineId.current = newLineId;

      const newLine = {
        type: 'line',
        id: newLineId,
        points: [pos.x, pos.y],
        stroke: 'black',
      } as BoardElement;

      addElement(newLine);
      currentElementRef.current = newLine;
      return;
    }

    if (selectedTool === 'eraser') {
      isErasing.current = true;
      const pos = getRelativePointerPosition();
      if (!pos) return;

      prevPointerRef.current = pos;

      const trail = new Konva.Line({
        stroke: '#bbb',
        strokeWidth: 20,
        opacity: 0,
        lineCap: 'round',
        lineJoin: 'round',
        listening: false,
        points: [pos.x, pos.y, pos.x, pos.y],
      });

      eraserTrailRef.current = trail;
      layerRef.current?.add(trail);
      layerRef.current?.batchDraw();
    }

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty || selectedTool !== 'select') {
      selectElement(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDrawing.current && currentElementRef.current) {
      const stage = e.target.getStage();
      const pos = stage?.getRelativePointerPosition();
      if (!pos) return;

      const layer = layerRef.current;

      if (!layer) return;

      const line = layer.findOne(`#${currentLineId.current}`) as Konva.Line | null;

      if (!line) return;

      const newPoints = [...line.points(), pos.x, pos.y];
      line.points(newPoints);
      layer.batchDraw();

      debouncedElementUpdate(currentLineId.current, { points: newPoints });
    }
    if (isErasing.current && eraserTrailRef.current) {
      const stage = e.target.getStage();
      const pos = stage?.getRelativePointerPosition();
      if (!pos || !prevPointerRef.current) return;

      const target = e.target;
      const { x: prevX, y: prevY } = prevPointerRef.current;
      eraserTrailRef.current.opacity(0.5);
      eraserTrailRef.current.points([prevX, prevY, pos.x, pos.y]);
      layerRef.current?.batchDraw();

      prevPointerRef.current = pos;

      if (target !== stage && target instanceof Konva.Shape) {
        const elementId = target.id();

        if (!toEraseRef.current.has(elementId)) {
          toEraseRef.current.add(elementId);

          const originalStroke = target.stroke();
          const originalFill = target.fill();

          target.setAttr('originalStroke', originalStroke);
          target.setAttr('originalFill', originalFill);

          if (originalStroke) target.stroke('#ccc');
          if (originalFill) target.fill('#ccc');
          target.opacity(0.5);

          layerRef.current?.batchDraw();
        }
      }
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    isErasing.current = false;
    const layer = layerRef.current;
    if (layer) {
      toEraseRef.current.forEach((id) => {
        const shape = layer.findOne(`#${id}`) as Konva.Shape | null;
        if (shape) {
          const originalStroke = shape.getAttr('originalStroke');
          const originalFill = shape.getAttr('originalFill');

          if (originalStroke) shape.stroke(originalStroke);
          if (originalFill) shape.fill(originalFill);
          shape.opacity(1);
          if (selectedTool === 'eraser') {
            removeElement(id);
          }
          shape.setAttr('originalStroke', null);
        }
      });

      toEraseRef.current.clear();
      layer.batchDraw();
    }
    if (eraserTrailRef.current) {
      eraserTrailRef.current?.destroy();
      eraserTrailRef.current = null;

      prevPointerRef.current = null;

      layerRef.current?.batchDraw();
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setStagePosition(e.currentTarget.position());
  };

  return { handleOnWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleDragEnd };
};
