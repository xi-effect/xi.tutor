import { useRef, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useMediaQuery } from '@xipkg/utils';
import { formatNotificationCount, useNotificationsContext } from 'common.services';
import type { CustomNotificationModalPayload } from 'common.services';
import { NotificationBadge } from './NotificationBadge';
import { NotificationsDropdown } from './NotificationsDropdown';
import { NotificationsList } from './NotificationsList';
import { NotificationsMobileDrawer } from './NotificationsMobileDrawer';
import { CustomNotificationModal } from './CustomNotificationModal';
import { openNotificationLink } from './notificationsNavigation';
import { useNotificationsInfiniteScroll } from '../../../hooks';

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
  } = useNotificationsContext();

  // Обработчик навигации по URL из уведомления
  const handleNavigate = (url: string) => {
    openNotificationLink(url, navigate);
  };

  // Виртуализация списка уведомлений (временно отключено для проверки)
  // const virtualizer = useVirtualList(scrollAreaRef, notifications);

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
        <NotificationsMobileDrawer
          isOpen={isOpen}
          onOpenChange={handleOpenChange}
          onOpenSettings={handleToSettings}
          notificationsList={notificationsList}
          badge={<NotificationBadge count={countLabel} variant="mobile" />}
          countLabel={countLabel}
          hasUnread={hasUnread}
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
