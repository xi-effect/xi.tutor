import { useState } from 'react';
import { toast } from 'sonner';
import { TelegramFilled, MailRounded, Notification, VK, Trash } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { Button } from '@xipkg/button';
import { useMediaQuery } from '@xipkg/utils';
import { VkConnectButton } from 'common.ui';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('profile');
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
      text: t('notifications.notConnected'),
      color: 'text-text-primary',
    },
    {
      condition: isVkAwaitingConfirmation,
      text: t('notifications.awaitingConfirmationVk'),
      color: 'text-text-primary',
    },
    {
      condition: isVkConnectionActive,
      text: vkDeliveryMethod?.related_contact?.title || t('notifications.connected'),
      color: 'text-text-primary',
    },
    {
      condition: isVkConnectionBlocked,
      text: t('notifications.blockedVk'),
      color: 'text-text-danger',
    },
    {
      condition: isVkConnectionReplaced,
      text: t('notifications.replaced'),
      color: 'text-tag-orange-accent',
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
          <Trash className="fill-icon-primary pointer" />
          <span className="sr-only">{t('notifications.delete')}</span>
        </Button>
      );
    }

    if (isVkConnectionBlocked) {
      return (
        <VkConnectButton
          label={t('notifications.unblock')}
          isPreparing={isVkPending && !isVkWidgetReady}
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
          label={t('notifications.reconnect')}
          isPreparing={isVkPending && !isVkWidgetReady}
          groupId={vkConnectionData?.group_id}
          connectionKey={vkConnectionData?.key}
          onFallbackClick={handleConnectVk}
          onWidgetInteraction={handleVkWidgetInteraction}
        />
      );
    }

    return (
      <VkConnectButton
        label={t('notifications.connect')}
        isPreparing={isVkPending && !isVkWidgetReady}
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
        <h1 className="bg-background-surface dark:text-text-primary sticky top-0 z-10 mb-4 pb-2 text-3xl font-semibold">
          {t('notifications.title')}
        </h1>
      )}

      <div className="flex w-full min-w-0 flex-col gap-4">
        {isSupported && (
          <div className="border-border-control bg-background-surface flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
            <div className="hover:bg-background-page flex flex-row items-center gap-4 rounded-xl bg-transparent p-3">
              <Notification className="fill-icon-brand h-8 w-8 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="dark:text-text-primary w-fit font-semibold">
                  {t('notifications.systemTitle')}
                </span>
                <span className="text-text-primary dark:text-text-primary font-inter text-xs font-normal">
                  {t('notifications.systemDescription')}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 px-3 pb-3">
              <div className="flex flex-row items-center justify-between gap-4 p-2">
                <span className="font-inter text-m-base dark:text-text-primary min-w-0 flex-1 font-medium">
                  {t('notifications.showSystem')}
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
                  <span className="text-text-primary dark:text-text-primary font-inter text-s-base min-w-0">
                    {permission === 'denied'
                      ? t('notifications.permissionDenied')
                      : t('notifications.permissionNeeded')}
                  </span>
                  {permission !== 'denied' && (
                    <Button
                      size="s"
                      className="shrink-0"
                      onClick={handleRequestPermission}
                      disabled={requestingPermission}
                    >
                      {requestingPermission
                        ? t('notifications.requesting')
                        : t('notifications.allow')}
                    </Button>
                  )}
                </div>
              )}
              {permission === 'granted' && (
                <div className="flex flex-row flex-wrap items-center gap-2 px-2">
                  <span className="text-text-primary dark:text-text-primary font-inter text-s-base">
                    {t('notifications.permissionGranted')}
                  </span>
                  <Button
                    size="s"
                    variant="ghost"
                    onClick={() => {
                      const ok = showTestSystemNotification();
                      if (!ok) {
                        toast.error(t('notifications.testFailed'));
                      }
                    }}
                  >
                    {t('notifications.test')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-border-control bg-background-surface flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-background-page flex flex-row items-center gap-4 rounded-xl bg-transparent p-2">
            <TelegramFilled className="fill-icon-brand size-8 shrink-0" />

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span className="dark:text-text-primary w-fit leading-5 font-semibold">
                {t('notifications.telegram')}
              </span>
              {tgConnectionStatus
                .filter(({ condition }) => condition)
                .map(({ text, color }) => (
                  <span key={text} className={`${color} text-xs-base sm:text-s-base leading-4`}>
                    {text || user?.username}
                  </span>
                ))}
            </div>

            <div className="flex h-11 shrink-0 items-center">{tgActionButton()}</div>
          </div>

          {isTgConnectionActive && <NotificationsToggles deliveryMethodKind="telegram" />}
        </div>

        <div className="border-border-control bg-background-surface flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-background-page flex flex-row items-center gap-4 rounded-xl bg-transparent p-2">
            <VK className="size-8 shrink-0 !text-[#0077FF]" />

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span className="dark:text-text-primary w-fit leading-5 font-semibold">
                {t('notifications.vk')}
              </span>
              {vkConnectionStatus
                .filter(({ condition }) => condition)
                .map(({ text, color }) => (
                  <span key={text} className={`${color} text-xs-base sm:text-s-base leading-4`}>
                    {text}
                  </span>
                ))}
            </div>

            <div className="flex h-11 shrink-0 items-center">{vkActionButton()}</div>
          </div>

          {isVkConnectionActive && <NotificationsToggles deliveryMethodKind="vk" />}
        </div>

        <div className="border-border-control bg-background-surface flex w-full min-w-0 shrink-0 flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-background-page flex flex-row items-center gap-4 rounded-xl bg-transparent p-3">
            <MailRounded className="fill-icon-brand shrink-0" />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="dark:text-text-primary w-fit font-semibold">
                {t('notifications.email')}
              </span>
              <span className="text-text-primary dark:text-text-primary font-inter truncate text-xs font-normal">
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
