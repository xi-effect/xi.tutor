import { LoadingScreen } from 'common.ui';
import { useKeyPress } from 'common.utils';
import { JSX } from 'react/jsx-runtime';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Editor, TLInstancePresence, Tldraw, TldrawProps } from 'tldraw';
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
import { UndoRedo } from '../toolbar/UndoRedo';
import { makeTldrawAssetUrls } from '../../../utils/assetsUrls';

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

  // Follow: вписываем вид ведущего в viewport ведомого (fit-to-bounds).
  // На большом экране зум совпадает; на маленьком — уменьшается, чтобы видеть всю область.
  // Используем стандартные поля tldraw presence (camera, screenBounds).
  useEffect(() => {
    if (!editor || !store || !followingPresenceId) return;

    const id = followingPresenceId;
    let raf = 0;

    const sync = () => {
      const presence = store.get(id as TLInstancePresence['id']) as TLInstancePresence | undefined;
      if (!presence?.camera) return;

      const leaderCam = presence.camera;
      const leaderSB = presence.screenBounds;
      if (!leaderSB || leaderSB.w <= 0 || leaderSB.h <= 0) return;

      // Вид ведущего в page-space
      const leaderPageW = leaderSB.w / leaderCam.z;
      const leaderPageH = leaderSB.h / leaderCam.z;
      const centerX = -leaderCam.x + leaderPageW / 2;
      const centerY = -leaderCam.y + leaderPageH / 2;

      const vp = editor.getViewportScreenBounds();

      // Зум, при котором весь вид ведущего вписывается в наш viewport.
      // Не зумим ближе, чем у ведущего (если наш экран больше).
      const z = Math.min(leaderCam.z, vp.w / leaderPageW, vp.h / leaderPageH);

      const target = {
        x: -(centerX - vp.w / (2 * z)),
        y: -(centerY - vp.h / (2 * z)),
        z,
      };

      const cur = editor.getCamera();
      if (
        Math.abs(cur.x - target.x) < 0.5 &&
        Math.abs(cur.y - target.y) < 0.5 &&
        Math.abs(cur.z - target.z) < 0.001
      )
        return;

      editor.setCameraOptions({ isLocked: false });
      editor.setCamera(target);
      editor.setCameraOptions({ isLocked: true });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    schedule();

    const unsub = store.listen(
      ({ changes }) => {
        const added = (changes.added ?? {}) as Record<string, unknown>;
        const updated = (changes.updated ?? {}) as Record<string, unknown>;
        if (added[id] || updated[id]) schedule();
      },
      { scope: 'presence' },
    );

    const ro = new ResizeObserver(() => schedule());
    ro.observe(editor.getContainer());

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      unsub();
      editor.setCameraOptions({ isLocked: false });
    };
  }, [editor, store, followingPresenceId]);

  const assetUrls = useMemo(() => makeTldrawAssetUrls({ baseUrl: '/tldraw' }), []);

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
            assetUrls={assetUrls}
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
            <div className="border-gray-10 bg-gray-0 absolute bottom-4 left-4 z-30 flex rounded-xl border p-1 sm:hidden">
              <UndoRedo undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
            </div>
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
