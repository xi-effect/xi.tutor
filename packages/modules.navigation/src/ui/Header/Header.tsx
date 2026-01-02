import { useState, useEffect, lazy } from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { SidebarTrigger } from '@xipkg/sidebar';
import { useMediaQuery } from '@xipkg/utils';

import { Logo } from 'common.ui';
import { useAuth } from 'common.auth';

import { Notifications } from './Notifications';
import { MobileUserMenu } from './MobileUserMenu';
import { DesktopUserMenu } from './DesktopUserMenu';
import { useCurrentUser } from 'common.services';
import { LinkTanstack } from 'common.ui';

const UserSettings = lazy(() =>
  import('modules.profile').then((module) => ({ default: module.UserSettings })),
);

export const Header = () => {
  const { data: user } = useCurrentUser();

  const isMobile = useMediaQuery('(max-width: 960px)');
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const search = useSearch({ strict: false });

  const [open, setOpen] = useState(false);

  // Синхронизируем состояние модалки с URL
  useEffect(() => {
    const profileParam = search.profile;

    const hasProfileParam = !!profileParam;
    if (hasProfileParam !== open) {
      setOpen(hasProfileParam);
    }
  }, [search.profile, open]);

  const handleOpenProfile = () => {
    navigate({
      to: pathname,
      search: { profile: 'personalInfo' },
    });
    setOpen(true);
  };

  const handleLogout = () => {
    logout();
    // TODO: переделать, сделать редирект только по 200
    navigate({ to: '/signin' });
  };

  return (
    <div className="bg-gray-0 fixed top-0 right-0 left-0 z-20 flex h-[64px] w-full items-center gap-4 px-4 py-3">
      <SidebarTrigger className="dark:fill-gray-80 hover:bg-brand-0 focus:bg-transparent" />
      <div className="flex flex-row items-center gap-4 md:pl-4">
        <LinkTanstack to="/">
          <Logo />
        </LinkTanstack>
      </div>
      <div className="ml-auto flex flex-row items-center gap-4">
        <Notifications />
        {isMobile ? (
          <MobileUserMenu
            userId={user?.id || 0}
            onOpenProfile={handleOpenProfile}
            onLogout={handleLogout}
            profileText={t('profile')}
            logoutText={t('logout')}
          />
        ) : (
          <DesktopUserMenu
            userId={user?.id || 0}
            onOpenProfile={handleOpenProfile}
            onLogout={handleLogout}
            profileText={t('profile')}
            logoutText={t('logout')}
          />
        )}
      </div>

      <UserSettings open={open} setOpen={setOpen} />
    </div>
  );
};
