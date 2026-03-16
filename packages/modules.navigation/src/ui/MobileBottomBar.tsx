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
      <nav className="bg-gray-0 border-gray-10 fixed right-0 bottom-0 left-0 z-30 flex h-[64px] items-center border-t px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="flex w-full items-center gap-1">
          {/* Аватар — меню пользователя */}
          <div className="justify-start">
            <MobileUserMenu
              userId={user?.id ?? 0}
              onOpenProfile={handleOpenProfile}
              onLogout={handleLogout}
              profileText={t('profile')}
              logoutText={t('logout')}
            />
          </div>

          {/* Уведомления */}
          <div className="justify-center">
            <Notifications />
          </div>

          {/* Логотип — переход на главную (по центру панели) */}
          <div className="ml-auto flex w-[104px] justify-center">
            <LinkTanstack
              to="/"
              className="focus-visible:ring-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              data-umami-event="navigation-mobile-logo"
            >
              <Logo width={104} height={40} />
            </LinkTanstack>
          </div>

          {/* Гамбургер — открытие основного меню */}
          <div className="s">
            <Button
              variant="none"
              size="icon"
              className="text-gray-80 hover:bg-gray-10 focus:bg-gray-10 size-10 shrink-0 rounded-lg"
              onClick={() => openMenu()}
              aria-label={t('menu')}
              data-umami-event="navigation-mobile-menu"
            >
              <MenuIcon className="size-6 fill-current" />
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

/** Иконка гамбургер-меню (три горизонтальные линии) */
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
