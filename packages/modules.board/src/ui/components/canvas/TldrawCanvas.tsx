import { LoadingScreen } from 'common.ui';
import { useKeyPress } from 'common.utils';
import { JSX } from 'react/jsx-runtime';
import { Editor, Tldraw, TldrawProps } from 'tldraw';
import { useLockedShapeSelection, useRemoveMark, useTldrawClipboard } from '../../../hooks';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useTldrawStore } from '../../../store';
import { Header } from '../header';
import { Navbar, SelectionMenu } from '../toolbar';
import { CollaboratorCursor } from './CollaboratorCursor';
import { TldrawZoomPanel } from './TldrawZoomPanel';
import { useState, useEffect } from 'react';
import 'tldraw/tldraw.css';
import './customstyles.css';

export const TldrawCanvas = ({
  token,
  ...props
}: JSX.IntrinsicAttributes & TldrawProps & { token: string }) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const { selectedElementId, selectElement } = useTldrawStore();
  const { store, status, undo, redo, canUndo, canRedo, isReadonly } = useYjsContext();

  useRemoveMark();
  useLockedShapeSelection(editor);
  useTldrawClipboard(editor, token);

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });

  // Устанавливаем isReadonly для editor и блокируем взаимодействие
  useEffect(() => {
    if (!editor) return;

    editor.updateInstanceState({ isReadonly });

    if (isReadonly) {
      // В readonly режиме запрещаем выделение и снимаем текущее выделение
      editor.selectNone();
      // Блокируем все инструменты, переключаемся на hand (инструмент перемещения без редактирования)
      editor.setCurrentTool('hand');

      // Блокируем выделение элементов более агрессивно
      const handlePointerDown = (e: PointerEvent) => {
        const target = e.target as HTMLElement;
        // Блокируем все клики на элементы и их дочерние элементы
        if (
          target.closest('.tl-shape') ||
          target.closest('.tl-selected') ||
          target.closest('[data-shape-id]') ||
          target.closest('.tl-svg-container')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      };

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('.tl-shape') ||
          target.closest('.tl-selected') ||
          target.closest('[data-shape-id]')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      };

      const container = editor.getContainer();
      container.addEventListener('pointerdown', handlePointerDown, {
        capture: true,
        passive: false,
      });
      container.addEventListener('click', handleClick, { capture: true, passive: false });

      // Более агрессивное снятие выделения - используем requestAnimationFrame для лучшей производительности
      let isSelecting = false;
      const unsubscribe = editor.store.listen(() => {
        if (isSelecting) return;

        const currentSelectedIds = editor.getSelectedShapeIds();
        if (currentSelectedIds.length > 0) {
          isSelecting = true;
          requestAnimationFrame(() => {
            editor.selectNone();
            isSelecting = false;
          });
        }
      });

      // Дополнительная проверка через интервал на случай, если слушатель не сработал
      const intervalId = setInterval(() => {
        const currentSelectedIds = editor.getSelectedShapeIds();
        if (currentSelectedIds.length > 0) {
          editor.selectNone();
        }
      }, 100);

      const cleanup = () => {
        container.removeEventListener('pointerdown', handlePointerDown, { capture: true });
        container.removeEventListener('click', handleClick, { capture: true });
        unsubscribe();
        clearInterval(intervalId);
      };

      return cleanup;
    }
  }, [editor, isReadonly]);

  if (status === 'loading') return <LoadingScreen />;

  return (
    <div id="whiteboard-container" className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Tldraw
            onMount={(editor) => {
              setEditor(editor);
              editor.updateInstanceState({
                isGridMode: true,
                isDebugMode: false,
                isPenMode: false,
              });

              editor.sideEffects.registerBeforeChangeHandler('instance', (prev, next) => {
                if (next.isPenMode) {
                  return prev;
                }
                return next;
              });
            }}
            store={store}
            hideUi
            components={{
              CollaboratorCursor: CollaboratorCursor,
              InFrontOfTheCanvas: SelectionMenu,
            }}
            {...props}
          >
            <Header />
            {!isReadonly && (
              <Navbar undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} token={token} />
            )}
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
