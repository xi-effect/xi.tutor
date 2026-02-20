import { LoadingScreen } from 'common.ui';
import { useKeyPress } from 'common.utils';
import { JSX } from 'react/jsx-runtime';
import { useState, useEffect, useRef } from 'react';
import { Editor, TLInstancePresenceID, Tldraw, TldrawProps } from 'tldraw';
import { useLockedShapeSelection, useRemoveMark, useTldrawClipboard } from '../../../hooks';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useFollowUserStore, useTldrawStore } from '../../../store';
import { PdfShapeUtil } from '../../../shapes/pdf';
import { Header } from '../header';
import { Navbar, SelectionMenu } from '../toolbar';
import { CollaboratorCursor } from './CollaboratorCursor';
import { FollowBanner } from './FollowBanner';
import { TldrawZoomPanel } from './TldrawZoomPanel';
import 'tldraw/tldraw.css';
import './customstyles.css';

export const TldrawCanvas = ({
  token,
  ...props
}: JSX.IntrinsicAttributes & TldrawProps & { token: string }) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const { selectedElementId, selectElement } = useTldrawStore();
  const { store, status, undo, redo, canUndo, canRedo, isReadonly, getUserCamera, setUserCamera } =
    useYjsContext();
  const { followingPresenceId } = useFollowUserStore();
  const appliedInitialCameraRef = useRef(false);

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

  // В режиме «Следуем за» блокируем управление камерой у ведомого — пан/зум только через крестик на плашке
  useEffect(() => {
    if (!editor) return;
    editor.setCameraOptions({ isLocked: !!followingPresenceId });
  }, [editor, followingPresenceId]);

  // Восстановление камеры пользователя при открытии доски (один раз после синка)
  useEffect(() => {
    if (!editor || status !== 'synced-remote' || appliedInitialCameraRef.current) return;
    const saved = getUserCamera();
    if (saved) {
      editor.setCamera(saved);
      appliedInitialCameraRef.current = true;
    }
  }, [editor, status]);

  // Сохранение камеры при уходе: с вкладки, закрытии страницы или уходе с доски в приложении (без таймера — не дёргаем Document changed)
  useEffect(() => {
    if (!editor) return;
    const saveCameraIfNotFollowing = () => {
      if (!useFollowUserStore.getState().followingPresenceId) setUserCamera(editor.getCamera());
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveCameraIfNotFollowing();
    };
    const onPageHide = () => saveCameraIfNotFollowing();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      saveCameraIfNotFollowing(); // при размонтировании (навигация со страницы доски)
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [editor, setUserCamera]);

  // Режим "следовать за пользователем": камера в реальном времени повторяет вид коллаборатора (presence.camera из Hocuspocus).
  // При isLocked программный setCamera тоже блокируется — временно снимаем блок на время синка.
  useEffect(() => {
    if (!editor || !store || !followingPresenceId) return;
    const id = followingPresenceId as TLInstancePresenceID;
    const syncCamera = () => {
      const presence = store.get(id) as
        | { camera?: { x: number; y: number; z: number } | null }
        | undefined;
      if (!presence?.camera) return;
      editor.setCameraOptions({ isLocked: false });
      editor.setCamera(presence.camera);
      editor.setCameraOptions({ isLocked: true });
    };
    syncCamera();
    const unsub = store.listen(
      ({ changes }) => {
        const added = changes.added as Record<string, unknown>;
        const updated = changes.updated as Record<string, unknown>;
        if (added[id] || updated[id]) syncCamera();
      },
      { scope: 'presence' },
    );
    return unsub;
  }, [editor, store, followingPresenceId]);

  if (status === 'loading') return <LoadingScreen />;

  return (
    <div id="whiteboard-container" className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        {followingPresenceId && <FollowBanner />}
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
            shapeUtils={[PdfShapeUtil]}
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
