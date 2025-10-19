import { useEffect } from 'react';

/**
 * Хук для глобальной блокировки браузерных элементов управления видео
 * Применяется ко всему контейнеру ВКС
 */
export const useVideoSecurity = () => {
  useEffect(() => {
    const container = document.getElementById('videoConferenceContainer');
    if (!container) return;

    // Блокируем контекстное меню для всего контейнера
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Блокируем выделение текста
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Блокируем drag & drop
    const handleDragStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Блокируем копирование
    const handleCopy = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Блокируем печать
    const handlePrint = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Блокируем F12 и другие dev tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Блокируем F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Применяем все обработчики к контейнеру
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('selectstart', handleSelectStart);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('copy', handleCopy);
    container.addEventListener('beforeprint', handlePrint);
    container.addEventListener('keydown', handleKeyDown);

    // Дополнительные атрибуты для блокировки
    container.setAttribute('oncontextmenu', 'return false');
    container.setAttribute('ondragstart', 'return false');
    container.setAttribute('onselectstart', 'return false');
    container.setAttribute('oncopy', 'return false');
    container.setAttribute('onbeforeprint', 'return false');

    // Применяем CSS стили для блокировки
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';
    // @ts-expect-error - moz префиксы не типизированы в TypeScript
    container.style.mozUserSelect = 'none';
    // @ts-expect-error - ms префиксы не типизированы в TypeScript
    container.style.msUserSelect = 'none';
    // @ts-expect-error - webkit префиксы не типизированы в TypeScript
    container.style.webkitTouchCallout = 'none';
    // @ts-expect-error - webkit префиксы не типизированы в TypeScript
    container.style.webkitUserDrag = 'none';
    // @ts-expect-error - khtml префиксы не типизированы в TypeScript
    container.style.khtmlUserSelect = 'none';

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('selectstart', handleSelectStart);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('copy', handleCopy);
      container.removeEventListener('beforeprint', handlePrint);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
