/* eslint-disable no-irregular-whitespace */
import { ChevronRight, Key, Mail } from '@xipkg/icons';
import { useMediaQuery } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';

import { getRelativeTime } from '../utils/getRelativeTime';
import { useState } from 'react';
import { ChangePassword } from './ChangePassword';
import { ChangeEmail } from './ChangeEmail';

export const Secure = () => {
  const { data: user } = useCurrentUser();

  const isMobile = useMediaQuery('(max-width: 719px)');

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);

  return (
    <>
      {!isMobile && (
        <h1 className="dark:text-text-primary mb-4 text-3xl font-semibold">Безопасность</h1>
      )}
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="border-border-strong flex w-full flex-col rounded-2xl border p-1">
          <div className="flex w-full flex-col p-3">
            <span className="dark:text-text-primary text-xl font-semibold">Данные аккаунта</span>
            <span className="dark:text-text-primary text-sm font-normal">Видны только вам</span>
          </div>
          <ChangePassword
            open={isChangePasswordModalOpen}
            onOpenChange={setIsChangePasswordModalOpen}
          >
            <button
              type="button"
              className="hover:bg-background-page flex h-[66px] flex-row items-center gap-4 rounded-xl bg-transparent p-3"
            >
              <Key className="fill-icon-brand" />
              <div className="items-star flex flex-col">
                <span className="dark:text-text-primary w-fit font-semibold">Пароль</span>
                <span className="dark:text-text-primary text-xs font-normal">{`Обновлён ${getRelativeTime(user?.password_last_changed_at)}`}</span>
              </div>
              <ChevronRight className="fill-icon-primary ml-auto" />
            </button>
          </ChangePassword>
          <ChangeEmail open={isChangeEmailModalOpen} onOpenChange={setIsChangeEmailModalOpen}>
            <button
              type="button"
              className="hover:bg-background-page flex h-[66px] flex-row items-center gap-4 rounded-xl bg-transparent p-3"
            >
              <Mail className="fill-icon-brand" />
              <div className="items-star flex flex-col">
                <span className="dark:text-text-primary w-fit font-semibold">Почта</span>
                <span className="dark:text-text-primary text-xs font-normal">{user?.email}</span>
              </div>
              <ChevronRight className="fill-icon-primary ml-auto" />
            </button>
          </ChangeEmail>
        </div>
      </div>
    </>
  );
};
