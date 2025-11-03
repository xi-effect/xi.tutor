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
import { Group, Home, Materials, Payments, TelegramFilled } from '@xipkg/icons';
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
      titleKey: 'home',
      url: '/',
      icon: Home,
    },
    {
      titleKey: 'classrooms',
      url: '/classrooms',
      icon: Group,
    },
    ...(isTutor
      ? [
          {
            titleKey: 'materials',
            url: '/materials',
            icon: Materials,
          },
        ]
      : []),
    {
      titleKey: 'payments',
      url: '/payments',
      icon: Payments,
    },
  ];

  const footerMenu = [
    {
      titleKey: 'support',
      url: 'https://t.me/sovlium_support_bot',
      icon: TelegramFilled,
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
                <SidebarMenuItem className="cursor-pointer" key={item.titleKey}>
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
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton variant="ghost" asChild>
                <a className="hover:underline" href={item.url} target="_blank">
                  <item.icon />
                  <span>{t(item.titleKey)}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
};
