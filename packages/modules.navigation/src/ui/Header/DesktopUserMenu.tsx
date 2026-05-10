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
import { Account, ChevronUp, Download, Exit } from '@xipkg/icons';
import { usePWAInstall } from 'common.services';
import { useMenuStore } from '../../store/useMenuStore';

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
  const { isDesktopOpen } = useMenuStore();

  const { data: user } = useCurrentUser();
  const { canInstall, promptInstall, isInstalled, installHint } = usePWAInstall();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          className="group flex w-full justify-start rounded-lg hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
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
            classNameText="text-s-base pl-1 text-left"
            classNameLabel="text-xxs-base text-gray-60 pl-1 text-left"
          />
          <ChevronUp className="mr-3 ml-auto h-4 w-4 rotate-x-180 text-gray-50 group-data-[state=open]:rotate-x-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-[244px] flex-col gap-3 p-2"
        side="bottom"
        align={isDesktopOpen ? 'center' : 'start'}
      >
        <div className="h-9">
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
