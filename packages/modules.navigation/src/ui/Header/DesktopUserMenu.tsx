import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';
import { toast } from 'sonner';

import { SelectRole } from './SelectRole';
import { useCurrentUser } from 'common.services';
import { ChevronUp, Download, Exit, Settings } from '@xipkg/icons';
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

const menuItemClassName = cn(
  'text-text-primary fill-icon-primary h-9 gap-2 rounded-lg px-2 text-sm font-medium',
  'hover:bg-background-page hover:text-text-primary hover:fill-icon-primary focus:bg-background-page focus:text-text-primary',
);

const logoutItemClassName = cn(
  menuItemClassName,
  'text-text-danger hover:bg-status-error-background hover:text-text-danger focus:bg-status-error-background focus:text-text-danger',
  '[&_svg]:fill-icon-danger hover:[&_svg]:fill-icon-danger focus:[&_svg]:fill-icon-danger',
);

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
            classNameText="pl-1 text-left text-text-primary"
            classNameLabel="pl-1 text-left text-text-secondary"
          />
          {!withOutText && (
            <ChevronUp className="fill-icon-secondary mr-3 ml-auto h-4 w-4 rotate-x-180 group-data-[state=open]:rotate-x-0" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-[240px] flex-col gap-2 p-2"
        side="bottom"
        sideOffset={8}
        align={isDesktopOpen ? 'center' : 'start'}
      >
        <SelectRole />

        <div className="flex flex-col gap-0.5">
          <DropdownMenuItem
            onSelect={onOpenProfile}
            className={menuItemClassName}
            data-umami-event="header-profile-open"
          >
            <Settings className="size-5 shrink-0" />
            {profileText}
          </DropdownMenuItem>

          {!isInstalled && (
            <DropdownMenuItem
              onClick={() => {
                if (canInstall) void promptInstall();
                else toast.info(installHint);
              }}
              className={menuItemClassName}
              data-umami-event="header-pwa-install"
            >
              <Download className="size-5 shrink-0" />
              Установить приложение
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="mx-0 my-1" />

          <DropdownMenuItem
            onSelect={onLogout}
            className={logoutItemClassName}
            data-umami-event="header-logout"
          >
            <Exit className="fill-icon-danger size-5 shrink-0" />
            {logoutText}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
