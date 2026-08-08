import { useEffect } from 'react';

/**
 * Radix Popover закрывается по клику вне себя через pointerdown, всплывающий до document, —
 * но канвас доски останавливает распространение своих pointerdown-событий для собственной
 * обработки (перетаскивание, выделение и т.д.), поэтому клик по доске не доходит до document
 * и попап не закрывается.
 *
 * Слушаем pointerdown на window в фазе перехвата (capture) — она отрабатывает раньше, чем
 * канвас успевает остановить всплытие, — и закрываем попап сами, если клик пришёлся не по
 * элементу с data-comment-ui (сам попап, пин, поле ввода и т.п.).
 */
export function useCloseOnOutsideClick(active: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest('[data-comment-ui]')) return;
      onClose();
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => window.removeEventListener('pointerdown', handlePointerDown, true);
  }, [active, onClose]);
}
