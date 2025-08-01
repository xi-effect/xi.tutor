import { useEffect } from 'react';

export const useRemoveMark = () => {
  useEffect(() => {
    const removeWatermark = () => {
      document.querySelectorAll('.tl-watermark_SEE-LICENSE').forEach((el) => el.remove());
    };

    // Удалить сразу после загрузки
    removeWatermark();

    // И повторять, если tldraw вдруг пересоздаст watermark
    const observer = new MutationObserver(removeWatermark);
    observer.observe(document.body, { childList: true, subtree: true });

    // Очистка
    return () => observer.disconnect();
  }, []);
};
