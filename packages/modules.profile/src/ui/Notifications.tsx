import { ChevronRight, TelegramFilled, Trash, MailRounded } from '@xipkg/icons';
import { useMediaQuery } from '@xipkg/utils';

import { NotificationsToggles } from './NotificationsToggles';
import { Button } from '@xipkg/button';
import { useNotificationsData } from '../hooks';

export const Notifications = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const {
    handleConnectTg,
    handleDisconnectTg,
    tgConnectionStatus,
    isTgConnectionActive,
    isTgConnectionBlocked,
    user,
  } = useNotificationsData();

  return (
    <>
      {!isMobile && <h1 className="mb-4 text-3xl font-semibold">Уведомления</h1>}

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
                <span className="w-fit font-semibold">Telegram</span>
                {tgConnectionStatus
                  .filter(({ condition }) => condition)
                  .map(({ text, color }) => (
                    <span key={text} className={`${color} text-xs-base sm:text-s-base`}>
                      {text}
                    </span>
                  ))}
              </div>

              {isTgConnectionActive ? (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisconnectTg();
                  }}
                  className="ml-auto bg-transparent"
                >
                  <Trash className="fill-gray-80 pointer" />
                  <span className="sr-only">Удалить</span>
                </Button>
              ) : isTgConnectionBlocked ? (
                <div className="md:ml-auto">
                  <Button
                    variant="ghost"
                    className="text-brand-100 h-8 p-0 py-1.5 sm:px-4 xl:px-6 xl:py-3"
                  >
                    Разблокировать
                  </Button>
                </div>
              ) : (
                <ChevronRight className="fill-gray-80 ml-auto" />
              )}
            </div>
          </div>

          {isTgConnectionActive && <NotificationsToggles type="telegram" />}
        </div>
        <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div className="hover:bg-gray-5 flex h-[66px] cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-3">
            <MailRounded className="fill-brand-80" />

            <div className="items-star flex flex-col">
              <span className="w-fit font-semibold">Электронная почта</span>
              <span className="text-gray-80 font-inter text-xs font-normal">
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
