export const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Учится';
    case 'paused':
      return 'Приостановлено';
    case 'locked':
      return 'Заблокировано';
    case 'finished':
      return 'Завершено';
    default:
      return 'Неизвестно';
  }
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success' as const;
    case 'paused':
      return 'warning' as const;
    case 'locked':
      return 'destructive' as const;
    case 'finished':
      return 'secondary' as const;
    default:
      return 'secondary' as const;
  }
};

export const handleTelegramClick = () => {
  // TODO: Получить реальный telegram username из данных пользователя
  window.open('https://t.me/nickname', '_blank');
};
