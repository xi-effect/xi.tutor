import { memo, useEffect } from 'react';
import { Text } from 'react-konva';
import { useBoardStore, useUIStore } from '../../../store';
import { BoardElement } from '../../../types';
import { useElementHandlers } from '../../../hooks';
import { useEditableTextarea } from '../model/useEditableTextarea';

export const EditableText = memo(({ element }: { element: BoardElement }) => {
  const {
    selectedElementId,
    editingElementId,
    setEditingElementId,
    updateElement,
    removeElement,
    selectElement,
  } = useBoardStore();

  const { scale } = useUIStore();
  const { handleSelect, handleDragEnd } = useElementHandlers();

  const isEditing = editingElementId === element.id;

  const { textRef, startEditing, stopEditing } = useEditableTextarea();

  useEffect(() => {
    if (isEditing) {
      startEditing(
        element,
        (newText, width, height) => {
          if (!newText) {
            removeElement(element.id);
          } else {
            updateElement(element.id, {
              ...element,
              text: newText,
              width,
              height,
            });
            selectElement(element.id);
          }
          setEditingElementId(null);
        },
        () => {
          setEditingElementId(null);
        },
      );
    } else {
      stopEditing();
    }
  }, [isEditing, element, scale]);

  const hitStrokeWidth = Math.max(20, Math.min(40, 20 / scale));

  return (
    <Text
      id={element.id}
      ref={textRef}
      hitStrokeWidth={hitStrokeWidth}
      visible={!isEditing}
      text={element.text || ' '}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      fill={element.fill}
      x={element.x}
      y={element.y}
      scaleX={element.scaleX ?? 1}
      scaleY={element.scaleY ?? 1}
      width={element.width}
      height={element.height}
      draggable={selectedElementId === element.id}
      onClick={() => handleSelect(element.id)}
      onDragEnd={(e) => handleDragEnd(e, element)}
      onDblClick={() => {
        selectElement(null);
        setEditingElementId(element.id);
      }}
    />
  );
});

EditableText.displayName = 'EditableText';
