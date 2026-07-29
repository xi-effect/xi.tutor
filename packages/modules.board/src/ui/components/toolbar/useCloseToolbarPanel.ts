import { useEffect } from 'react';

/**
 * Закрытие панели настроек тулбара по клику вне неё.
 * Для инструментов рисования клик по канвасу не закрывает панель (как у Radix ToolPopup).
 */
export function useCloseToolbarPanel(activePopup: string | null, onClose: () => void): void {
  useEffect(() => {
    if (!activePopup) return;

    const closeOnCanvas = activePopup === 'emoji';

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest('[data-board-toolbar-ui]')) return;
      if (!closeOnCanvas && target?.closest('.dr-container')) return;
      onClose();
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => window.removeEventListener('pointerdown', handlePointerDown, true);
  }, [activePopup, onClose]);
}
