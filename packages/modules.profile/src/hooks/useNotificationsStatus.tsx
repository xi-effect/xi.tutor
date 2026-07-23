import { useTgConnection } from 'common.services';
import { useDisconnectTg } from '../services';
import { Button } from '@xipkg/button';
import { Trash } from '@xipkg/icons';

export function useNotificationsStatus() {
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
      text: 'Не подключен',
      color: 'text-gray-80',
    },
    {
      condition: isTgAwaitingConfirmation,
      text: 'Ожидаем подтверждение в Telegram…',
      color: 'text-gray-80',
    },
    {
      condition: isTgConnectionActive,
      text: telegram?.related_contact?.title,
      color: 'text-gray-80',
    },
    {
      condition: isTgConnectionBlocked,
      text: 'Разблокируйте бота в Telegram или удалите привязку и подключите заново',
      color: 'text-red-80',
    },
    {
      condition: isTgConnectionReplaced,
      text: 'Удалите текущую привязку и подключите заново',
      color: 'text-orange-60',
    },
  ];

  const connectButtonClassName = 'text-s-base text-brand-100 h-8 px-2 py-0';

  const tgActionButton = () => {
    if (isTgConnectionActive) {
      return (
        <Button
          variant="none"
          type="button"
          onClick={handleDisconnectTg}
          className="ml-auto bg-transparent"
        >
          <Trash className="fill-gray-80 pointer" />
          <span className="sr-only">Удалить</span>
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
          {isTgAwaitingConfirmation
            ? 'Ожидаем…'
            : isTgPending
              ? 'Формируем ссылку…'
              : 'Разблокировать'}
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
          {isTgAwaitingConfirmation
            ? 'Ожидаем…'
            : isTgPending
              ? 'Формируем ссылку…'
              : 'Подключить заново'}
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
        {isTgAwaitingConfirmation ? 'Ожидаем…' : isTgPending ? 'Формируем ссылку…' : 'Подключить'}
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
