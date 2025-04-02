import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@xipkg/sidebar';
import { useMediaQuery } from '@xipkg/utils';
import { footerMenu, items } from './config';
import { CustomTrigger } from './components';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Navigation = () => {
  const { t } = useTranslation('navigation');
  const isMobile = useMediaQuery('(max-width: 960px)');

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getIsActiveItem = (url: string) => {
    if (url === '/') {
      if (pathname === url) return true;
      else return false;
    }

    return pathname.includes(url);
  };

  return (
    <SidebarProvider className="h-dvh flex-col md:w-[350px]">
      <CustomTrigger />
      <div className="relative h-full">
        <Sidebar className="absolute w-full" collapsible={isMobile ? 'offcanvas' : 'icon'}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem className="cursor-pointer" key={item.titleKey}>
                      <SidebarMenuButton asChild isActive={getIsActiveItem(item.url)}>
                        <a onClick={() => navigate({ to: item.url })}>
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
        </Sidebar>
      </div>
    </SidebarProvider>
  );
};
