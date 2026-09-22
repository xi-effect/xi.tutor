import { useEffect } from 'react';

export function useCloseOnOutsideClick(active: boolean, onClose: () => void): void {
  // useEffect(() => {
  //   if (!active) return;

  //   const handlePointerDown = (e: PointerEvent) => {
  //     const target = e.target as Element | null;
  //     if (target?.closest('[data-comment-ui], [data-board-drawer]')) return;
  //     onClose();
  //   };

  //   window.addEventListener('pointerdown', handlePointerDown, true);
  //   return () => window.removeEventListener('pointerdown', handlePointerDown, true);
  // }, [active, onClose]);

  useEffect(() => {
    if (!active) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      // Если клик был внутри любого элемента UI комментариев (пины, панель и т.д.) — НЕ ЗАКРЫВАЕМ
      if (target?.closest('[data-comment-ui]')) {
        return;
      }

      onClose();
    };

    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [active, onClose]);
}
