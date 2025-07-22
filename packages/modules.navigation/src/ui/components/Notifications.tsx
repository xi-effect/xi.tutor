import { Notification, Settings } from '@xipkg/icons';
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

const notifications = [
  {
    id: 1,
    title: 'Новое сообщение в чате',
    description: 'Анна Петрова отправила вам сообщение',
    date: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 минут назад
  },
  {
    id: 2,
    title: 'Напоминание о занятии',
    description: 'Через 30 минут начинается урок математики',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
  },
  {
    id: 3,
    title: 'Новый материал доступен',
    description: 'Загружен новый учебный материал по физике',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 часов назад
  },
  {
    id: 4,
    title: 'Оплата прошла успешно оплата прошла успешно',
    description: 'Ваш платеж на сумму 5000 ₽ обработан',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
  },
  {
    id: 5,
    title: 'Приглашение в группу',
    description: 'Вас пригласили в группу "Продвинутая математика"',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
  },
  {
    id: 6,
    title: 'Обновление системы',
    description: 'Система была обновлена до версии 2.1.0',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 неделя назад
  },
  {
    id: 7,
    title: 'День рождения ученика',
    description: 'Сегодня день рождения у Марии Ивановой',
    date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // через 30 минут
  },
];

export const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleToSettings = () => {
    navigate({ to: location.pathname, search: { iid: 'profile', tab: 'notifications' } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-[32px] w-[32px] p-1">
          <Notification className="fill-gray-80" size="s" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex w-[310px] flex-col gap-1 rounded-[20px] border-2 px-1 py-1"
      >
        <DropdownMenuLabel className="text-m-base flex h-[48px] items-center p-3 font-semibold text-gray-100">
          Уведомления
          <Button
            onClick={handleToSettings}
            variant="ghost"
            className="ml-auto h-[32px] w-[32px] p-1"
          >
            <Settings className="fill-gray-80" size="s" />
          </Button>
        </DropdownMenuLabel>
        <ScrollArea className="h-[300px] pr-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex h-full items-start gap-2 rounded-[16px] p-3"
              >
                <UserProfile userId={notification.id} withOutText />
                <div className="flex flex-col gap-1">
                  <span className="text-m-base font-medium text-gray-100">
                    {notification.title}
                  </span>
                  <span className="text-gray-80 text-s-base font-normal">
                    {notification.description}
                  </span>
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
              </DropdownMenuItem>
            ))
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
