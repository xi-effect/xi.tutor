import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { UserProfile } from '@xipkg/userprofile';

import { SelectRole } from './SelectRole';
import { useCurrentUser } from 'common.services';
import { Collapse } from '@xipkg/icons';

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

      <DropdownMenuContent className="w-[268px]" side="bottom" align="start">
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
