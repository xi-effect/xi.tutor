import { useState } from 'react';
import { toast } from 'sonner';
import { TelegramFilled, MailRounded, Notification, VK, Trash } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { Button } from '@xipkg/button';
import { useMediaQuery } from '@xipkg/utils';
import { VkConnectButton } from 'common.ui';

import { NotificationsToggles } from './NotificationsToggles';
import { useNotificationsStatus } from '../hooks';
import { useDisconnectVk } from '../services';
import {
  useCurrentUser,
  useGetDeliveryMethods,
  useSystemNotificationSettings,
  showTestSystemNotification,
  useVkConnection,
} from 'common.services';

export const Notifications = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');
  const { data: user } = useCurrentUser();
  const { data: deliveryMethods } = useGetDeliveryMethods();
  const { isSupported, permission, enabled, setEnabled, requestPermission } =
    useSystemNotificationSettings();

  const { tgConnectionStatus, isTgConnectionActive, tgActionButton } = useNotificationsStatus();

  const {
    vk: vkDeliveryMethod,
    isActive: isVkConnectionActive,
    isBlocked: isVkConnectionBlocked,
    isReplaced: isVkConnectionReplaced,
    isNotConnected: isVkNotConnected,
    isPending: isVkPending,
    isWidgetReady: isVkWidgetReady,
    isAwaitingConfirmation: isVkAwaitingConfirmation,
    connectionData: vkConnectionData,
    handleConnect: handleConnectVk,
    handleWidgetInteraction: handleVkWidgetInteraction,
  } = useVkConnection();
  const { handleDisconnectVk } = useDisconnectVk();

  const isEmailConnected = deliveryMethods?.email !== null && deliveryMethods?.email !== undefined;

  const vkConnectionStatus = [
    {
      condition: isVkNotConnected && !isVkAwaitingConfirmation,
      text: 'Не подключен',
      color: 'text-gray-80',
    },
    {
      condition: isVkAwaitingConfirmation,
      text: 'Ожидаем подтверждение во ВКонтакте…',
      color: 'text-gray-80',
    },
    {
      condition: isVkConnectionActive,
      text: vkDeliveryMethod?.related_contact?.title || 'Подключен',
      color: 'text-gray-80',
    },
    {
      condition: isVkConnectionBlocked,
      text: 'Разрешите сообщения от сообщества ВКонтакте или удалите привязку и подключите заново',
      color: 'text-red-80',
    },
    {
      condition: isVkConnectionReplaced,
      text: 'Удалите текущую привязку и подключите заново',
      color: 'text-orange-60',
    },
  ];

  const vkActionButton = () => {
    if (isVkConnectionActive) {
      return (
        <Button
          variant="none"
          type="button"
          onClick={handleDisconnectVk}
          className="ml-auto shrink-0 bg-transparent"
        >
          <Trash className="fill-gray-80 pointer" />
          <span className="sr-only">Удалить</span>
        </Button>
      );
    }

    if (isVkConnectionBlocked) {
      return (
        <VkConnectButton
          label={isVkAwaitingConfirmation ? 'Ожидаем…' : 'Разблокировать'}
          isPreparing={isVkPending && !isVkWidgetReady}
          isAwaitingConfirmation={isVkAwaitingConfirmation}
          groupId={vkConnectionData?.group_id}
          connectionKey={vkConnectionData?.key}
          onFallbackClick={handleConnectVk}
          onWidgetInteraction={handleVkWidgetInteraction}
        />
      );
    }

    if (isVkConnectionReplaced) {
      return (
        <VkConnectButton
          label={isVkAwaitingConfirmation ? 'Ожидаем…' : 'Подключить заново'}
          isPreparing={isVkPending && !isVkWidgetReady}
          isAwaitingConfirmation={isVkAwaitingConfirmation}
          groupId={vkConnectionData?.group_id}
          connectionKey={vkConnectionData?.key}
          onFallbackClick={handleConnectVk}
          onWidgetInteraction={handleVkWidgetInteraction}
        />
      );
    }

    return (
      <VkConnectButton
        label={isVkAwaitingConfirmation ? 'Ожидаем…' : 'Подключить'}
        isPreparing={isVkPending && !isVkWidgetReady}
        isAwaitingConfirmation={isVkAwaitingConfirmation}
        groupId={vkConnectionData?.group_id}
        connectionKey={vkConnectionData?.key}
        onFallbackClick={handleConnectVk}
        onWidgetInteraction={handleVkWidgetInteraction}
      />
    );
  };

  const [requestingPermission, setRequestingPermission] = useState(false);
  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      await requestPermission();
    } finally {
      setRequestingPermission(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      {!isMobile && (
        <h1 className="bg-gray-0 sticky top-0 z-10 mb-4 pb-2 text-3xl font-semibold dark:text-gray-100">
          Уведомления
        </h1>
      )}

      <div className="flex w-full min-w-0 flex-col gap-4">
        {isSupported && (
          <div className="border-gray-30 bg-gray-0 flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
            <div className="hover:bg-gray-5 flex flex-row items-center gap-4 rounded-xl bg-transparent p-3">
              <Notification className="fill-brand-80 h-8 w-8 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="w-fit font-semibold dark:text-gray-100">
                  Системные уведомления
                </span>
                <span className="text-gray-80 dark:text-gray-80 font-inter text-xs font-normal">
                  Всплывающие уведомления ОС при новых событиях — в другой вкладке или когда
                  приложение свёрнуто.
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 px-3 pb-3">
              <div className="flex flex-row items-center justify-between gap-4 p-2">
                <span className="font-inter text-m-base min-w-0 flex-1 font-medium dark:text-gray-100">
                  Показывать системные уведомления
                </span>
                <Toggle
                  checked={enabled}
                  size="l"
                  className="shrink-0"
                  onCheckedChange={setEnabled}
                  disabled={permission !== 'granted'}
                />
              </div>
              {permission !== 'granted' && (
                <div className="flex flex-row items-center justify-between gap-2 p-2">
                  <span className="text-gray-80 dark:text-gray-80 font-inter text-s-base min-w-0">
                    {permission === 'denied'
                      ? 'Разрешение отклонено. Разрешите уведомления в настройках браузера.'
                      : 'Выдайте разрешение, чтобы получать уведомления в другой вкладке или когда окно свёрнуто.'}
                  </span>
                  {permission !== 'denied' && (
                    <Button
                      size="s"
                      className="shrink-0"
                      onClick={handleRequestPermission}
                      disabled={requestingPermission}
                    >
                      {requestingPermission ? 'Запрос…' : 'Разрешить уведомления'}
                    </Button>
                  )}
                </div>
              )}
              {permission === 'granted' && (
                <div className="flex flex-row flex-wrap items-center gap-2 px-2">
                  <span className="text-gray-80 dark:text-gray-80 font-inter text-s-base">
                    Разрешение выдано
                  </span>
                  <Button
                    size="s"
                    variant="ghost"
                    onClick={() => {
                      const ok = showTestSystemNotification();
                      if (!ok) {
                        toast.error(
                          'Не удалось показать: нет разрешения или браузер не поддерживает. См. консоль (F12).',
                        );
                      }
                    }}
                  >
                    Проверить уведомление
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-gray-30 bg-gray-0 flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-gray-5 flex flex-row items-center gap-4 rounded-xl bg-transparent p-2">
            <TelegramFilled className="fill-brand-80 size-8 shrink-0" />

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span className="w-fit leading-5 font-semibold dark:text-gray-100">Telegram</span>
              {tgConnectionStatus
                .filter(({ condition }) => condition)
                .map(({ text, color }) => (
                  <span key={text} className={`${color} text-xs-base sm:text-s-base leading-4`}>
                    {text || user?.username}
                  </span>
                ))}
            </div>

            <div className="flex h-8 shrink-0 items-center">{tgActionButton()}</div>
          </div>

          {isTgConnectionActive && <NotificationsToggles deliveryMethodKind="telegram" />}
        </div>

        <div className="border-gray-30 bg-gray-0 flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-gray-5 flex flex-row items-center gap-4 rounded-xl bg-transparent p-2">
            <VK className="size-8 shrink-0 !text-[#0077FF]" />

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span className="w-fit leading-5 font-semibold dark:text-gray-100">ВКонтакте</span>
              {vkConnectionStatus
                .filter(({ condition }) => condition)
                .map(({ text, color }) => (
                  <span key={text} className={`${color} text-xs-base sm:text-s-base leading-4`}>
                    {text}
                  </span>
                ))}
            </div>

            <div className="flex h-8 shrink-0 items-center">{vkActionButton()}</div>
          </div>

          {isVkConnectionActive && <NotificationsToggles deliveryMethodKind="vk" />}
        </div>

        <div className="border-gray-30 bg-gray-0 flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-gray-5 flex flex-row items-center gap-4 rounded-xl bg-transparent p-3">
            <MailRounded className="fill-brand-80 shrink-0" />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="w-fit font-semibold dark:text-gray-100">Электронная почта</span>
              <span className="text-gray-80 dark:text-gray-80 font-inter truncate text-xs font-normal">
                {user?.email ||
                  deliveryMethods?.email?.related_contact?.title ||
                  'example@example.com'}
              </span>
            </div>
          </div>

          {isEmailConnected && <NotificationsToggles deliveryMethodKind="email" />}
        </div>
      </div>
    </div>
  );
};
