export const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Учится';
    case 'paused':
      return 'На паузе';
    case 'locked':
      return 'Заблокировано';
    case 'finished':
      return 'Обучение завершено';
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

export const handleTelegramClick = ({ link }: { link: string }) => {
  window.open(link, '_blank');
};
