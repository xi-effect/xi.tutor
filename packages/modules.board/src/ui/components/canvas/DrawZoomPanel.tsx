import { track, useEditor } from '@ibodr/draw';
import { Plus, Minus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { useRef } from 'react';
import { boardIconClass, boardPanelClass, boardTextClass } from '../../boardTheme';

const ZOOM_ANIMATION = { animation: { duration: 200 } } as const;
/** Задержка одиночного клика, чтобы не срабатывал вместе с double-click */
const SINGLE_CLICK_DELAY_MS = 250;

export const DrawZoomPanel = track(() => {
  const editor = useEditor();
  const resetZoomClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!editor) return null;

  // Получаем текущий уровень зума и переводим в проценты
  const zoomLevel = editor.getZoomLevel();
  const zoomPercent = Math.round(zoomLevel * 100);

  const handleZoomIn = () => {
    editor.zoomIn(editor.getViewportScreenCenter(), ZOOM_ANIMATION);
  };

  const handleZoomOut = () => {
    editor.zoomOut(editor.getViewportScreenCenter(), ZOOM_ANIMATION);
  };

  const clearResetZoomClickTimer = () => {
    if (resetZoomClickTimerRef.current) {
      clearTimeout(resetZoomClickTimerRef.current);
      resetZoomClickTimerRef.current = null;
    }
  };

  const handleResetZoomClick = () => {
    clearResetZoomClickTimer();
    resetZoomClickTimerRef.current = setTimeout(() => {
      resetZoomClickTimerRef.current = null;
      editor.resetZoom(editor.getViewportScreenCenter(), ZOOM_ANIMATION);
    }, SINGLE_CLICK_DELAY_MS);
  };

  /** Двойной клик: вписать все элементы страницы в viewport (как Cmd+1) */
  const handleZoomToFitDoubleClick = () => {
    clearResetZoomClickTimer();
    editor.zoomToFit(ZOOM_ANIMATION);
  };

  return (
    <div className="absolute right-4 bottom-4 z-260">
      <div className={`${boardPanelClass} flex items-center justify-center gap-2 p-1`}>
        <Button
          className="hover:bg-brand-0 pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          variant="none"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4 fill-gray-100 lg:h-6 lg:w-6" />
        </Button>
        <Button
          className={`h-6 w-6 min-w-[60px] items-center justify-center px-2 py-1 ${boardTextClass} hover:bg-transparent focus:bg-transparent active:bg-transparent lg:h-8 lg:w-8`}
          variant="none"
          title="Клик — 100%. Двойной клик — показать все элементы"
          onClick={handleResetZoomClick}
          onDoubleClick={handleZoomToFitDoubleClick}
        >
          {zoomPercent < 1 ? '< 1%' : `${zoomPercent}%`}
        </Button>
        <Button
          className="hover:bg-brand-0 pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          variant="none"
          onClick={handleZoomIn}
        >
          <Plus className={`h-4 w-4 lg:h-6 lg:w-6 ${boardIconClass}`} />
        </Button>
      </div>
    </div>
  );
});
