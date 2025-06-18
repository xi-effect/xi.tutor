import React, { useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Editable, ReactEditor, RenderElementProps } from 'slate-react';
import { DndContext, DragEndEvent, DragOverlay, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import { CustomElement } from '../types';
import { RenderElement } from '../ui/elements/RenderElement';
import { SortableElement } from '../ui/components/SortableElement';
import { InlineToolbar } from '../ui/components/InlineToolbar';
import { Leaf } from '../ui/components/Leaf';
import { useDecorateCode } from '../hooks/useDecorateCode';
import DragOverlayContent from '../ui/components/DragOverlayContent';

interface EditorContentProps {
  editor: ReactEditor;
  isEditorReadOnly: boolean;
  items: string[];
  sensors: ReturnType<typeof useSensors>;
  clearSelection: () => void;
  handleOnDragEnd: (event: DragEndEvent) => void;
  draggingElementId: string;
  setDraggingElementId: (id: string) => void;
  activeElement?: CustomElement;
  handleOnKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const EditorContent = ({
  editor,
  isEditorReadOnly,
  handleOnKeyDown,
  items,
  sensors,
  clearSelection,
  handleOnDragEnd,
  draggingElementId,
  setDraggingElementId,
  activeElement,
}: EditorContentProps) => {
  // Теперь эти хуки используются внутри контекста Slate
  const decorateCode = useDecorateCode();
  // Используем draggingElementId для определения состояния перетаскивания
  const isDragging = useMemo(() => Boolean(draggingElementId), [draggingElementId]);

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      const path = ReactEditor.findPath(editor, props.element);
      const isTopLevel = path.length === 1;

      return isTopLevel ? (
        <SortableElement {...props} renderElement={RenderElement} />
      ) : (
        <RenderElement {...props} />
      );
    },
    [editor],
  );

  if (isEditorReadOnly) {
    return (
      <Editable
        readOnly
        className="flex flex-col gap-2 p-2 text-gray-100 focus-visible:outline-none focus-visible:[&_*]:outline-none"
        renderElement={renderElement}
        decorate={decorateCode}
        renderLeaf={(props) => <Leaf {...props} />}
      />
    );
  }

  return (
    <DndContext
      onDragStart={(event) => {
        if (event.active) {
          clearSelection();
          setDraggingElementId(`${event.active.id}`);
        }
      }}
      onDragEnd={handleOnDragEnd}
      onDragCancel={() => {
        setDraggingElementId('');
      }}
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <InlineToolbar />
        <Editable
          onKeyDown={handleOnKeyDown}
          className={`flex flex-col gap-2 p-2 text-gray-100 focus-visible:outline-none focus-visible:[&_*]:outline-none ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          renderElement={renderElement}
          renderLeaf={(props) => <Leaf {...props} />}
          decorate={decorateCode}
        />
      </SortableContext>
      {createPortal(
        <DragOverlay>
          {activeElement && <DragOverlayContent element={activeElement} />}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};
