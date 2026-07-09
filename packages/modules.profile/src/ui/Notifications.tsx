import { useState } from 'react';
import { toast } from 'sonner';
import { TelegramFilled, MailRounded, Notification, VK, Trash } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { Button } from '@xipkg/button';
import { useMediaQuery } from '@xipkg/utils';
import { VkAllowMessagesWidget } from 'common.ui';

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

  const { handleConnectTg, tgConnectionStatus, isTgConnectionActive, tgActionButton } =
    useNotificationsStatus();

  const {
    isConnected: isVkConnected,
    isPending: isVkPending,
    connectionData: vkConnectionData,
    handleConnect: handleConnectVk,
    handleCheckConnection: handleCheckVkConnection,
  } = useVkConnection();
  const { handleDisconnectVk } = useDisconnectVk();

  const isEmailConnected = deliveryMethods?.email !== null && deliveryMethods?.email !== undefined;
  const isVkConnectionActive = deliveryMethods?.vk?.delivery_method.status === 'active';

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
    <>
      {!isMobile && <h1 className="mb-4 text-3xl font-semibold dark:text-gray-100">Уведомления</h1>}

      <div className="flex flex-col gap-4">
        {isSupported && (
          <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
            <div className="hover:bg-gray-5 flex flex-row items-center gap-4 rounded-xl bg-transparent p-3">
              <Notification className="fill-brand-80 h-8 w-8" />
              <div className="flex flex-1 flex-col gap-1">
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
              <div className="flex flex-row items-center justify-between p-2">
                <span className="font-inter text-m-base font-medium dark:text-gray-100">
                  Показывать системные уведомления
                </span>
                <Toggle
                  checked={enabled}
                  size="l"
                  onCheckedChange={setEnabled}
                  disabled={permission !== 'granted'}
                />
              </div>
              {permission !== 'granted' && (
                <div className="flex flex-row items-center justify-between gap-2 p-2">
                  <span className="text-gray-80 dark:text-gray-80 font-inter text-s-base">
                    {permission === 'denied'
                      ? 'Разрешение отклонено. Разрешите уведомления в настройках браузера.'
                      : 'Выдайте разрешение, чтобы получать уведомления в другой вкладке или когда окно свёрнуто.'}
                  </span>
                  {permission !== 'denied' && (
                    <Button
                      size="s"
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

        <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div
            onClick={() => handleConnectTg()}
            className="hover:bg-gray-5 flex cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-2"
          >
            <div className="mt-2 flex-1 sm:mt-0 sm:flex-0">
              <TelegramFilled size="lg" className="fill-brand-80 h-8 w-8" />
            </div>

            <div className="flex w-full flex-col items-center gap-1 sm:flex-row">
              <div className="items-star flex flex-col gap-1">
                <span className="w-fit font-semibold dark:text-gray-100">Telegram</span>
                {tgConnectionStatus
                  .filter(({ condition }) => condition)
                  .map(({ text, color }) => (
                    <span key={text} className={`${color} text-xs-base sm:text-s-base`}>
                      {text || user?.username}
                    </span>
                  ))}
              </div>
            </div>
            {tgActionButton()}
          </div>

          {isTgConnectionActive && <NotificationsToggles deliveryMethodKind="telegram" />}
        </div>

        <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-gray-5 flex flex-row items-center gap-4 rounded-xl bg-transparent p-2">
            <VK className="fill-brand-80 h-8 w-8" />

            <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-1">
                <span className="w-fit font-semibold dark:text-gray-100">ВКонтакте</span>
                {isVkConnected ? (
                  <span className="text-gray-80 text-xs-base sm:text-s-base">
                    {deliveryMethods?.vk?.related_contact?.title}
                  </span>
                ) : (
                  <span className="text-gray-80 text-xs-base sm:text-s-base">Не подключен</span>
                )}
              </div>

              {isVkConnectionActive ? (
                <Button
                  variant="none"
                  type="button"
                  onClick={handleDisconnectVk}
                  className="ml-auto bg-transparent"
                >
                  <Trash className="fill-gray-80 pointer" />
                  <span className="sr-only">Удалить</span>
                </Button>
              ) : vkConnectionData ? null : isVkPending ? (
                <span className="text-gray-60 dark:text-gray-80 ml-auto py-1 sm:py-3">
                  Формируем ключ…
                </span>
              ) : (
                <Button
                  variant="none"
                  className="text-brand-100 ml-auto h-8 p-0 py-1.5 sm:px-4 xl:px-6 xl:py-3"
                  onClick={handleConnectVk}
                >
                  Подключить
                </Button>
              )}
            </div>
          </div>

          {vkConnectionData && !isVkConnected && (
            <div className="flex flex-col gap-3 px-3 pb-3">
              <VkAllowMessagesWidget
                communityId={vkConnectionData.community_id}
                connectionKey={vkConnectionData.key}
              />
              <Button size="s" className="self-start" onClick={handleCheckVkConnection}>
                Проверить подключение
              </Button>
            </div>
          )}

          {isVkConnectionActive && <NotificationsToggles deliveryMethodKind="vk" />}
        </div>

        <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-gray-5 flex h-[66px] cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-3">
            <MailRounded className="fill-brand-80" />

            <div className="items-star flex flex-col">
              <span className="w-fit font-semibold dark:text-gray-100">Электронная почта</span>
              <span className="text-gray-80 dark:text-gray-80 font-inter text-xs font-normal">
                {user?.email ||
                  deliveryMethods?.email?.related_contact?.title ||
                  'example@example.com'}
              </span>
            </div>
          </div>

          {isEmailConnected && <NotificationsToggles deliveryMethodKind="email" />}
        </div>
      </div>
    </>
  );
};
