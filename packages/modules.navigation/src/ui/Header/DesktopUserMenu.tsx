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
import { useCurrentUser } from 'common.services';
import { Account, Collapse, Download, Exit } from '@xipkg/icons';
import { usePWAInstall } from 'common.services';

interface DesktopUserMenuProps {
  withOutText: boolean;
  userId: number;
  onOpenProfile: () => void;
  onLogout: () => void;
  profileText: string;
  logoutText: string;
}

export const DesktopUserMenu = ({
  withOutText,
  userId,
  onOpenProfile,
  onLogout,
  profileText,
  logoutText,
}: DesktopUserMenuProps) => {
  const { data: user } = useCurrentUser();
  const { canInstall, promptInstall, isInstalled, installHint } = usePWAInstall();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          className="flex w-full justify-start rounded-md hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          size="icon"
          data-umami-event="header-user-menu-open"
        >
          <UserProfile
            text={user?.display_name ?? user?.username}
            label={user?.username ?? user?.username}
            id="userprofile"
            userId={userId}
            size="40"
            withOutText={withOutText}
            classNameText="text-left"
          />
          <Collapse className="mr-3.5 ml-auto h-4 w-4 text-gray-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[276px] p-4" side="bottom" align="start">
        <div className="mb-4 w-[228px]">
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
            <Download className="fill-gray-80 mr-2 h-5 w-5" />
            Установить приложение
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onSelect={onOpenProfile}
          className="text-gray-80 text-sm"
          data-umami-event="header-profile-open"
        >
          <Account className="fill-gray-80 mr-2 h-5 w-5" />
          {profileText}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={onLogout}
          className="text-gray-80 text-sm"
          data-umami-event="header-logout"
        >
          <Exit className="fill-gray-80 mr-2 h-5 w-5" />
          {logoutText}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
