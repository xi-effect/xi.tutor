import { Editor } from '@tiptap/core';
import { Add, Close, Move } from '@xipkg/icons';

import DragHandle from '@tiptap/extension-drag-handle-react';
import { useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { BlockMenu, type BlockMenuMode } from './BlockMenu';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActiveBlockT } from '../../types';
import { EDITOR_MOBILE_MEDIA_QUERY } from '../../const/breakpoints';
import { useInterfaceStore } from '../../store/interfaceStore';
import { setDragHandleLocked } from '../../utils/setDragHandleLocked';
import {
  getDragHandleElement,
  getFirstBlockAnchor,
  positionDragHandle,
} from '../../utils/positionDragHandle';

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

const handleButtonClass = 'drag-handle-btn';
const handleIconClass = 'drag-handle-icon';

/** Без edge detection: иначе при движении к ручке цель прыгает с пункта на весь список. */
const NESTED_DRAG_OPTIONS = { edgeDetection: 'none' as const };

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
  const isMobile = useMediaQuery(EDITOR_MOBILE_MEDIA_QUERY);
  const activeBlockRef = useRef<{ pos: number; id: string | null } | null>(null);
  const openMenuRef = useRef<BlockMenuMode | null>(null);
  const ignoreGripClickRef = useRef(false);
  const isHoveringRef = useRef(false);
  const [openMenu, setOpenMenu] = useState<BlockMenuMode | null>(null);
  const [isHandleReady, setIsHandleReady] = useState(false);
  const setGlobalBlockMenuOpen = useInterfaceStore((s) => s.setBlockMenuOpen);

  openMenuRef.current = openMenu;

  const setMenuOpen = useCallback(
    (menu: BlockMenuMode) => (open: boolean) => {
      const next = open ? menu : null;
      setOpenMenu(next);
      setGlobalBlockMenuOpen(Boolean(next));
      setDragHandleLocked(editor, Boolean(next));
    },
    [editor, setGlobalBlockMenuOpen],
  );

  const closeMenu = useCallback(() => {
    setOpenMenu(null);
    setGlobalBlockMenuOpen(false);
    setDragHandleLocked(editor, false);
  }, [editor, setGlobalBlockMenuOpen]);

  useEffect(() => {
    return () => {
      setGlobalBlockMenuOpen(false);
      setDragHandleLocked(editor, false);
    };
  }, [editor, setGlobalBlockMenuOpen]);

  const handleNodeChange = useCallback((data: ActiveBlockT) => {
    if (!data?.node || data?.pos === null || data.pos < 0) return;

    const id = data.node.attrs?.['id'] ?? data.node.attrs?.id ?? null;

    isHoveringRef.current = true;
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

  const parkOnFirstBlock = useCallback(() => {
    if (editor.isDestroyed) return;
    if (getDragHandleElement(editor)?.dataset.dragging === 'true') return;

    const first = getFirstBlockAnchor(editor);
    if (!first) return;

    activeBlockRef.current = first;
    positionDragHandle(editor, getReferencedVirtualElement, computePositionConfig);
  }, [computePositionConfig, editor, getReferencedVirtualElement]);

  const lockHandleForPlus = useCallback(() => {
    setDragHandleLocked(editor, true);
  }, [editor]);

  const unlockHandleIfMenuClosed = useCallback(() => {
    requestAnimationFrame(() => {
      if (!openMenuRef.current) setDragHandleLocked(editor, false);
    });
  }, [editor]);

  const handleDragStart = useCallback(() => {
    ignoreGripClickRef.current = true;
    closeMenu();
    onDragStart?.();
  }, [closeMenu, onDragStart]);

  const handleDragEnd = useCallback(() => {
    window.setTimeout(() => {
      ignoreGripClickRef.current = false;
    }, 0);
    onDragEnd();
  }, [onDragEnd]);

  const handleGripClick = useCallback(() => {
    if (ignoreGripClickRef.current) {
      ignoreGripClickRef.current = false;
      return;
    }
    setMenuOpen('ops')(openMenuRef.current !== 'ops');
  }, [setMenuOpen]);

  useEffect(() => {
    if (isMobile) return;

    const parkIfIdle = () => {
      if (isHoveringRef.current || openMenuRef.current) return;
      parkOnFirstBlock();
    };

    const frame = window.requestAnimationFrame(() => {
      parkIfIdle();
      window.requestAnimationFrame(() => setIsHandleReady(true));
    });

    editor.on('update', parkIfIdle);

    const root = editor.view.dom.closest('.xi-editor');
    const onMouseLeave = () => {
      if (openMenuRef.current) return;
      isHoveringRef.current = false;
      parkOnFirstBlock();
    };
    root?.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      editor.off('update', parkIfIdle);
      root?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [editor, isMobile, parkOnFirstBlock]);

  // На мобильных/планшетах управление блоками — целиком в NotesEditorToolbar.
  // DragHandle на тач технически реагирует, но появляется только по тапу и
  // остаётся незаметным для пользователя — команда решила не показывать его
  // на этих ширинах вовсе, а не просто прятать «+»/приглушать ручку.
  if (isMobile) return null;

  const isInsertOpen = openMenu === 'insert';
  const isOpsOpen = openMenu === 'ops';

  return (
    <DragHandle
      editor={editor}
      className={['drag-handle', isHandleReady && 'is-ready', openMenu && 'is-menu-open']
        .filter(Boolean)
        .join(' ')}
      computePositionConfig={computePositionConfig}
      getReferencedVirtualElement={getReferencedVirtualElement}
      onElementDragStart={handleDragStart}
      onElementDragEnd={handleDragEnd}
      nested={NESTED_DRAG_OPTIONS}
      onNodeChange={handleNodeChange}
    >
      <div className="drag-handle-controls">
        <BlockMenu
          editor={editor}
          isReadOnly={isReadOnly}
          open={isInsertOpen}
          setOpen={setMenuOpen('insert')}
          getActiveBlock={getActiveBlock}
          mode="insert"
        >
          <button
            type="button"
            draggable={false}
            className={`${handleButtonClass} cursor-pointer`}
            aria-label={t('dragHandle.addBlock')}
            title={t('dragHandle.addBlock')}
            onPointerDown={lockHandleForPlus}
            onPointerUp={unlockHandleIfMenuClosed}
            onPointerCancel={unlockHandleIfMenuClosed}
          >
            {isInsertOpen ? (
              <Close className={handleIconClass} />
            ) : (
              <Add className={handleIconClass} />
            )}
          </button>
        </BlockMenu>

        {/*
          Grip нельзя делать DropdownMenuTrigger: Radix на pointerdown
          вызывает preventDefault и блокирует HTML5-drag. Якорь меню
          совпадает с кнопкой, клики и drag идут на саму кнопку.
        */}
        <div className="drag-handle-grip">
          <button
            type="button"
            className={`${handleButtonClass} cursor-grab active:cursor-grabbing`}
            data-drag-grip=""
            aria-label={t('dragHandle.blockActions')}
            title={t('dragHandle.blockActions')}
            aria-expanded={isOpsOpen}
            aria-haspopup="menu"
            onClick={handleGripClick}
          >
            <Move className={handleIconClass} />
          </button>
          <div className="pointer-events-none absolute inset-0">
            <BlockMenu
              editor={editor}
              isReadOnly={isReadOnly}
              open={isOpsOpen}
              setOpen={setMenuOpen('ops')}
              getActiveBlock={getActiveBlock}
              mode="ops"
            >
              <span className="block h-full w-full" aria-hidden />
            </BlockMenu>
          </div>
        </div>
      </div>
    </DragHandle>
  );
};
