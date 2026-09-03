import React, { useState, useCallback } from 'react';
import { BubbleMenuWrapper } from './BubbleMenuWrapper/BubbleMenuWrapper';
import { DragHandleWrapper } from './DragHandleWrapper';
import { Editor } from '@tiptap/core';
import { ImageLinkModal } from './ImageLinkModal';
import { CloudFilesPicker } from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { useInterfaceStore } from '../../store/interfaceStore';
import { useYjsContext } from '../../hooks';
import { insertLibraryFileToEditor } from '../../utils/insertLibraryFileToEditor';
import { normalizeSelectionAfterDrop } from '../../utils/normalizeSelectionAfterDrop';

type EditorToolkitProps = {
  editor: Editor;
  isReadOnly: boolean;
};

export const EditorToolkit: React.FC<EditorToolkitProps> = ({ editor, isReadOnly }) => {
  const { t } = useTranslation('editor');
  const [hasMountedDragHandle, setHasMountedDragHandle] = useState(false);
  const initialFixDone = React.useRef(false);
  const { storageItem } = useYjsContext();
  const { cloudPickerOpen, closeCloudPicker, insertAnchor } = useInterfaceStore();

  const handleDragEnd = useCallback(() => {
    // Сначала нормализуем выделение в след. тике, потом снова показываем BubbleMenu.
    // Так BubbleMenu не читает невалидный selection и не триггерит предупреждение.
    setTimeout(() => {
      normalizeSelectionAfterDrop(editor);
    }, 0);
  }, [editor]);

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
          <DragHandleWrapper editor={editor} onDragEnd={handleDragEnd} isReadOnly={isReadOnly} />
        </div>
      )}
      <BubbleMenuWrapper editor={editor} isReadOnly={isReadOnly} />
      <ImageLinkModal />
      <CloudFilesPicker
        open={cloudPickerOpen}
        onOpenChange={(open) => {
          if (!open) closeCloudPicker();
        }}
        addLabel={t('blockMenu.cloudAddToNote')}
        description={t('blockMenu.cloudFilesDescription')}
        umamiPrefix="editor"
        onSelect={async (file) => {
          try {
            await insertLibraryFileToEditor(editor, file, storageItem.content_token, insertAnchor);
          } catch (error) {
            console.error('Ошибка при вставке файла из облака:', error);
          }
        }}
      />
    </>
  );
};
