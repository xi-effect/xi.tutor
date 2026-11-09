import { useEffect, useState } from 'react';
import { ArrowLeft, Exit } from '@xipkg/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMediaQuery } from '@xipkg/utils';
import { useAuth } from 'common.auth';
import { ConfirmDialog } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { pickSettingsSearch, readSettingsReturn } from '../../model/settingsSections';
import { ProfileRoleSwitcher } from './ProfileRoleSwitcher';
import { SettingsNav } from './SettingsNav';

export const SettingsEntry = () => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  useEffect(() => {
    if (isMobile) return;

    void navigate({
      to: '/settings/$section',
      params: { section: 'personal' },
      search: pickSettingsSearch(search),
      replace: true,
    });
  }, [isMobile, navigate, search]);

  if (!isMobile) return null;

  return <SettingsMobileMenu />;
};

export const SettingsMobileMenu = () => {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const goBack = () => {
    const target = readSettingsReturn();
    void navigate({
      to: target.pathname,
      search: target.search,
    });
  };

  const handleLogout = async () => {
    await logout();
    await navigate({ to: '/signin', replace: true });
  };

  return (
    <div className="bg-background-page flex h-full min-h-0 flex-col px-4 py-4">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          aria-label={t('menu.back')}
          className="text-text-secondary hover:bg-background-subtle hover:text-text-primary flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
        >
          <ArrowLeft className="fill-icon-secondary size-6" />
        </button>
        <h1 className="text-text-primary min-w-0 flex-1 truncate text-2xl leading-8 font-medium">
          {t('settingsTitle')}
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <SettingsNav />
      </div>

      <div className="flex shrink-0 flex-col gap-3 pt-4">
        <ProfileRoleSwitcher />
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(true)}
          className="text-text-secondary hover:bg-status-error-background hover:text-text-danger group flex h-10 w-full items-center rounded-lg px-2 transition-colors"
          data-umami-event="profile-logout"
        >
          <Exit className="fill-icon-secondary group-hover:fill-icon-danger size-5 transition-colors" />
          <span className="pl-2 text-sm">{t('menu.logout')}</span>
        </button>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title={t('menu.logoutConfirmTitle')}
        description={t('menu.logoutConfirmDescription')}
        confirmLabel={t('menu.logoutConfirmAction')}
        cancelLabel={t('menu.logoutConfirmCancel')}
        onConfirm={handleLogout}
      />
    </div>
  );
};
