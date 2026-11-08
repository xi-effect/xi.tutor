import { useState } from 'react';
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@xipkg/sidebar';
import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LayoutLeft } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';
import { useCallStore } from 'modules.calls';
import { useMenuStore } from '../store';
import { Notifications } from './Header/Notifications';
import { ConfirmDialog, Logo } from 'common.ui';
import { cn, useMediaQuery } from '@xipkg/utils';
import { DesktopUserMenu } from './Header/DesktopUserMenu';
import { useAuth } from 'common.auth';
import { pickSettingsSearch } from 'modules.profile/sections';
import { getTopMenuConfig } from './config/sidebarMenuConfig';
import { MaintenanceNotice } from './MaintenanceNotice';
import { SubscriptionExpiryNotice } from './SubscriptionExpiryNotice';

export const SideBarItems = () => {
  const { t } = useTranslation('navigation');
  const { close, isDesktopOpen } = useMenuStore();
  const isMobile = useMediaQuery('(max-width: 960px)');

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });
  const { callId } = useParams({ strict: false });

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Определяем, закрыт ли сайдбар (для десктопа)
  const isCollapsed = !isMobile && !isDesktopOpen;

  const isStarted = useCallStore((state) => state.isStarted);
  const mode = useCallStore((state) => state.mode);

  const topMenu = getTopMenuConfig(Boolean(isTutor));

  const getIsActiveItem = (url: string) => {
    if (url === '/') {
      if (pathname === url) return true;
      else return false;
    }

    if (pathname.includes('board')) {
      if (url === '/materials') return true;
      else return false;
    }

    if (pathname.includes('call')) {
      if (url === '/classrooms') return true;
      else return false;
    }

    return pathname.includes(url);
  };

  const handleClick = (url: string) => {
    // Сохраняем только параметр call при переходе
    const filteredSearch = isStarted && search.call ? { call: search.call } : {};
    const materialsTabSearch = url === '/materials' ? { tab: 'boards' } : {};

    if (isStarted && mode === 'full') {
      // Только навигация; mode в compact выставит лейаут при смене pathname (см. _layout.tsx),
      // иначе эффект в Call.tsx видит «страница звонка + compact» и сбрасывает в full
      navigate({
        to: url,
        search: () => ({
          ...filteredSearch,
          ...materialsTabSearch,
          call: callId,
        }),
      });
    } else {
      navigate({
        to: url,
        search: () => ({
          ...filteredSearch,
          ...materialsTabSearch,
        }),
      });
    }

    close();
  };

  const { logout } = useAuth();

  const handleOpenProfile = () => {
    const callFromRoute =
      isStarted && mode === 'full' && typeof callId === 'string' ? callId : undefined;

    void navigate({
      to: '/settings/$section',
      params: { section: 'personal' },
      search: pickSettingsSearch(search, callFromRoute),
    });
    close();
  };

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    await navigate({ to: '/signin', replace: true });
  };

  return (
    <>
      <SidebarContent className="bg-background-page overflow-visible group-data-[collapsible=icon]:overflow-visible">
        {/* Верхняя секция: триггер и логотип. Аккаунт — внизу сайдбара. */}
        <div className="flex flex-col gap-4 pt-5">
          <div className="relative flex h-10 w-full items-center">
            <div
              className={cn(
                'group/mark relative h-10 shrink-0 overflow-hidden transition-[width] duration-200 ease-linear',
                isCollapsed && 'group-hover/mark:bg-background-subtle rounded-lg',
              )}
              style={{ width: isCollapsed ? 40 : 135 }}
            >
              <div
                className={cn(
                  'flex h-10 w-[135px] items-center transition-opacity duration-150',
                  isCollapsed && 'group-focus-within/mark:opacity-0 group-hover/mark:opacity-0',
                )}
              >
                <Logo width={135} height={40} />
              </div>
              {isCollapsed ? (
                <SidebarTrigger
                  id="sidebar-toggle"
                  className="focus-visible:bg-background-subtle absolute inset-0 rounded-lg bg-transparent"
                >
                  <LayoutLeft className="text-text-secondary h-5 w-5 opacity-0 transition-opacity duration-150 group-focus-within/mark:opacity-100 group-hover/mark:opacity-100" />
                </SidebarTrigger>
              ) : null}
            </div>
            <SidebarTrigger
              id={isCollapsed ? undefined : 'sidebar-toggle'}
              tabIndex={isCollapsed ? -1 : 0}
              aria-hidden={isCollapsed}
              className={cn(
                'group hover:bg-background-page focus:bg-background-subtle active:bg-background-subtle -mr-2 ml-auto h-10 min-h-10 w-10 min-w-10 shrink-0 rounded-lg transition-opacity duration-200',
                isCollapsed && 'pointer-events-none absolute opacity-0',
              )}
            >
              <LayoutLeft className="text-text-secondary group-hover:text-text-primary group-focus:text-text-primary group-active:text-text-primary h-5 w-5" />
            </SidebarTrigger>
          </div>
        </div>
        {/* Основное меню */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {topMenu.map((item) => (
                <SidebarMenuItem id={item.id} className="cursor-pointer" key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={getIsActiveItem(item.url)}>
                    <a
                      onClick={() => handleClick(item.url)}
                      data-umami-event={`navigation-${item.titleKey}`}
                      data-umami-event-url={item.url}
                      className="group gap-5 rounded-lg!"
                    >
                      <item.icon className="text-text-muted h-6 w-6" />
                      <span className="text-s-base group-data-[active=true]:font-medium">
                        {t(item.titleKey)}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Notifications />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-background-page gap-2">
        <SubscriptionExpiryNotice />
        <MaintenanceNotice />
        {user?.id ? (
          <div className="mt-1 overflow-visible pt-2">
            <DesktopUserMenu
              withOutText={isCollapsed}
              userId={user.id}
              onOpenProfile={handleOpenProfile}
              onLogout={() => setLogoutConfirmOpen(true)}
              profileText={t('profile')}
              logoutText={t('logout')}
            />
          </div>
        ) : null}
      </SidebarFooter>

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
