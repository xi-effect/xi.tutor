import { useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { UserProfile } from '@xipkg/userprofile';
import { Portal as TooltipPortal } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
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
  'text-gray-80 fill-gray-80 h-9 gap-2 rounded-lg px-2 text-sm font-medium',
  'hover:bg-gray-5 hover:text-gray-100 hover:fill-gray-100 focus:bg-gray-5 focus:text-gray-100',
);

const logoutItemClassName = cn(
  menuItemClassName,
  'text-red-80 hover:bg-red-0 hover:text-red-100 focus:bg-red-0 focus:text-red-100',
  '[&_svg]:fill-red-80 hover:[&_svg]:fill-red-100 focus:[&_svg]:fill-red-100',
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  // После закрытия меню фокус возвращается на триггер — без этого тултип открывается сам
  const allowTooltipRef = useRef(true);

  const displayName = user?.display_name?.trim() || user?.username || '';
  const username = user?.username?.trim() || '';
  const showTooltip = !withOutText && Boolean(displayName || username);

  const triggerButton = (
    <Button
      variant="none"
      className="group flex w-full min-w-0 justify-start rounded-lg hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
      size="icon"
      data-umami-event="header-user-menu-open"
    >
      <UserProfile
        text={displayName || username}
        label={username}
        id="userprofile"
        userId={userId}
        size="40"
        withOutText={withOutText}
        className="min-w-0 flex-1 overflow-hidden"
        classNameText="block w-full pl-1 text-left text-gray-100"
        classNameLabel="block w-full pl-1 text-left text-gray-60"
      />
      {!withOutText && (
        <ChevronUp className="fill-gray-60 mr-1 ml-1 h-4 w-4 shrink-0 rotate-x-180 group-data-[state=open]:rotate-x-0" />
      )}
    </Button>
  );

  return (
    <DropdownMenu
      open={menuOpen}
      onOpenChange={(open) => {
        setMenuOpen(open);
        setTooltipOpen(false);
        if (open) allowTooltipRef.current = false;
      }}
    >
      {showTooltip ? (
        <TooltipProvider delayDuration={400}>
          <Tooltip
            open={tooltipOpen}
            onOpenChange={(open) => {
              if (open && !allowTooltipRef.current) return;
              setTooltipOpen(open);
            }}
          >
            <TooltipTrigger
              asChild
              onPointerEnter={() => {
                allowTooltipRef.current = true;
              }}
            >
              <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                className="z-[100] max-w-[240px] font-normal"
              >
                <div className="flex flex-col gap-0.5">
                  {displayName ? (
                    <span className="font-medium wrap-break-word">{displayName}</span>
                  ) : null}
                  {username ? <span className="text-gray-40 break-all">{username}</span> : null}
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      )}

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
            <Exit className="fill-red-80 size-5 shrink-0" />
            {logoutText}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
