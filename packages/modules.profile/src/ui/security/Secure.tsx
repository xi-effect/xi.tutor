import { ChevronRight, Key, Mail } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';

import { getRelativeTime } from '../../utils/getRelativeTime';
import { useState } from 'react';
import { ChangePassword } from './ChangePassword';
import { ChangeEmail } from './ChangeEmail';
import { useTranslation } from 'react-i18next';
import { SettingsGroup, settingsRowTitleClass } from '../layout/SettingsGroup';

export const Secure = () => {
  const { t } = useTranslation('profile');
  const { data: user } = useCurrentUser();

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);

  return (
    <>
      <SettingsGroup title={t('security.accountData')} description={t('security.visibleOnlyToYou')}>
        <div className="flex flex-col">
          <ChangePassword
            open={isChangePasswordModalOpen}
            onOpenChange={setIsChangePasswordModalOpen}
          >
            <button
              type="button"
              className="hover:bg-background-subtle flex min-h-16 flex-row items-center gap-4 rounded-xl bg-transparent px-1 py-3"
            >
              <Key className="fill-icon-brand" />
              <div className="flex flex-col">
                <span className={settingsRowTitleClass}>{t('security.password')}</span>
                <span className="text-text-secondary text-xs font-normal">
                  {t('security.passwordUpdated', {
                    time: getRelativeTime(user?.password_last_changed_at),
                  })}
                </span>
              </div>
              <ChevronRight className="fill-icon-secondary ml-auto" />
            </button>
          </ChangePassword>
          <ChangeEmail open={isChangeEmailModalOpen} onOpenChange={setIsChangeEmailModalOpen}>
            <button
              type="button"
              className="hover:bg-background-subtle flex min-h-16 flex-row items-center gap-4 rounded-xl bg-transparent px-1 py-3"
            >
              <Mail className="fill-icon-brand" />
              <div className="flex flex-col">
                <span className={settingsRowTitleClass}>{t('security.email')}</span>
                <span className="text-text-secondary text-xs font-normal">{user?.email}</span>
              </div>
              <ChevronRight className="fill-icon-secondary ml-auto" />
            </button>
          </ChangeEmail>
        </div>
      </SettingsGroup>
    </>
  );
};
