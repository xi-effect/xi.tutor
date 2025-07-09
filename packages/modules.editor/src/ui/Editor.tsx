/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useMemo, useState } from 'react';

import { Transforms, Editor as SlateEditor, Descendant } from 'slate';
import { Slate, ReactEditor } from 'slate-react';

import { DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// Заменяем импорт из @xipkg/slatetypes на локальные типы
import { CustomElement } from '../types';

// Импорты из локальных модулей
import { EditorContent } from './EditorContent';
import { isImageUrl } from '../utils/isUrl';
import { createNode } from '../utils/createNode';
import { codeEditorInsertText } from '../utils/codeEditorInsertText';
import { useCollaborativeEditing } from '../hooks/useCollaborativeEditing';

// Удаляем дублирующее определение CustomElement, так как оно уже есть в типах
// interface CustomElement extends Element {
//   id: string;
//   type?: string;
// }

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
            const node = createNode({
              type: 'imageBlock',
              url: text,
            });

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

  return (
    <Slate editor={editor} initialValue={initialValue ?? []} onChange={handleChange}>
      <EditorContent
        editor={editor}
        isEditorReadOnly={isEditorReadOnly}
        handleOnKeyDown={handleOnKeyDown}
        items={items}
        sensors={sensors}
        clearSelection={clearSelection}
        handleOnDragEnd={handleOnDragEnd}
        draggingElementId={draggingElementId}
        setDraggingElementId={setDraggingElementId}
        activeElement={activeElement}
      />
    </Slate>
  );
};
