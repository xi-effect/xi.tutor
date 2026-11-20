import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { ConfirmDialog, Logo, LinkTanstack } from 'common.ui';
import { useAuth } from 'common.auth';
import { useCurrentUser } from 'common.services';
import { useMenuStore } from '../store';
import { Notifications } from './Header/Notifications';
import { MobileUserMenu } from './Header/MobileUserMenu';
import { MOBILE_BOTTOM_BAR_HEIGHT } from './constants';
import { useState } from 'react';
import { Burger } from '@xipkg/icons';
import { useSettingsSearch } from './useSettingsSearch';

export { MOBILE_BOTTOM_BAR_HEIGHT };

export const MobileBottomBar = () => {
  const { data: user } = useCurrentUser();
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const settingsSearch = useSettingsSearch();
  const { logout } = useAuth();
  const { open: openMenu } = useMenuStore();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleOpenProfile = () => {
    void navigate({
      to: '/settings',
      search: settingsSearch,
    });
  };

  const handleLogout = async () => {
    await logout();
    await navigate({ to: '/signin', replace: true });
  };

  return (
    <>
      <nav className="bg-background-surface fixed right-0 bottom-0 left-0 z-30 flex h-[64px] items-center px-4">
        <div className="flex w-full items-center gap-0">
          <div className="flex shrink-0 items-center gap-1">
            {user?.id ? (
              <MobileUserMenu
                userId={user.id}
                onOpenProfile={handleOpenProfile}
                onLogout={() => setLogoutConfirmOpen(true)}
                profileText={t('profile')}
                logoutText={t('logout')}
              />
            ) : null}
            <Notifications />
          </div>

          <div className="flex min-w-0 flex-1 justify-end">
            <LinkTanstack
              to="/"
              className="focus-visible:ring-border-focus flex shrink-0 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              data-umami-event="navigation-mobile-logo"
            >
              <Logo width={96} height={28} />
            </LinkTanstack>
          </div>

          <div className="flex shrink-0 justify-end">
            <Button
              variant="none"
              size="icon"
              className="text-text-primary hover:bg-background-subtle focus:bg-background-subtle size-10 shrink-0 rounded-xl"
              onClick={() => openMenu()}
              aria-label={t('menu')}
              data-umami-event="navigation-mobile-menu"
            >
              <Burger className="size-6 fill-current" />
            </Button>
          </div>
        </div>
      </nav>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title={t('logoutConfirmTitle')}
        description={t('logoutConfirmDescription')}
        confirmLabel={t('logoutConfirmAction')}
        cancelLabel={t('logoutConfirmCancel')}
        onConfirm={handleLogout}
      />
    </>
  );
};
