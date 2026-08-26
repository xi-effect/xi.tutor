import { Editor } from '@tiptap/core';
import { Move, Close, Plus } from '@xipkg/icons';

import DragHandle from '@tiptap/extension-drag-handle-react';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { BlockMenu } from './BlockMenu';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActiveBlockT } from '../../types';
import { useInterfaceStore } from '../../store/interfaceStore';

function getEditorContentBox(editorDom: HTMLElement) {
  const rect = editorDom.getBoundingClientRect();
  const styles = getComputedStyle(editorDom);
  const paddingLeft = parseFloat(styles.paddingLeft) || 0;
  const paddingRight = parseFloat(styles.paddingRight) || 0;

  return {
    left: rect.left + paddingLeft,
    right: rect.right - paddingRight,
  };
}

function getBlockDom(editor: Editor, pos: number): HTMLElement | null {
  const nodeDom = editor.view.nodeDOM(pos);
  if (nodeDom instanceof HTMLElement) return nodeDom;
  if (nodeDom instanceof Node && nodeDom.parentElement) return nodeDom.parentElement;
  return null;
}

/** Сдвигает ручку в общий gutter на величину отступа узла (списки, цитаты). */
function snapToEditorGutter(editor: Editor) {
  return {
    name: 'snapToEditorGutter',
    fn({
      x,
      y,
      elements,
    }: {
      x: number;
      y: number;
      elements: { reference: { getBoundingClientRect: () => { left: number } } };
    }) {
      const contentLeft = getEditorContentBox(editor.view.dom).left;
      const indent = elements.reference.getBoundingClientRect().left - contentLeft;

      if (Math.abs(indent) < 1) return {};

      return { x: x - indent, y };
    },
  };
}

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
  const [isOpen, setIsOpen] = useState(false);
  const setGlobalBlockMenuOpen = useInterfaceStore((s) => s.setBlockMenuOpen);

  const setMenuOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      setGlobalBlockMenuOpen(open);
    },
    [setGlobalBlockMenuOpen],
  );

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

  const computePositionConfig = useMemo(
    () => ({
      placement: 'left-start' as const,
      strategy: 'absolute' as const,
      middleware: [snapToEditorGutter(editor)],
    }),
    [editor],
  );

  const getReferencedVirtualElement = useCallback(() => {
    const current = activeBlockRef.current;
    if (!current || current.pos < 0) return null;

    const blockDom = getBlockDom(editor, current.pos);
    if (!blockDom) return null;

    const nodeRect = blockDom.getBoundingClientRect();
    const { left, right } = getEditorContentBox(editor.view.dom);

    return {
      contextElement: blockDom,
      getBoundingClientRect: () =>
        DOMRect.fromRect({
          x: left,
          y: nodeRect.top,
          width: Math.max(0, right - left),
          height: nodeRect.height,
        }),
    };
  }, [editor]);

  return (
    <DragHandle
      editor={editor}
      className="drag-handle"
      computePositionConfig={computePositionConfig}
      getReferencedVirtualElement={getReferencedVirtualElement}
      onElementDragStart={onDragStart}
      onElementDragEnd={onDragEnd}
      nested
      onNodeChange={handleNodeChange}
    >
      <div className="pointer-events-auto mr-1 flex items-center gap-2">
        <BlockMenu
          editor={editor}
          isReadOnly={isReadOnly}
          open={isOpen}
          setOpen={setMenuOpen}
          getActiveBlock={getActiveBlock}
        >
          <Button
            className="hover:bg-background-page active:bg-background-page group h-5 w-5 rounded p-0"
            variant="none"
          >
            {isOpen ? (
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
