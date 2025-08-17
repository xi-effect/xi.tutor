import { Notification, Settings, Trash } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { ScrollArea } from '@xipkg/scrollarea';
import { UserProfile } from '@xipkg/userprofile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useNotificationsContext } from 'common.services';
import type { NotificationT } from 'common.types';
import { NotificationBadge } from './NotificationBadge';

const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });

// Функция для форматирования полной даты
const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Функция для расчета относительного времени
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  // Если дата в будущем
  if (diffInMs > 0) {
    if (diffInMinutes < 60) {
      return rtf.format(diffInMinutes, 'minute');
    } else if (diffInHours < 24) {
      return rtf.format(diffInHours, 'hour');
    } else {
      return rtf.format(diffInDays, 'day');
    }
  }

  // Если дата в прошлом
  if (Math.abs(diffInMinutes) < 60) {
    return `${Math.abs(diffInMinutes)} мин. назад`;
  } else if (Math.abs(diffInHours) < 24) {
    return `${Math.abs(diffInHours)} ч. назад`;
  } else if (Math.abs(diffInDays) < 7) {
    return `${Math.abs(diffInDays)} дн. назад`;
  } else {
    return rtf.format(diffInDays, 'day');
  }
};

// Компонент для отображения одного уведомления
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationT;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <DropdownMenuItem
      className={`flex h-full items-start gap-2 rounded-[16px] p-3 ${
        !notification.isRead ? 'bg-blue-5' : ''
      }`}
      onClick={handleClick}
    >
      <UserProfile userId={Number(notification.id)} withOutText />
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-m-base font-medium text-gray-100">{notification.title}</span>
        <span className="text-gray-80 text-s-base font-normal">{notification.description}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-fit" asChild>
              <span className="text-gray-80 text-xs-base font-normal">
                {getRelativeTime(notification.date)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{formatFullDate(notification.date)}</p>
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationsContext();

  const handleToSettings = () => {
    navigate({ to: location.pathname, search: { profile: 'notifications' } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-[32px] w-[32px] p-1">
          <Notification className="fill-gray-80" size="s" />
          <NotificationBadge count={unreadCount} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex w-[310px] flex-col gap-1 rounded-[20px] border-2 px-1 py-1"
      >
        <DropdownMenuLabel className="text-m-base flex h-[48px] items-center p-3 font-semibold text-gray-100">
          Уведомления
          <div className="ml-auto flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={markAllAsRead}
              >
                Прочитать все
              </Button>
            )}
            <Button onClick={handleToSettings} variant="ghost" className="h-[32px] w-[32px] p-1">
              <Settings className="fill-gray-80" size="s" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <ScrollArea className="h-[300px] pr-3">
          {notifications.length > 0 ? (
            <div className="group">
              {notifications.map((notification: NotificationT) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center">
              <span className="text-gray-80 text-m-base font-normal">Уведомлений нет</span>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
