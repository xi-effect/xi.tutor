import { lazy, Suspense, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SidebarContent, SidebarFooter, SidebarTrigger } from '@xipkg/sidebar';
import { ArrowLeft, LayoutLeft } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from 'common.services';
import { ConfirmDialog } from 'common.ui';
import { useAuth } from 'common.auth';
import { readSettingsReturn } from 'modules.profile/sections';
import { DesktopUserMenu } from './Header/DesktopUserMenu';
import { useMenuStore } from '../store';

const SettingsSidebarNav = lazy(() =>
  import('modules.profile').then((module) => ({ default: module.SettingsSidebarNav })),
);

export const SettingsSidebar = () => {
  const { t } = useTranslation('profile');
  const { t: tNav } = useTranslation('navigation');
  const navigate = useNavigate();
  const { isDesktopOpen } = useMenuStore();
  const isCollapsed = !isDesktopOpen;
  const { data: user } = useCurrentUser();
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
    <>
      <SidebarContent className="bg-background-page overflow-hidden">
        <div className="flex w-full shrink-0 flex-col gap-1 pt-5">
          <div className="flex w-full items-center">
            {!isCollapsed ? (
              <button
                type="button"
                onClick={goBack}
                className="text-text-secondary hover:bg-background-subtle hover:text-text-primary flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 text-left"
              >
                <ArrowLeft className="fill-icon-secondary size-5 shrink-0" />
                <span className="truncate text-sm">{t('menu.back')}</span>
              </button>
            ) : null}
            <SidebarTrigger
              className={`group hover:bg-background-page focus:bg-background-subtle active:bg-background-subtle ml-auto h-10 min-h-10 w-10 min-w-10 shrink-0 rounded-lg ${
                isCollapsed ? '' : '-mr-2'
              }`}
            >
              <LayoutLeft className="text-text-secondary group-hover:text-text-primary group-focus:text-text-primary group-active:text-text-primary h-5 w-5" />
            </SidebarTrigger>
          </div>
          {isCollapsed ? (
            <button
              type="button"
              onClick={goBack}
              aria-label={t('menu.back')}
              className="hover:bg-background-subtle flex size-10 shrink-0 items-center justify-center rounded-lg"
            >
              <ArrowLeft className="fill-icon-secondary size-5" />
            </button>
          ) : null}
        </div>
        <Suspense fallback={null}>
          <SettingsSidebarNav />
        </Suspense>
      </SidebarContent>
      <SidebarFooter className="bg-background-page gap-3 overflow-visible">
        {user?.id ? (
          <DesktopUserMenu
            withOutText={isCollapsed}
            userId={user.id}
            showPlanOnTrigger
            onLogout={() => setLogoutConfirmOpen(true)}
            profileText={tNav('profile')}
            logoutText={tNav('logout')}
          />
        ) : null}
      </SidebarFooter>
      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title={tNav('logoutConfirmTitle')}
        description={tNav('logoutConfirmDescription')}
        confirmLabel={tNav('logoutConfirmAction')}
        cancelLabel={tNav('logoutConfirmCancel')}
        onConfirm={handleLogout}
      />
    </>
  );
};
