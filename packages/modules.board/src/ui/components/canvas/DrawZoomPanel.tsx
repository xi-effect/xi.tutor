import { track, useEditor } from '@ibodr/draw';
import { Plus, Minus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { useRef, useState } from 'react';
import { cn } from '@xipkg/utils';
import {
  boardChromeZClass,
  boardIconClass,
  boardPanelClass,
  boardTextClass,
} from '../../boardTheme';
import { useTranslation } from 'react-i18next';
import { BoardMinimap } from './BoardMinimap';

const MINIMAP_STORAGE_KEY = 'board.minimap.open';

function readMinimapOpen() {
  try {
    return localStorage.getItem(MINIMAP_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

const ZOOM_ANIMATION = { animation: { duration: 200 } } as const;
/** Задержка одиночного клика, чтобы не срабатывал вместе с double-click */
const SINGLE_CLICK_DELAY_MS = 250;

export const DrawZoomPanel = track(() => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const resetZoomClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [minimapOpen, setMinimapOpen] = useState(readMinimapOpen);

  const toggleMinimap = () => {
    setMinimapOpen((open) => {
      const next = !open;
      try {
        localStorage.setItem(MINIMAP_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Настройка не критична: карта всё равно переключается в этой сессии.
      }
      return next;
    });
  };

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
    <div
      className={`absolute right-4 bottom-20 ${boardChromeZClass} flex flex-col items-end gap-2 sm:bottom-4`}
    >
      {minimapOpen && <BoardMinimap />}
      <div className={`${boardPanelClass} flex items-center justify-center gap-2 p-1`}>
        <Button
          className={cn(
            'hover:bg-status-info-background pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl',
            minimapOpen && 'bg-status-info-background text-text-link',
          )}
          variant="none"
          aria-pressed={minimapOpen}
          title={minimapOpen ? t('minimap.hide') : t('minimap.show')}
          onClick={toggleMinimap}
        >
          <MapIcon />
        </Button>
        <Button
          className="hover:bg-status-info-background pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          variant="none"
          onClick={handleZoomOut}
        >
          <Minus className="fill-icon-primary h-4 w-4 lg:h-6 lg:w-6" />
        </Button>
        <Button
          className={`h-6 w-6 min-w-[60px] items-center justify-center px-2 py-1 ${boardTextClass} hover:bg-transparent focus:bg-transparent active:bg-transparent lg:h-8 lg:w-8`}
          variant="none"
          title={t('zoom.clickHint')}
          onClick={handleResetZoomClick}
          onDoubleClick={handleZoomToFitDoubleClick}
        >
          {zoomPercent < 1 ? '< 1%' : `${zoomPercent}%`}
        </Button>
        <Button
          className="hover:bg-status-info-background pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          variant="none"
          onClick={handleZoomIn}
        >
          <Plus className={`h-4 w-4 lg:h-6 lg:w-6 ${boardIconClass}`} />
        </Button>
      </div>
    </div>
  );
});

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 lg:h-5 lg:w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M9 4.6 4.8 6.2v13.2L9 17.8l6 2 4.2-1.6V4.8L15 6.4 9 4.6Z" />
      <path d="M9 4.6v13.2M15 6.4v13.4" />
    </svg>
  );
}
