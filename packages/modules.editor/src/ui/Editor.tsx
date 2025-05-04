/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Transforms, Editor as SlateEditor, Descendant, Element } from 'slate';
import { Slate, Editable, ReactEditor, RenderElementProps } from 'slate-react';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import { type MediaElement } from '@xipkg/slatetypes';

// Импорты из локальных модулей
import { isImageUrl } from '../utils/isUrl';
import { RenderElement } from '../ui/elements/RenderElement';
import { createNode } from '../utils/createNode';
import { SortableElement } from '../ui/components/SortableElement';
import { InlineToolbar } from '../ui/components/InlineToolbar';
import { Leaf } from '../ui/components/Leaf';
import { useDecorateCode } from '../hooks/useDecorateCode';
import { codeEditorInsertText } from '../utils/codeEditorInsertText';
import DragOverlayContent from '../ui/components/DragOverlayContent';
import { useCollaborativeEditing } from '../hooks/useCollaborativeEditing';

// Расширенный тип для элементов с id
interface CustomElement extends Element {
  id: string;
  type?: string;
}

type EditorPropsT = {
  initialValue?: Descendant[];
  onChange?: (value: Descendant[]) => void;
  readOnly?: boolean;
  documentName?: string;
  serverUrl?: string;
};

export const Editor = ({
  initialValue,
  onChange,
  readOnly = false,
  documentName,
  serverUrl,
}: EditorPropsT) => {
  // Используем новый хук вместо создания провайдера и редактора вручную
  const { editor, isReadOnly } = useCollaborativeEditing({
    documentName,
    serverUrl,
  });

  const decorateCode = useDecorateCode();

  const [draggingElementId, setDraggingElementId] = useState<string>('');

  // Приведение типов для обеспечения совместимости с CustomElement
  const activeElement = editor.children.find(
    (x) => (x as CustomElement).id === draggingElementId,
  ) as CustomElement | undefined;

  const clearSelection = () => {
    ReactEditor.blur(editor);
    Transforms.deselect(editor);
    window.getSelection()?.empty();
  };

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      const isTopLevel = ReactEditor.findPath(editor, props.element).length === 1;

      return isTopLevel ? (
        <SortableElement {...props} renderElement={RenderElement} />
      ) : (
        <RenderElement {...props} />
      );
    },
    [editor],
  );

  // Приведение типов для получения id из элементов
  const items = useMemo(
    () => editor.children.map((element) => (element as CustomElement).id),
    [editor.children],
  );

  const pointSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 1,
    },
  });

  const sensors = useSensors(pointSensor);

  const handleChange = (value: Descendant[]) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleCodePaste = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      event.preventDefault();

      navigator.clipboard
        .readText()
        .then((text) => {
          if (text) {
            const { selection } = editor;

            if (selection) {
              const [parentNode] = SlateEditor.parent(editor, selection);

              if (parentNode && (parentNode as CustomElement)?.type === 'code') {
                Transforms.insertText(editor, text);
              }
            }
          }
        })
        .catch((err) => {
          console.error('Failed to paste code:', err);
        });
    },
    [editor],
  );

  const handleOnDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id;
    const edChildren = editor.children as CustomElement[];
    const overIndex = edChildren.findIndex((x) => x.id === overId);

    if (overId !== draggingElementId && overIndex !== -1) {
      Transforms.moveNodes(editor, {
        at: [],
        match: (node) => (node as CustomElement).id === draggingElementId,
        to: [overIndex],
      });
    }

    setDraggingElementId('');
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      handleCodePaste(event);
      event.preventDefault();

      navigator.clipboard
        .readText()
        .then((text) => {
          if (isImageUrl(text)) {
            const node = createNode({ type: 'imageBlock', url: text } as MediaElement);
            Transforms.insertNodes(editor, node, {
              at: [editor.children.length],
            });
          }
        })
        .catch((err) => {
          console.error('Failed to paste image:', err);
        });
    }

    if (event.key === 'Enter') {
      codeEditorInsertText(editor, event, '\n');
    }

    if (event.key === 'Tab') {
      codeEditorInsertText(editor, event, '  ');
    }
  };

  // Проверяем режим только для чтения из пропса или из провайдера
  const isEditorReadOnly = readOnly || isReadOnly;

  if (isEditorReadOnly) {
    return (
      <Slate editor={editor} initialValue={initialValue ?? []}>
        <Editable
          readOnly
          className="flex flex-col gap-2 p-2 text-gray-100 focus-visible:outline-none focus-visible:[&_*]:outline-none"
          renderElement={renderElement}
          // @ts-ignore
          decorate={decorateCode}
          renderLeaf={(props) => <Leaf {...props} />}
        />
      </Slate>
    );
  }

  return (
    <Slate editor={editor} initialValue={initialValue ?? []} onChange={handleChange}>
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
            className="flex flex-col gap-2 p-2 text-gray-100 focus-visible:outline-none focus-visible:[&_*]:outline-none"
            renderElement={renderElement}
            renderLeaf={(props) => <Leaf {...props} />}
            // @ts-ignore
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
    </Slate>
  );
};
