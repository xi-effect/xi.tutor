import { Notification, Settings, Trash } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
// import { ScrollArea } from '@xipkg/scrollarea'; // Убрали ScrollArea, используем обычный div с overflow
import { UserProfile } from '@xipkg/userprofile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useRef, useEffect } from 'react';
import { useNotificationsContext } from 'common.services';
import type { NotificationT } from 'common.types';
import { NotificationBadge } from './NotificationBadge';
// import { VirtualList } from './VirtualList';
// import { useVirtualList } from '../../hooks/useVirtualList';
import {
  generateNotificationTitle,
  generateNotificationDescription,
  formatNotificationDate,
  formatFullNotificationDate,
  formatNotificationCount,
} from 'common.services';

// Удаляем старые функции форматирования, используем новые из utils

// Компонент для отображения одного уведомления
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationT;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const title = generateNotificationTitle(notification);
  const description = generateNotificationDescription(notification);
  const relativeTime = formatNotificationDate(notification.created_at);
  const fullTime = formatFullNotificationDate(notification.created_at);

  return (
    <DropdownMenuItem
      className={`flex h-full items-start gap-2 rounded-[16px] p-3 ${
        !notification.is_read ? 'bg-blue-5' : ''
      }`}
      onClick={handleClick}
    >
      <UserProfile userId={notification.actor_user_id || 0} withOutText />
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-m-base font-medium text-gray-100">{title}</span>
        <span className="text-gray-80 text-s-base font-normal">{description}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-fit" asChild>
              <span className="text-gray-80 text-xs-base font-normal">{relativeTime}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{fullTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
      >
        <Trash className="h-3 w-3" />
      </Button>
    </DropdownMenuItem>
  );
};

export const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    // markAllAsRead,
    deleteNotification,
    isLoading,
    hasMore,
    loadMore,
    isFetchingNextPage,
  } = useNotificationsContext();

  // Виртуализация списка уведомлений (временно отключено для проверки)
  // const virtualizer = useVirtualList(scrollAreaRef, notifications);

  const handleToSettings = () => {
    navigate({ to: location.pathname, search: { profile: 'notifications' } });
  };

  // Обработчик скролла для автоматической загрузки следующей страницы (по аналогии с useInfiniteQuery из materials)
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollAreaRef.current;
      if (!el) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      console.log('📜 Скролл:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceToBottom,
        hasMore,
        isFetchingNextPage,
      });

      if (isFetchingNextPage || !hasMore) {
        return;
      }

      // Загружаем следующую страницу, когда до конца осталось меньше 100px
      if (distanceToBottom < 100) {
        console.log('✅ Загружаем следующую страницу уведомлений');
        loadMore();
      }
    };

    let currentElement: HTMLDivElement | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let observer: MutationObserver | null = null;

    // Функция для подключения обработчика скролла
    const attachScrollListener = () => {
      const el = scrollAreaRef.current;
      if (!el) {
        return false;
      }

      currentElement = el;
      console.log('✅ Привязан обработчик скролла');
      el.addEventListener('scroll', handleScroll);

      // Также проверяем сразу, может быть уже нужно загрузить
      handleScroll();

      return true;
    };

    // Пробуем подключить сразу
    if (!attachScrollListener()) {
      // Если элемент еще не существует (рендерится через портал), ждем появления
      // Используем небольшую задержку и повторные попытки
      let attempts = 0;
      const maxAttempts = 10;
      intervalId = setInterval(() => {
        attempts++;
        if (attachScrollListener() || attempts >= maxAttempts) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, 100);

      // Также используем MutationObserver для отслеживания появления элемента
      observer = new MutationObserver(() => {
        if (attachScrollListener()) {
          if (observer) {
            observer.disconnect();
            observer = null;
          }
        }
      });

      // Наблюдаем за document.body, так как DropdownMenuContent рендерится через портал
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (observer) {
        observer.disconnect();
      }
      if (currentElement) {
        currentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, isFetchingNextPage, loadMore]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-[32px] w-[32px] p-1">
          <Notification className="fill-gray-80" size="s" />
          <NotificationBadge count={formatNotificationCount(unreadCount)} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex w-[310px] flex-col gap-1 rounded-[20px] border-2 px-1 py-1"
      >
        <DropdownMenuLabel className="text-m-base flex h-[48px] items-center p-3 font-semibold text-gray-100">
          Уведомления
          <div className="ml-auto flex items-center gap-1">
            {/* {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={markAllAsRead}
              >
                Прочитать все
              </Button>
            )} */}
            <Button onClick={handleToSettings} variant="ghost" className="h-[32px] w-[32px] p-1">
              <Settings className="fill-gray-80" size="s" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <div ref={scrollAreaRef} className="h-[300px] overflow-y-auto pr-3">
          {notifications.length > 0 ? (
            <>
              <div className="group">
                {notifications.map((notification: NotificationT) => (
                  <div key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  </div>
                ))}
              </div>
              {(isLoading || isFetchingNextPage) && (
                <div className="flex justify-center p-4">
                  <span className="text-gray-80 text-s-base">Загрузка...</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center">
              <span className="text-gray-80 text-m-base font-normal">Уведомлений нет</span>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
