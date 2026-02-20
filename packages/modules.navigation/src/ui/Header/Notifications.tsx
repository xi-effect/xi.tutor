import { Notification, Settings, Check } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useRef, useEffect, useState } from 'react';
import { useNotificationsContext } from 'common.services';
import type { NotificationT } from 'common.types';
import type { CustomNotificationModalPayload } from 'common.services';
import { NotificationBadge } from './NotificationBadge';
import {
  generateNotificationTitle,
  generateNotificationDescription,
  generateNotificationAction,
  getNotificationOpensModal,
  getCustomNotificationModalPayload,
  formatNotificationDate,
  formatFullNotificationDate,
  formatNotificationCount,
} from 'common.services';
import { cn } from '@xipkg/utils';
import { NotificationAvatar } from './NotificationAvatar';
import { SidebarMenuButton, SidebarMenuItem } from '@xipkg/sidebar';

// Компонент для отображения одного уведомления
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onNavigate,
  onClose,
  onOpenCustomModal,
}: {
  notification: NotificationT;
  onMarkAsRead: (id: string) => Promise<void>;
  onNavigate: (url: string) => void;
  onClose: () => void;
  onOpenCustomModal: (payload: CustomNotificationModalPayload) => void;
}) => {
  // Обработчик клика по уведомлению - переход на целевую страницу или открытие модалки
  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }

    onClose();

    if (getNotificationOpensModal(notification)) {
      const payload = getCustomNotificationModalPayload(notification);
      if (payload) onOpenCustomModal(payload);
      return;
    }

    const url = generateNotificationAction(notification);
    if (url) {
      onNavigate(url);
    }
  };

  // Обработчик клика по кнопке прочтения - только пометить как прочитанное
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }
  };

  const title = generateNotificationTitle(notification);
  const description = generateNotificationDescription(notification);
  const relativeTime = formatNotificationDate(notification.created_at);
  const fullTime = formatFullNotificationDate(notification.created_at);

  return (
    <DropdownMenuItem
      className={cn(
        `flex h-full items-start gap-2 rounded-[16px] p-3 ${
          !notification.is_read ? 'bg-brand-0 hover:bg-brand-0' : 'bg-gray-0 hover:bg-gray-5'
        }`,
      )}
      onClick={handleClick}
    >
      <NotificationAvatar
        kind={notification.payload.kind}
        classroomId={notification.payload.classroom_id}
        recipientInvoiceId={notification.payload.recipient_invoice_id}
      />
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
      {!notification.is_read && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="none"
                size="sm"
                className="group/button bg-gray-0 hover:bg-brand-80 h-6 w-6 rounded-sm p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleMarkAsRead}
              >
                <Check className="group-hover/button:fill-gray-0 h-3 w-3 fill-gray-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Отметить как прочитанное</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </DropdownMenuItem>
  );
};

export const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton className="relative h-10 w-full p-2 focus-visible:ring-0 focus-visible:ring-offset-0">
              <>
                <Notification className="fill-gray-80 size-6" size="s" />
                <span className="text-base">Уведомления</span>
              </>
            </SidebarMenuButton>
            <NotificationBadge count={formatNotificationCount(unreadCount)} />
          </SidebarMenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          alignOffset={0}
          sideOffset={8}
          className="flex w-[268px] flex-col gap-1 rounded-[20px] border-2 px-1 py-1"
        >
          <DropdownMenuLabel className="text-m-base flex h-[48px] items-center p-3 font-semibold text-gray-100">
            Уведомления
            <div className="ml-auto flex items-center gap-1">
              <Button onClick={handleToSettings} variant="none" className="h-[32px] w-[32px] p-1">
                <Settings className="fill-gray-80 size-6" size="s" />
              </Button>
            </div>
          </DropdownMenuLabel>
          <div ref={scrollAreaRef} className="h-[300px] overflow-y-auto pr-1 pl-1">
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
