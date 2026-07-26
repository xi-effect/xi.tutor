import { useGetNotificationsStatus } from 'common.services';
import { useConnectTg, useDisconnectTg } from '../services';
import { Button } from '@xipkg/button';
import { ChevronRight, Trash } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

export function useNotificationsStatus() {
  const { t } = useTranslation('profile');
  const { data } = useGetNotificationsStatus();

  const { handleConnectTg } = useConnectTg();
  const { handleDisconnectTg } = useDisconnectTg();

  const status = data?.telegram?.connection.status;

  const isTgConnectionActive = status === 'active';
  const isTgConnectionBlocked = status === 'blocked';
  const isTgConnectionReplaced = status === 'replaced';
  const isNotConnected = !data?.telegram;

  const tgConnectionStatus = [
    {
      condition: isNotConnected,
      text: t('notifications.notConnected'),
      color: 'text-text-primary',
    },
    {
      condition: isTgConnectionActive,
      text: data?.telegram?.contact?.title,
      color: 'text-text-primary',
    },
    {
      condition: isTgConnectionBlocked,
      text: t('notifications.blocked'),
      color: 'text-text-danger',
    },
    {
      condition: isTgConnectionReplaced,
      text: t('notifications.replaced'),
      color: 'text-tag-orange-accent',
    },
  ];

  const tgActionButton = () => {
    if (isTgConnectionActive) {
      return (
        <Button
          variant="none"
          type="button"
          onClick={handleDisconnectTg}
          className="ml-auto bg-transparent"
        >
          <Trash className="fill-icon-primary pointer" />
          <span className="sr-only">{t('notifications.delete')}</span>
        </Button>
      );
    }

    if (isTgConnectionBlocked) {
      return (
        <Button
          variant="none"
          className="text-text-link ml-auto h-8 p-0 py-1.5 sm:px-4 xl:px-6 xl:py-3"
          onClick={handleConnectTg}
        >
          {t('notifications.unblock')}
        </Button>
      );
    }

    if (isTgConnectionReplaced) {
      return (
        <Button
          variant="none"
          className="text-text-link ml-auto h-8 p-0 py-1.5 sm:px-4 xl:px-6 xl:py-3"
          onClick={handleConnectTg}
        >
          {t('notifications.reconnect')}
        </Button>
      );
    }

    return <ChevronRight className="fill-icon-primary ml-auto" />;
  };

  return {
    data,
    isTgConnectionActive,
    isTgConnectionBlocked,
    isTgConnectionReplaced,
    tgConnectionStatus,
    handleConnectTg,
    handleDisconnectTg,
    tgActionButton,
  };
}
