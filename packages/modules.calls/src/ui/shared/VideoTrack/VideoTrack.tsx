import React, { useRef, useEffect, forwardRef } from 'react';
import { VideoTrack as LiveKitVideoTrack, VideoTrackProps } from '@livekit/components-react';

/**
 * Кастомный VideoTrack компонент с полной блокировкой браузерных элементов управления
 * Блокирует:
 * - Контекстное меню (правый клик)
 * - Встроенные controls браузера
 * - Picture-in-Picture
 * - Remote playback
 * - Сохранение видео
 * - Другие браузерные функции управления видео
 */
export const VideoTrack = forwardRef<HTMLVideoElement, VideoTrackProps>(
  ({ className, style, ...props }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      // Блокируем контекстное меню
      const handleContextMenu = (e: Event) => {
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

      // Блокируем выделение текста
      const handleSelectStart = (e: Event) => {
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
        // Блокируем F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Применяем все обработчики
      videoElement.addEventListener('contextmenu', handleContextMenu);
      videoElement.addEventListener('dragstart', handleDragStart);
      videoElement.addEventListener('selectstart', handleSelectStart);
      videoElement.addEventListener('copy', handleCopy);
      videoElement.addEventListener('beforeprint', handlePrint);
      videoElement.addEventListener('keydown', handleKeyDown);

      // Дополнительные атрибуты для блокировки
      videoElement.setAttribute('oncontextmenu', 'return false');
      videoElement.setAttribute('ondragstart', 'return false');
      videoElement.setAttribute('onselectstart', 'return false');
      videoElement.setAttribute('oncopy', 'return false');
      videoElement.setAttribute('onbeforeprint', 'return false');

      // Блокируем Picture-in-Picture
      if ('requestPictureInPicture' in videoElement) {
        videoElement.disablePictureInPicture = true;
      }

      // Блокируем Remote Playback
      if ('disableRemotePlayback' in videoElement) {
        videoElement.disableRemotePlayback = true;
      }

      // Убираем controls
      videoElement.controls = false;
      // @ts-expect-error - controlsList не типизирован в TypeScript, но поддерживается браузерами
      videoElement.controlsList = 'nodownload nofullscreen noremoteplayback';

      // Блокируем autoplay и другие атрибуты
      videoElement.autoplay = false;
      videoElement.loop = false;
      videoElement.muted = true; // Оставляем muted для корректной работы

      return () => {
        videoElement.removeEventListener('contextmenu', handleContextMenu);
        videoElement.removeEventListener('dragstart', handleDragStart);
        videoElement.removeEventListener('selectstart', handleSelectStart);
        videoElement.removeEventListener('copy', handleCopy);
        videoElement.removeEventListener('beforeprint', handlePrint);
        videoElement.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

    return (
      <LiveKitVideoTrack
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (videoRef.current !== node) {
            (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
          }
        }}
        className={className}
        style={{
          ...style,
          // Дополнительные CSS стили для блокировки
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'auto', // Разрешаем клики для воспроизведения
          WebkitTouchCallout: 'none',
          // @ts-expect-error - WebkitUserDrag не типизирован в TypeScript
          WebkitUserDrag: 'none',
          KhtmlUserSelect: 'none',
          // Блокируем выделение
          outline: 'none',
          // Убираем возможность перетаскивания
          draggable: false,
        }}
        {...props}
      />
    );
  },
);

VideoTrack.displayName = 'VideoTrack';
