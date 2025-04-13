import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@xipkg/sidebar';
import { footerMenu, items } from '../config';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { SwiperRef } from 'swiper/react';

export const SideBarItems = ({ swiperRef }: { swiperRef?: React.RefObject<SwiperRef | null> }) => {
  const { t } = useTranslation('navigation');

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getIsActiveItem = (url: string) => {
    if (url === '/') {
      if (pathname === url) return true;
      else return false;
    }

    return pathname.includes(url);
  };

  const handleClick = (url: string) => {
    navigate({ to: url });

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
              {items.map((item) => (
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
                <a className="hover:underline" href={item.url}>
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
