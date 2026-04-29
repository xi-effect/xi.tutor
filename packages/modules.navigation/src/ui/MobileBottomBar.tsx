import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Logo } from 'common.ui';
import { LinkTanstack } from 'common.ui';
import { useAuth } from 'common.auth';
import { useCurrentUser } from 'common.services';
import { useMenuStore } from '../store';
import { Notifications } from './Header/Notifications';
import { MobileUserMenu } from './Header/MobileUserMenu';
import { MOBILE_BOTTOM_BAR_HEIGHT } from './constants';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Burger } from '@xipkg/icons';

const UserSettings = lazy(() =>
  import('modules.profile').then((module) => ({ default: module.UserSettings })),
);

export { MOBILE_BOTTOM_BAR_HEIGHT };

export const MobileBottomBar = () => {
  const { data: user } = useCurrentUser();
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });
  const { logout } = useAuth();
  const { open: openMenu } = useMenuStore();

  const [open, setOpen] = useState(false);

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
    navigate({ to: '/signin' });
  };

  return (
    <>
      <nav className="bg-gray-0 fixed right-0 bottom-0 left-0 z-30 flex h-[64px] items-center px-4">
        <div className="flex w-full items-center gap-1">
          <div className="flex shrink-0 items-center gap-1">
            <MobileUserMenu
              userId={user?.id ?? 0}
              onOpenProfile={handleOpenProfile}
              onLogout={handleLogout}
              profileText={t('profile')}
              logoutText={t('logout')}
            />
            <Notifications />
          </div>

          <div className="flex min-w-0 flex-1 justify-end">
            <LinkTanstack
              to="/"
              className="focus-visible:ring-brand-100 flex shrink-0 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              data-umami-event="navigation-mobile-logo"
            >
              <Logo width={138} height={40} />
            </LinkTanstack>
          </div>

          <div className="flex shrink-0 justify-end">
            <Button
              variant="none"
              size="icon"
              className="text-gray-80 hover:bg-gray-10 focus:bg-gray-10 size-10 shrink-0 rounded-xl"
              onClick={() => openMenu()}
              aria-label={t('menu')}
              data-umami-event="navigation-mobile-menu"
            >
              <Burger className="size-6 fill-current" />
            </Button>
          </div>
        </div>
      </nav>

      <Suspense fallback={null}>
        <UserSettings open={open} setOpen={setOpen} />
      </Suspense>
    </>
  );
};
