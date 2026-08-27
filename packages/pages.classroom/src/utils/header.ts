import { getEducationStatusLabel } from 'common.ui';
import i18n from 'i18next';

const translateEducationStatus = (key: string) => String(i18n.t(key, { ns: 'commonUi' }));

export const getStatusText = (status: string) => {
  return getEducationStatusLabel(status, false, translateEducationStatus);
};

export const getStatusTextByRole = (status: string, isTutor: boolean) => {
  return getEducationStatusLabel(status, isTutor, translateEducationStatus);
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
