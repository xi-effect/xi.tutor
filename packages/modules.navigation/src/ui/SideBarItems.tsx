import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@xipkg/sidebar';
import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { SwiperRef } from 'swiper/react';
import { Group, Home, Materials, Payments, TelegramFilled, InfoCircle } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';
import { useCallStore } from 'modules.calls';

export const SideBarItems = ({ swiperRef }: { swiperRef?: React.RefObject<SwiperRef | null> }) => {
  const { t } = useTranslation('navigation');

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

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
            icon: Materials,
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

      if (swiperRef && swiperRef.current) {
        swiperRef.current?.swiper.slideTo(1);
      }
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

    if (swiperRef && swiperRef.current) {
      swiperRef.current?.swiper.slideTo(1);
    }
  };

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {topMenu.map((item) => (
                <SidebarMenuItem id={item.id} className="cursor-pointer" key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={getIsActiveItem(item.url)}>
                    <a onClick={() => handleClick(item.url)}>
                      <item.icon className="h-6 w-6" />
                      <span className="text-base">{t(item.titleKey)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footerMenu.map((item) => (
            <SidebarMenuItem key={item.titleKey} className="cursor-pointer">
              <SidebarMenuButton
                id={item.titleKey === 'hints' ? 'hints-button' : undefined}
                variant="ghost"
                onClick={item.onClick}
                type="button"
                className="bg-gray-0"
                title={t(item.titleKey)}
              >
                <item.icon className="h-6 w-6" />
                <div className="text-base font-medium text-gray-50">{t(item.titleKey)}</div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
};
