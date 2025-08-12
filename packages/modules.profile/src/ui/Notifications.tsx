import { useState } from 'react';

import { ChevronRight, TelegramFilled, Trash, MailRounded } from '@xipkg/icons';
import { useMediaQuery } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';

import { NotificationsToggles } from './NotificationsToggles';

const nickname = '@nickname'; // TODO: get nickname from user

export const Notifications = () => {
  const { data: user } = useCurrentUser();

  const isMobile = useMediaQuery('(max-width: 719px)');

  const [isTelegram, setTelegram] = useState(false);

  return (
    <>
      {!isMobile && <h1 className="mb-4 text-3xl font-semibold">Уведомления</h1>}

      <div className="flex flex-col gap-4">
        <div className="border-gray-30 flex w-full flex-col gap-2 rounded-2xl border p-1">
          <div
            onClick={() => setTelegram(!isTelegram)}
            className="hover:bg-gray-5 flex h-[66px] cursor-pointer flex-row items-center gap-4 rounded-xl bg-transparent p-3"
          >
            <TelegramFilled className="fill-brand-80" />

            <div className="items-star flex flex-col">
              <span className="w-fit font-semibold">Telegram</span>
              <span className="text-gray-80 font-inter text-xs font-normal">
                {isTelegram ? nickname : user?.telegram_id || 'Не подключен'}
              </span>
            </div>

            {isTelegram ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTelegram(false);
                }}
                className="ml-auto bg-transparent"
              >
                <Trash className="fill-gray-80 pointer" />
                <span className="sr-only">Удалить</span>
              </button>
            ) : (
              <ChevronRight className="fill-gray-80 ml-auto" />
            )}
          </div>

          {isTelegram && <NotificationsToggles type="telegram" />}
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
