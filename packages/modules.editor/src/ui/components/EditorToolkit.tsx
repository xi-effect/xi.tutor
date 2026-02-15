import React, { useState, useCallback } from 'react';
import { BubbleMenuWrapper } from './BubbleMenuWrapper/BubbleMenuWrapper';
import { DragHandleWrapper } from './DragHandleWrapper';
import { Editor } from '@tiptap/core';
import { ImageUploadModal } from './FileUploadDialog';

type EditorToolkitProps = {
  editor: Editor;
  isReadOnly: boolean;
};

export const EditorToolkit: React.FC<EditorToolkitProps> = ({ editor, isReadOnly }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasMountedDragHandle, setHasMountedDragHandle] = useState(false);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Выбор после drop оставляем как установил ProseMirror — не перезаписываем
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Проверяем, можно ли показывать тулбар
  const canShowToolbar = !isReadOnly && editor.isEditable !== false;

  // Монтируем DragHandle только один раз при инициализации редактора
  // Это предотвращает проблемы с размонтированием порталов
  React.useEffect(() => {
    if (editor && !hasMountedDragHandle) {
      setHasMountedDragHandle(true);
    }
  }, [editor, hasMountedDragHandle]);

  return (
    <>
      {/* Монтируем DragHandle только один раз и всегда рендерим, скрывая через CSS */}
      {hasMountedDragHandle && (
        <div
          style={{
            display: canShowToolbar ? 'block' : 'none',
            pointerEvents: canShowToolbar ? 'auto' : 'none',
          }}
        >
          <DragHandleWrapper
            editor={editor}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isReadOnly={isReadOnly}
          />
        </div>
      )}

      {!isDragging && <BubbleMenuWrapper editor={editor} isReadOnly={isReadOnly} />}
      <ImageUploadModal />
    </>
  );
};
