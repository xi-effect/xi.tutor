import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useMediaQuery } from '@xipkg/utils';
import {
  formatNotificationCount,
  registerNotificationNavigator,
  registerNotificationSoundPlayer,
  useNotificationsContext,
} from 'common.services';
import { playSoundEffect, unlockSoundEffect } from 'common.ui';
import type { CustomNotificationModalPayload } from 'common.services';
import { NotificationsDropdown } from './NotificationsDropdown';
import { NotificationsList } from './NotificationsList';
import { NotificationsMobileDropdown } from './NotificationsMobileDropdown';
import { CustomNotificationModal } from './CustomNotificationModal';
import { openNotificationLink, navigateToNotification } from './notificationsNavigation';
import { useNotificationsInfiniteScroll } from '../../../hooks';

const MARK_VISIBLE_AS_READ_DELAY_MS = 1000;

export const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 960px)');

  const [isOpen, setIsOpen] = useState(false);

  const [customModalPayload, setCustomModalPayload] =
    useState<CustomNotificationModalPayload | null>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    isLoading,
    hasMore,
    loadMore,
    isFetchingNextPage,
    loadNotifications,
    markAllAsRead,
  } = useNotificationsContext();

  // Обработчик навигации по URL из уведомления
  const handleNavigate = (url: string) => {
    openNotificationLink(url, navigate);
  };

  // Toast/системные уведомления живут в NotificationsProvider вне RouterProvider — пробрасываем navigate сюда
  useEffect(() => {
    registerNotificationNavigator((options) => navigateToNotification(navigate, options));
    return () => registerNotificationNavigator(null);
  }, [navigate]);

  useEffect(() => {
    const unregisterSound = registerNotificationSoundPlayer(() => playSoundEffect('notification'));
    const unlock = () => unlockSoundEffect('notification');
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      unregisterSound();
      window.removeEventListener('pointerdown', unlock);
    };
  }, []);

  const handleToSettings = () => {
    navigate({ to: location.pathname, search: { profile: 'notifications' } });
  };

  // Обработчик скролла для автоматической загрузки следующей страницы (по аналогии с useInfiniteQuery из materials)
  useNotificationsInfiniteScroll({
    scrollAreaRef,
    hasMore,
    isFetchingNextPage,
    loadMore,
  });

  // Обработчик открытия dropdown - загружаем уведомления
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  // Авто-отметка видимых уведомлений прочитанными при открытии и при подгрузке новых через скролл
  useEffect(() => {
    if (!isOpen) return;

    const hasUnreadVisible = notifications.some((n) => !n.is_read);
    if (!hasUnreadVisible) return;

    const timeoutId = setTimeout(() => {
      markAllAsRead();
    }, MARK_VISIBLE_AS_READ_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isOpen, notifications, markAllAsRead]);

  const notificationsList = (
    <NotificationsList
      notifications={notifications}
      isMobile={isMobile}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      onMarkAsRead={markAsRead}
      onNavigate={handleNavigate}
      onClose={() => setIsOpen(false)}
      onOpenCustomModal={setCustomModalPayload}
      scrollAreaRef={scrollAreaRef}
    />
  );

  const countLabel = formatNotificationCount(unreadCount);
  const hasUnread = unreadCount > 0;

  return (
    <>
      {isMobile ? (
        <NotificationsMobileDropdown
          isOpen={isOpen}
          onOpenChange={handleOpenChange}
          onOpenSettings={handleToSettings}
          notificationsList={notificationsList}
          hasUnread={hasUnread}
          countLabel={countLabel}
        />
      ) : (
        <NotificationsDropdown
          isOpen={isOpen}
          onOpenChange={handleOpenChange}
          onOpenSettings={handleToSettings}
          notificationsList={notificationsList}
          hasUnread={hasUnread}
          countLabel={countLabel}
        />
      )}

      <CustomNotificationModal
        payload={customModalPayload}
        onClose={() => setCustomModalPayload(null)}
        onNavigate={handleNavigate}
      />
    </>
  );
};
