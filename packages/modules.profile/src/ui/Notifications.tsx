import { useState } from 'react';
import { toast } from 'sonner';
import { TelegramFilled, MailRounded, Notification } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { Button } from '@xipkg/button';
import { useMediaQuery } from '@xipkg/utils';

import { NotificationsToggles } from './NotificationsToggles';
import { useNotificationsStatus } from '../hooks';
import {
  useCurrentUser,
  useSystemNotificationSettings,
  showTestSystemNotification,
} from 'common.services';

export const Notifications = () => {
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
                      // При успехе toast не показываем — должно прийти только системное уведомление ОС (угол экрана / центр уведомлений)
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

          {isTgConnectionActive && <NotificationsToggles type="telegram" />}
        </div>
        <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-gray-5 flex h-[66px] cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-3">
            <MailRounded className="fill-brand-80" />

            <div className="items-star flex flex-col">
              <span className="w-fit font-semibold dark:text-gray-100">Электронная почта</span>
              <span className="text-gray-80 dark:text-gray-80 font-inter text-xs font-normal">
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
