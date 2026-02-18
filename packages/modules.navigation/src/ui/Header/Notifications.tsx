import { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@xipkg/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@xipkg/modal';
import { cn, useMediaQuery } from '@xipkg/utils';
import type { NotificationT } from 'common.types';
import { formatNotificationCount, useNotificationsContext } from 'common.services';
import type { CustomNotificationModalPayload } from 'common.services';
import { NotificationBadge } from './NotificationBadge';
import { NotificationItem } from './NotificationItem';

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
    // markAllAsRead,
    isLoading,
    hasMore,
    loadMore,
    isFetchingNextPage,
    loadNotifications,
  } = useNotificationsContext();

  // Обработчик навигации по URL из уведомления
  const handleNavigate = (url: string) => {
    try {
      // Проверяем, является ли URL относительным путем или полным URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Внешняя ссылка - открываем в новой вкладке
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Внутренняя навигация - используем navigate
        navigate({ to: url });
      }
    } catch (error) {
      console.error('Ошибка при навигации:', error);
    }
  };

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

      if (isFetchingNextPage || !hasMore) {
        return;
      }

      // Загружаем следующую страницу, когда до конца осталось меньше 100px
      if (distanceToBottom < 100) {
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

  // Обработчик открытия dropdown - загружаем уведомления
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  const notificationsList = (
    <div
      ref={scrollAreaRef}
      className={cn('overflow-y-auto', isMobile ? 'max-h-[calc(100dvh-200px)]' : 'h-[300px] px-1')}
    >
      {notifications.length > 0 ? (
        <>
          <div className="group flex flex-col gap-1">
            {notifications.map((notification: NotificationT) => (
              <div key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onNavigate={handleNavigate}
                  onClose={() => setIsOpen(false)}
                  onOpenCustomModal={setCustomModalPayload}
                  asDropdownItem={!isMobile}
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
        <div
          className={cn(
            'flex flex-col items-center justify-center',
            isMobile ? 'h-[200px]' : 'h-[300px]',
          )}
        >
          <span className="text-gray-80 text-m-base font-normal">Уведомлений нет</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>
            <Button variant="none" className="relative h-[32px] w-[32px] p-1">
              <Notification className="fill-gray-80 size-6" size="s" />
              <NotificationBadge count={formatNotificationCount(unreadCount)} />
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[calc(100dvh-64px)] w-full">
            <div className="dark:bg-gray-0 h-full p-0.5">
              <DrawerHeader className="flex items-center pt-2 pb-6 pl-1">
                <DrawerTitle className="text-m-base font-semibold text-gray-100">
                  Уведомления
                </DrawerTitle>

                <div className="ml-auto flex items-center">
                  <Button
                    onClick={handleToSettings}
                    variant="none"
                    className="h-[32px] w-[32px] p-1"
                  >
                    <Settings className="fill-gray-80 size-6" size="s" />
                  </Button>
                </div>
              </DrawerHeader>

              {notificationsList}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button variant="none" className="relative h-[32px] w-[32px] p-1">
              <Notification className="fill-gray-80 size-6" size="s" />
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
                <Button onClick={handleToSettings} variant="none" className="h-[32px] w-[32px] p-1">
                  <Settings className="fill-gray-80 size-6" size="s" />
                </Button>
              </div>
            </DropdownMenuLabel>
            {notificationsList}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Modal
        open={!!customModalPayload}
        onOpenChange={(open) => !open && setCustomModalPayload(null)}
      >
        <ModalContent className="flex max-h-[90vh] max-w-[480px] flex-col">
          <ModalHeader>
            <ModalTitle className="text-m-lg font-semibold text-gray-100">
              {customModalPayload?.header}
            </ModalTitle>
            <ModalCloseButton />
          </ModalHeader>

          <ModalBody className="text-s-base text-gray-80 flex-1 overflow-y-auto">
            {customModalPayload?.content}
          </ModalBody>

          {customModalPayload?.button_text && customModalPayload?.button_link && (
            <ModalFooter>
              <Button
                size="m"
                onClick={() => {
                  const link = customModalPayload?.button_link;
                  if (link) {
                    if (link.startsWith('http://') || link.startsWith('https://')) {
                      window.open(link, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate({ to: link });
                    }
                    setCustomModalPayload(null);
                  }
                }}
              >
                {customModalPayload.button_text}
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
