import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { UserProfile } from '@xipkg/userprofile';

import { SelectRole } from './SelectRole';

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
        <DropdownMenuItem>
          <SelectRole />
        </DropdownMenuItem>

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
