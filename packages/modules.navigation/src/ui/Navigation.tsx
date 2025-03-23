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
import { useNavigate } from '@tanstack/react-router';

export const Navigation = () => {
  const isMobile = useMediaQuery('(max-width: 960px)');

  const navigate = useNavigate();

  return (
    <SidebarProvider className="h-dvh w-full flex-col md:w-[350px]">
      <CustomTrigger />
      <div className="relative h-full">
        <Sidebar className="absolute w-full" collapsible={isMobile ? 'offcanvas' : 'icon'}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.title === 'Главная'}>
                        <a onClick={() => navigate({ to: item.url })}>
                          <item.icon className="h-6 w-6" />
                          <span className="text-base">{item.title}</span>
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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton variant="ghost" asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
