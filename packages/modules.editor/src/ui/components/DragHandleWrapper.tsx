import { Editor } from '@tiptap/core';
import { Move, Close, Plus } from '@xipkg/icons';

import DragHandle from '@tiptap/extension-drag-handle-react';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { BlockMenu } from './BlockMenu';
import { useCallback, useRef, useState } from 'react';
import { ActiveBlockT } from '../../types';

type DragHandleWrapperPropsT = {
  editor: Editor;
  onDragStart?: () => void;
  onDragEnd: () => void;
  isReadOnly?: boolean;
};

export const DragHandleWrapper = ({
  editor,
  onDragStart,
  onDragEnd,
  isReadOnly,
}: DragHandleWrapperPropsT) => {
  const { t } = useTranslation('editor');
  const activeBlockRef = useRef<{ pos: number; id: string | null } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNodeChange = useCallback((data: ActiveBlockT) => {
    if (!data?.node || data?.pos === null) return;

    const id = data.node.attrs?.['id'] ?? data.node.attrs?.id ?? null;

    activeBlockRef.current = { pos: data.pos, id };
  }, []);

  const getActiveBlock = useCallback((): ActiveBlockT | undefined => {
    if (!activeBlockRef.current || !editor) return;

    const { pos, id } = activeBlockRef.current;

    try {
      const { doc } = editor.state;

      // Сначала пробуем найти по id (надёжно при Yjs-синке)
      if (id) {
        let found: ActiveBlockT | undefined;
        doc.descendants((node, nodePos) => {
          if (found) return false;
          const nodeId = node.attrs?.['id'] ?? node.attrs?.id;
          if (nodeId === id && node.isBlock) {
            found = { editor, node, pos: nodePos };
            return false;
          }
          return true;
        });
        if (found) return found;
      }

      // Fallback: проверяем позицию
      if (pos >= 0 && pos < doc.content.size) {
        const node = doc.nodeAt(pos);

        if (node?.isBlock) {
          return { editor, node, pos };
        }
      }
    } catch (error) {
      console.warn('getActiveBlock error:', error);
    }

    return undefined;
  }, [editor]);

  return (
    <DragHandle
      editor={editor}
      className="drag-handle"
      computePositionConfig={{
        placement: 'left-start',
        strategy: 'absolute',
      }}
      onElementDragStart={onDragStart}
      onElementDragEnd={onDragEnd}
      nested
      onNodeChange={handleNodeChange}
    >
      <div className="pointer-events-auto mr-1 flex items-center gap-2">
        <BlockMenu
          editor={editor}
          isReadOnly={isReadOnly}
          open={menuOpen}
          setOpen={setMenuOpen}
          getActiveBlock={getActiveBlock}
        >
          <Button
            className="hover:bg-background-page active:bg-background-page group h-5 w-5 rounded p-0"
            variant="none"
          >
            {menuOpen ? (
              <Close size="sm" className="fill-icon-primary size-6" />
            ) : (
              <Plus size="sm" className="fill-icon-primary size-6" />
            )}
          </Button>
        </BlockMenu>

        <Button
          className="hover:bg-background-page active:bg-background-page group h-5 w-5 cursor-grab rounded p-0 active:cursor-grabbing"
          variant="none"
          title={t('dragHandle.dragBlock')}
        >
          <Move size="sm" className="fill-icon-primary size-6" />
        </Button>
      </div>
    </DragHandle>
  );
};
