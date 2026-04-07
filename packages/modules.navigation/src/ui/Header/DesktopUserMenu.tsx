import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { UserProfile } from '@xipkg/userprofile';
import { toast } from 'sonner';

import { SelectRole } from './SelectRole';
import { usePWAInstall } from 'common.services';

interface DesktopUserMenuProps {
  userId: number;
  onOpenProfile: () => void;
  onLogout: () => void;
  profileText: string;
  logoutText: string;
}

export const DesktopUserMenu = ({
  userId,
  onOpenProfile,
  onLogout,
  profileText,
  logoutText,
}: DesktopUserMenuProps) => {
  const { canInstall, promptInstall, isInstalled, installHint } = usePWAInstall();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          className="hover:bg-transparent"
          size="icon"
          data-umami-event="header-user-menu-open"
        >
          <UserProfile id="userprofile" userId={userId} size="m" withOutText />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="end">
        <div className="px-2 py-1.5">
          <SelectRole />
        </div>

        {!isInstalled && (
          <DropdownMenuItem
            onClick={() => {
              if (canInstall) void promptInstall();
              else toast.info(installHint);
            }}
            className="text-gray-80 text-sm"
            data-umami-event="header-pwa-install"
          >
            Установить приложение
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onOpenProfile}
          className="text-gray-80 text-sm"
          data-umami-event="header-profile-open"
        >
          {profileText}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onLogout}
          className="text-gray-80 text-sm"
          data-umami-event="header-logout"
        >
          {logoutText}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
