import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@xipkg/drawer';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@xipkg/sidebar';
import { UserProfile } from '@xipkg/userprofile';

import { DRAWER_CONTENT_ABOVE_BAR_CLASS } from '../constants';
import { DrawerRoleSelector } from './DrawerRoleSelector';
import { Account, Exit, Download } from '@xipkg/icons';
import { toast } from 'sonner';
import { usePWAInstall } from 'common.services';

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
  const { canInstall, promptInstall, isInstalled, installHint } = usePWAInstall();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="none"
          size="icon"
          data-umami-event="header-user-menu-open"
          data-umami-event-device="mobile"
        >
          <UserProfile id="userprofile" userId={userId} size="m" withOutText />
        </Button>
      </DrawerTrigger>
      <DrawerContent className={DRAWER_CONTENT_ABOVE_BAR_CLASS}>
        <div className="dark:bg-gray-0 h-full p-4">
          <DrawerHeader>
            <DrawerTitle>Меню пользователя</DrawerTitle>
          </DrawerHeader>
          <div className="mt-4 flex flex-col gap-4">
            <DrawerRoleSelector />
            <div className="bg-gray-20 h-px" />
            <SidebarMenu>
              {!isInstalled && (
                <SidebarMenuItem className="cursor-pointer">
                  <SidebarMenuButton
                    onClick={() => {
                      if (canInstall) void promptInstall();
                      else toast.info(installHint);
                    }}
                    data-umami-event="header-pwa-install"
                    data-umami-event-device="mobile"
                  >
                    <Download className="h-6 w-6" />
                    <div className="text-base">Установить приложение</div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
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
