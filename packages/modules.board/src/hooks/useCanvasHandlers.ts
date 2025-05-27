import { useRef } from 'react';
import Konva from 'konva';
import { useBoardStore, useUIStore } from '../store';
import { useStage } from '../providers';
import { useZoom } from './useWheelZoom';
import { BoardElement } from '../types';
import { useTrackedTransaction } from '../features';
import { runWithoutSync } from '../utils';

export const useCanvasHandlers = () => {
  const { stageRef, layerRef, getRelativePointerPosition } = useStage();
  const { addElement, selectedTool, selectElement, updateElement, removeElement } = useBoardStore();
  const { setStagePosition } = useUIStore();

  const { executeTrackedTransaction } = useTrackedTransaction();

  const currentLineId = useRef<string>('');
  const currentElementRef = useRef<BoardElement | null>(null);
  const isDrawing = useRef(false);
  const isErasing = useRef(false);
  const toEraseRef = useRef<Set<string>>(new Set());
  const eraserTrailRef = useRef<Konva.Line | null>(null);
  const prevPointerRef = useRef<{ x: number; y: number } | null>(null);

  const { handleWheel } = useZoom(stageRef);

  const handleOnWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    setStagePosition(e.currentTarget.position());
    handleWheel(e);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pos = getRelativePointerPosition();
    if (!pos) return;

    if (selectedTool === 'pen') {
      isDrawing.current = true;

      //при одновременном рисовании несколькими пользователями, id линии может совпасть
      //можно использовать clientId + Date.now() для уникальности
      const newLineId = `line-${Date.now()}`;
      currentLineId.current = newLineId;

      const newLine: BoardElement = {
        type: 'line',
        id: newLineId,
        points: [pos.x, pos.y],
        stroke: 'black',
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      };

      runWithoutSync(() => addElement(newLine));

      currentElementRef.current = newLine;
      return;
    }

    if (selectedTool === 'eraser') {
      isErasing.current = true;
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

    const clickedOnEmpty = e.target === stage;
    if (clickedOnEmpty || selectedTool !== 'select') {
      selectElement(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pos = getRelativePointerPosition();
    if (!pos) return;

    if (isDrawing.current && currentElementRef.current) {
      const layer = layerRef.current;
      const line = layer?.findOne(`#${currentLineId.current}`) as Konva.Line | null;
      if (!line) return;

      const newPoints = [...line.points(), pos.x, pos.y];
      line.points(newPoints);
      layer?.batchDraw();

      currentElementRef.current.points = newPoints;
    }

    if (isErasing.current && eraserTrailRef.current && prevPointerRef.current) {
      const { x: prevX, y: prevY } = prevPointerRef.current;
      eraserTrailRef.current.opacity(0.5);
      eraserTrailRef.current.points([prevX, prevY, pos.x, pos.y]);
      layerRef.current?.batchDraw();

      prevPointerRef.current = pos;

      const target = e.target;
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

    if (selectedTool === 'pen') {
      const line = currentElementRef.current;
      if (line) {
        executeTrackedTransaction(() => updateElement(line.id, { points: line.points }));
      }
    }

    if (selectedTool === 'eraser') {
      const layer = layerRef.current;

      toEraseRef.current.forEach((id) => {
        const shape = layer?.findOne(`#${id}`) as Konva.Shape | null;
        if (shape) {
          const originalStroke = shape.getAttr('originalStroke');
          const originalFill = shape.getAttr('originalFill');

          if (originalStroke) shape.stroke(originalStroke);
          if (originalFill) shape.fill(originalFill);
          shape.opacity(1);

          executeTrackedTransaction(() => removeElement(id));

          shape.setAttr('originalStroke', null);
          shape.setAttr('originalFill', null);
        }
      });

      toEraseRef.current.clear();

      eraserTrailRef.current?.destroy();
      eraserTrailRef.current = null;
      prevPointerRef.current = null;

      layer?.batchDraw();
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setStagePosition(e.currentTarget.position());
  };

  return { handleOnWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleDragEnd };
};
