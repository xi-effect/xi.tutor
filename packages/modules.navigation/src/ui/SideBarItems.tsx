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
import { Group, Home, Payments, TelegramFilled, InfoCircle, BookOpened } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';
import { useCallStore } from 'modules.calls';
import { useMenuStore } from '../store';
import { Notifications } from './Header/Notifications';
import { Logo, SmallLogo } from 'common.ui';
import { useMediaQuery } from '@xipkg/utils';
import { DesktopUserMenu } from './Header/DesktopUserMenu';
import { useEffect, useState } from 'react';
import { useAuth } from 'common.auth';

export const SideBarItems = () => {
  const { t } = useTranslation('navigation');
  const { close, isDesktopOpen } = useMenuStore();
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Определяем, закрыт ли сайдбар (для десктопа)
  const isCollapsed = !isMobile && !isDesktopOpen;

  const isStarted = useCallStore((state) => state.isStarted);
  const mode = useCallStore((state) => state.mode);
  const updateStore = useCallStore((state) => state.updateStore);

  const topMenu = [
    {
      id: 'home-menu-item',
      titleKey: 'home',
      url: '/',
      icon: Home,
    },
    {
      id: 'classrooms-menu-item',
      titleKey: 'classrooms',
      url: '/classrooms',
      icon: Group,
    },
    ...(isTutor
      ? [
          {
            id: 'materials-menu-item',
            titleKey: 'materials',
            url: '/materials',
            icon: BookOpened,
          },
        ]
      : []),
    {
      id: 'payments-menu-item',
      titleKey: 'payments',
      url: '/payments',
      icon: Payments,
    },
  ];

  const handleOnboardingClick = async () => {
    try {
      sessionStorage.removeItem('onboarding_menu_hidden');

      if (user?.onboarding_stage === 'completed') {
        sessionStorage.setItem('show_onboarding_for_completed', 'true');
        window.dispatchEvent(new Event('onboarding-show-requested'));
      }

      navigate({ to: '/' });
      close();
    } catch (error) {
      console.error('Ошибка при запуске обучения:', error);
    }
  };

  const footerMenu = [
    {
      titleKey: 'support',
      onClick: () => {
        window.open('https://t.me/sovlium_support_bot', '_blank');
      },
      icon: TelegramFilled,
    },
    {
      titleKey: 'hints',
      onClick: handleOnboardingClick,
      icon: InfoCircle,
    },
  ];

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });
  const { callId } = useParams({ strict: false });

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
    const filteredSearch = search.call ? { call: search.call } : {};

    if (isStarted && mode === 'full') {
      updateStore('mode', 'compact');
      navigate({
        to: url,
        search: () => ({
          ...filteredSearch,
          call: callId,
        }),
      });
    } else {
      navigate({
        to: url,
        search: () => ({
          ...filteredSearch,
        }),
      });
    }

    close();
  };

  const { logout } = useAuth();

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
    <>
      <SidebarContent>
        {/* Верхняя секция: профиль, бургер-меню, колокольчик */}
        <div className="flex flex-col gap-4 pt-4">
          {/* Профиль пользователя */}
          <SidebarTrigger className="dark:fill-gray-80 hover:bg-brand-0 focus:bg-transparent" />
          <div className="flex items-center gap-2">
            <DesktopUserMenu
              withOutText={isCollapsed}
              userId={user?.id || 0}
              onOpenProfile={handleOpenProfile}
              onLogout={handleLogout}
              profileText={t('profile')}
              logoutText={t('logout')}
            />
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
                    >
                      <item.icon className="h-6 w-6 text-gray-50" />
                      <span className="text-base">{t(item.titleKey)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-1">
        <SidebarMenu>
          <Notifications />
          {footerMenu.map((item) => (
            <SidebarMenuItem key={item.titleKey} className="cursor-pointer">
              <SidebarMenuButton
                id={item.titleKey === 'hints' ? 'hints-button' : undefined}
                variant="none"
                onClick={item.onClick}
                type="button"
                className="bg-gray-0"
                title={t(item.titleKey)}
                data-umami-event={`navigation-${item.titleKey}`}
                {...(item.titleKey === 'support'
                  ? { 'data-umami-event-url': 'https://t.me/sovlium_support_bot' }
                  : {})}
              >
                <item.icon className="h-6 w-6 fill-gray-50 text-gray-50" />
                <div className="text-base font-medium text-gray-50">{t(item.titleKey)}</div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {/* Логотип внизу — оба в DOM для плавного перехода без мигания */}
        <div className="relative flex h-10 min-h-10 w-full min-w-[135px] items-center justify-start">
          <div
            className="pointer-events-none absolute inset-y-0 flex items-center justify-center transition-opacity duration-400 ease-out"
            style={{ opacity: 1 }}
            aria-hidden={!isCollapsed}
          >
            <SmallLogo width={40} height={40} />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-start transition-opacity duration-400 ease-out"
            style={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 135 }}
            aria-hidden={isCollapsed}
          >
            <Logo width={135} height={40} />
          </div>
        </div>
      </SidebarFooter>
    </>
  );
};
