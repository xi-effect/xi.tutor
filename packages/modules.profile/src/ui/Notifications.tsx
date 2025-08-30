import { TelegramFilled, MailRounded } from '@xipkg/icons';
import { useMediaQuery } from '@xipkg/utils';

import { NotificationsToggles } from './NotificationsToggles';
import { useNotificationsStatus } from '../hooks';
import { useCurrentUser } from 'common.services';

export const Notifications = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');
  const { data: user } = useCurrentUser();

  const { handleConnectTg, tgConnectionStatus, isTgConnectionActive, tgActionButton } =
    useNotificationsStatus();

  return (
    <>
      {!isMobile && <h1 className="mb-4 text-3xl font-semibold dark:text-gray-100">Уведомления</h1>}

      <div className="flex flex-col gap-4">
        <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div
            onClick={() => handleConnectTg()}
            className="hover:bg-gray-5 flex cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-2"
          >
            <div className="mt-2 flex-1 sm:mt-0 sm:flex-0">
              <TelegramFilled size="lg" className="fill-brand-80" />
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
