import React, { useState, useCallback } from 'react';
import { BubbleMenuWrapper } from './BubbleMenuWrapper/BubbleMenuWrapper';
import { DragHandleWrapper } from './DragHandleWrapper';
import { Editor } from '@tiptap/core';
import { ImageUploadModal } from './FileUploadDialog';
import { normalizeSelectionAfterDrop } from '../../utils/normalizeSelectionAfterDrop';

type EditorToolkitProps = {
  editor: Editor;
  isReadOnly: boolean;
};

export const EditorToolkit: React.FC<EditorToolkitProps> = ({ editor, isReadOnly }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasMountedDragHandle, setHasMountedDragHandle] = useState(false);
  const initialFixDone = React.useRef(false);

  const handleDragEnd = useCallback(() => {
    // Сначала нормализуем выделение в след. тике, потом снова показываем BubbleMenu.
    // Так BubbleMenu не читает невалидный selection и не триггерит предупреждение.
    setTimeout(() => {
      normalizeSelectionAfterDrop(editor);
      setIsDragging(false);
    }, 0);
  }, [editor]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Проверяем, можно ли показывать тулбар
  const canShowToolbar = !isReadOnly && editor.isEditable !== false;

  // Даём appendTransaction шанс починить невалидную selection (напр. после загрузки Yjs)
  React.useEffect(() => {
    if (!editor?.isDestroyed && !initialFixDone.current) {
      initialFixDone.current = true;
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor]);

  // Монтируем DragHandle только один раз при инициализации редактора
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
