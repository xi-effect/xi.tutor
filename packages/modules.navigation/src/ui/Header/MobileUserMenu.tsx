import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@xipkg/drawer';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@xipkg/sidebar';
import { UserProfile } from '@xipkg/userprofile';

import { DrawerRoleSelector } from './DrawerRoleSelector';
import { Account, Exit } from '@xipkg/icons';

interface MobileUserMenuProps {
  userId: number;
  onOpenProfile: () => void;
  onLogout: () => void;
  profileText: string;
  logoutText: string;
}

export const MobileUserMenu = ({
  userId,
  onOpenProfile,
  onLogout,
  profileText,
  logoutText,
}: MobileUserMenuProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-umami-event="header-user-menu-open"
          data-umami-event-device="mobile"
        >
          <UserProfile id="userprofile" userId={userId} size="m" withOutText />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[calc(100dvh-64px)] w-full">
        <div className="dark:bg-gray-0 h-full p-4">
          <DrawerHeader>
            <DrawerTitle>Меню пользователя</DrawerTitle>
          </DrawerHeader>
          <div className="mt-4 flex flex-col gap-4">
            <DrawerRoleSelector />
            <div className="bg-gray-20 h-px" />
            <SidebarMenu>
              <SidebarMenuItem className="cursor-pointer">
                <SidebarMenuButton
                  onClick={onOpenProfile}
                  data-umami-event="header-profile-open"
                  data-umami-event-device="mobile"
                >
                  <Account className="h-6 w-6" />
                  <div className="text-base">{profileText}</div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="cursor-pointer">
                <SidebarMenuButton
                  onClick={onLogout}
                  data-umami-event="header-logout"
                  data-umami-event-device="mobile"
                >
                  <Exit className="h-6 w-6" />
                  <div className="text-base">{logoutText}</div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
