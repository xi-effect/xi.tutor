import { educationUtils } from 'common.entities';

export const getStatusText = (status: string) => {
  return educationUtils.getStatusTextFromString(status);
};

export const getStatusTextByRole = (status: string, isTutor: boolean) => {
  return educationUtils.getStatusTextFromStringByRole(status, isTutor);
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
