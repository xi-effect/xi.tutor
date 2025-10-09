import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@xipkg/drawer';
import { UserProfile } from '@xipkg/userprofile';

import { DrawerRoleSelector } from './DrawerRoleSelector';

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
        <Button variant="ghost" size="icon">
          <UserProfile id="userprofile" userId={userId} size="m" withOutText />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Меню пользователя</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-2">
          <DrawerRoleSelector />
          <div className="bg-gray-20 flex h-[1px] flex-col gap-4" />
          <Button
            variant="secondary"
            onClick={onOpenProfile}
            className="text-gray-80 text-m-base justify-start"
          >
            {profileText}
          </Button>
          <Button
            variant="secondary"
            onClick={onLogout}
            className="text-gray-80 text-m-base justify-start"
          >
            {logoutText}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
