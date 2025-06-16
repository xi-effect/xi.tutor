import { useCallback, useRef, useMemo } from 'react';
import Konva from 'konva';
import { useBoardStore } from '../store';
import { BoardElement, ToolbarElement } from '../types';
import { useStage } from '../providers';
import { useTrackedTransaction } from '../features';

export const useElementHandlers = () => {
  const {
    selectElement,
    selectedTool,
    addElement,
    updateElement,
    selectedElementId,
    setIsElementTransforming,
    setSelectToolbarPosition,
    removeElement,
    boardElements,
  } = useBoardStore();
  const { transformerRef, layerRef } = useStage();

  const throttleUpdate = useRef<number | null>(null);
  const prevBox = useRef<{ x: number; y: number } | null>(null);
  const { executeTrackedTransaction } = useTrackedTransaction();

  const toolbarElement = useMemo<ToolbarElement>(
    () => ({
      id: 'toolbar',
      type: 'toolbar',
      x: 0,
      y: 0,
    }),
    [],
  );

  const updateToolbarPosition = useCallback(
    (x: number, y: number) => {
      if (!selectedElementId) return;

      const updatedToolbar = { ...toolbarElement, x, y };
      const existingToolbar = boardElements.find((el) => el.id === 'toolbar');
      if (existingToolbar) {
        updateElement('toolbar', updatedToolbar);
      } else {
        addElement(updatedToolbar);
      }

      setSelectToolbarPosition({ x, y });
    },
    [
      selectedElementId,
      updateElement,
      addElement,
      toolbarElement,
      setSelectToolbarPosition,
      boardElements,
    ],
  );

  const onChangeTransformerPosition = useCallback(() => {
    if (throttleUpdate.current) {
      cancelAnimationFrame(throttleUpdate.current);
    }
    throttleUpdate.current = requestAnimationFrame(() => {
      if (transformerRef.current && selectedElementId) {
        const box = transformerRef.current.getClientRect();

        if (prevBox.current?.x === box.x && prevBox.current?.y === box.y) {
          return;
        }

        prevBox.current = box;

        updateToolbarPosition(box.x, box.y);
      }
    });
  }, [selectedElementId, updateToolbarPosition, transformerRef]);

  const handleSelect = useCallback(
    (id: string) => {
      selectElement(null);
      if (selectedTool === 'select') {
        selectElement(id);
        if (transformerRef.current) {
          const box = transformerRef.current.getClientRect();
          updateToolbarPosition(box.x, box.y);
        }
      }
    },
    [selectElement, selectedTool, transformerRef, updateToolbarPosition],
  );

  const handleDragStart = useCallback(() => {
    setIsElementTransforming(true);
    setSelectToolbarPosition({ x: 0, y: 0 });
    removeElement('toolbar');
  }, [setIsElementTransforming, setSelectToolbarPosition, removeElement]);

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, element: BoardElement) => {
      if (!transformerRef.current || !selectedElementId) return;

      const box = transformerRef.current.getClientRect();
      updateToolbarPosition(box.x, box.y);
      setIsElementTransforming(false);

      executeTrackedTransaction(
        () =>
          updateElement(element.id, {
            x: e.target.x(),
            y: e.target.y(),
          }),
        'move',
      );
    },
    [
      transformerRef,
      selectedElementId,
      updateToolbarPosition,
      setIsElementTransforming,
      executeTrackedTransaction,
      updateElement,
    ],
  );

  const handleTransformEnd = useCallback(() => {
    if (!transformerRef.current || !selectedElementId || !layerRef.current) return;

    const selectedNode = layerRef.current.findOne(`#${selectedElementId}`);
    if (!selectedNode) return;

    const x = selectedNode.x();
    const y = selectedNode.y();
    const scaleX = selectedNode.scaleX();
    const scaleY = selectedNode.scaleY();

    executeTrackedTransaction(
      () =>
        updateElement(selectedElementId, {
          x,
          y,
          scaleX,
          scaleY,
        }),
      'transform',
    );

    const box = transformerRef.current.getClientRect();
    updateToolbarPosition(box.x, box.y);
    setIsElementTransforming(false);
  }, [
    transformerRef,
    selectedElementId,
    layerRef,
    executeTrackedTransaction,
    updateToolbarPosition,
    setIsElementTransforming,
    updateElement,
  ]);

  return {
    handleSelect,
    handleDragEnd,
    handleTransformEnd,
    handleDragStart,
    onChangeTransformerPosition,
  };
};
