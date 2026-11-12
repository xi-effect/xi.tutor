import { lazy, Suspense, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@xipkg/sidebar';
import { ArrowLeft } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from 'common.services';
import { ConfirmDialog } from 'common.ui';
import { useAuth } from 'common.auth';
import { readSettingsReturn } from 'modules.profile/sections';
import { DesktopUserMenu } from './Header/DesktopUserMenu';
import { FirstStepsDock } from './FirstStepsDock';

const SettingsSidebarNav = lazy(() =>
  import('modules.profile').then((module) => ({ default: module.SettingsSidebarNav })),
);

export const SettingsSidebar = () => {
  const { t } = useTranslation('profile');
  const { t: tNav } = useTranslation('navigation');
  const navigate = useNavigate();
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
        <SidebarMenu className="pt-5">
          <SidebarMenuItem className="cursor-pointer">
            <SidebarMenuButton onClick={goBack} className="group gap-5 rounded-lg!">
              <ArrowLeft className="text-text-muted h-6 w-6" />
              <span className="text-s-base">{t('menu.back')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Suspense fallback={null}>
          <SettingsSidebarNav />
        </Suspense>
      </SidebarContent>
      <SidebarFooter className="bg-background-page gap-3 overflow-visible">
        <FirstStepsDock />
        {user?.id ? (
          <DesktopUserMenu
            withOutText={false}
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
