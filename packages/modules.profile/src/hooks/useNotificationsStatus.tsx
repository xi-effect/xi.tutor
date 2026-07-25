import { useTgConnection } from 'common.services';
import { useDisconnectTg } from '../services';
import { Button } from '@xipkg/button';
import { Trash } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

export function useNotificationsStatus() {
  const { t } = useTranslation('profile');
  const {
    telegram,
    isActive: isTgConnectionActive,
    isBlocked: isTgConnectionBlocked,
    isReplaced: isTgConnectionReplaced,
    isNotConnected,
    isPending: isTgPending,
    isAwaitingConfirmation: isTgAwaitingConfirmation,
    handleConnect: handleConnectTg,
  } = useTgConnection();
  const { handleDisconnectTg } = useDisconnectTg();

  const tgConnectionStatus = [
    {
      condition: isNotConnected && !isTgAwaitingConfirmation,
      text: t('notifications.notConnected'),
      color: 'text-text-primary',
    },
    {
      condition: isTgAwaitingConfirmation,
      text: t('notifications.awaitingConfirmationTg'),
      color: 'text-text-primary',
    },
    {
      condition: isTgConnectionActive,
      text: telegram?.related_contact?.title,
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

  const connectButtonClassName = 'text-s-base text-text-link h-8 px-2 py-0';

  const connectButtonLabel = (idleLabel: string) => {
    if (isTgAwaitingConfirmation) return t('notifications.awaiting');
    if (isTgPending) return t('notifications.formingLink');
    return idleLabel;
  };

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
          className={connectButtonClassName}
          onClick={handleConnectTg}
          disabled={isTgPending}
        >
          {connectButtonLabel(t('notifications.unblock'))}
        </Button>
      );
    }

    if (isTgConnectionReplaced) {
      return (
        <Button
          variant="none"
          className={connectButtonClassName}
          onClick={handleConnectTg}
          disabled={isTgPending}
        >
          {connectButtonLabel(t('notifications.reconnect'))}
        </Button>
      );
    }

    return (
      <Button
        variant="none"
        className={connectButtonClassName}
        onClick={handleConnectTg}
        disabled={isTgPending}
      >
        {connectButtonLabel(t('notifications.connect'))}
      </Button>
    );
  };

  return {
    isTgConnectionActive,
    isTgConnectionBlocked,
    isTgConnectionReplaced,
    tgConnectionStatus,
    handleConnectTg,
    handleDisconnectTg,
    tgActionButton,
  };
}
