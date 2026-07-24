import { useState } from 'react';
import { toast } from 'sonner';
import { TelegramFilled, MailRounded, Notification } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { Button } from '@xipkg/button';
import { useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

import { NotificationsToggles } from './NotificationsToggles';
import { useNotificationsStatus } from '../hooks';
import {
  useCurrentUser,
  useSystemNotificationSettings,
  showTestSystemNotification,
} from 'common.services';

export const Notifications = () => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 719px)');
  const { data: user } = useCurrentUser();
  const { isSupported, permission, enabled, setEnabled, requestPermission } =
    useSystemNotificationSettings();

  const { handleConnectTg, tgConnectionStatus, isTgConnectionActive, tgActionButton } =
    useNotificationsStatus();

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
      {!isMobile && (
        <h1 className="dark:text-text-primary mb-4 text-3xl font-semibold">
          {t('notifications.title')}
        </h1>
      )}

      <div className="flex flex-col gap-4">
        {isSupported && (
          <div className="border-border-control flex w-full flex-col gap-2 rounded-2xl border p-1">
            <div className="hover:bg-background-page flex flex-row items-center gap-4 rounded-xl bg-transparent p-3">
              <Notification className="fill-icon-brand h-8 w-8" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="dark:text-text-primary w-fit font-semibold">
                  {t('notifications.systemTitle')}
                </span>
                <span className="text-text-primary dark:text-text-primary font-inter text-xs font-normal">
                  {t('notifications.systemDescription')}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 px-3 pb-3">
              <div className="flex flex-row items-center justify-between p-2">
                <span className="font-inter text-m-base dark:text-text-primary font-medium">
                  {t('notifications.showSystem')}
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
                  <span className="text-text-primary dark:text-text-primary font-inter text-s-base">
                    {permission === 'denied'
                      ? t('notifications.permissionDenied')
                      : t('notifications.permissionNeeded')}
                  </span>
                  {permission !== 'denied' && (
                    <Button
                      size="s"
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
                      // При успехе toast не показываем — должно прийти только системное уведомление ОС (угол экрана / центр уведомлений)
                    }}
                  >
                    {t('notifications.test')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-border-control flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div
            onClick={() => handleConnectTg()}
            className="hover:bg-background-page flex cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-2"
          >
            <div className="mt-2 flex-1 sm:mt-0 sm:flex-0">
              <TelegramFilled size="lg" className="fill-icon-brand h-8 w-8" />
            </div>

            <div className="flex w-full flex-col items-center gap-1 sm:flex-row">
              <div className="items-star flex flex-col gap-1">
                <span className="dark:text-text-primary w-fit font-semibold">
                  {t('notifications.telegram')}
                </span>
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

          {isTgConnectionActive && <NotificationsToggles type="telegram" />}
        </div>
        <div className="border-border-control flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-background-page flex h-[66px] cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-3">
            <MailRounded className="fill-icon-brand" />

            <div className="items-star flex flex-col">
              <span className="dark:text-text-primary w-fit font-semibold">
                {t('notifications.email')}
              </span>
              <span className="text-text-primary dark:text-text-primary font-inter text-xs font-normal">
                {user?.email || 'example@example.com'}
              </span>
            </div>
          </div>

          <NotificationsToggles type="email" />
        </div>
      </div>
    </>
  );
};
