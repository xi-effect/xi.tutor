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
import { useTranslation } from 'react-i18next';
import {
  cardMenuDeleteItemClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
} from 'common.ui';

import { UserPlanBadge } from './UserPlanBadge';
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

export const DesktopUserMenu = ({
  withOutText,
  userId,
  onOpenProfile,
  onLogout,
  profileText,
  logoutText,
}: DesktopUserMenuProps) => {
  const { t } = useTranslation('navigation');
  const { isDesktopOpen } = useMenuStore();

  const { data: user } = useCurrentUser();
  const { canInstall, promptInstall, isInstalled, installHintKey } = usePWAInstall();

  const [menuOpen, setMenuOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const allowTooltipRef = useRef(true);

  const displayName = user?.display_name?.trim() || user?.username || '';
  const username = user?.username?.trim() || '';
  const showTooltip = !withOutText && Boolean(displayName || username);

  const triggerButton = (
    <Button
      variant="none"
      size="s"
      className={cn(
        'group flex h-10 w-full min-w-0 items-center justify-start overflow-visible rounded-lg !p-0',
        'hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
      )}
      data-umami-event="header-user-menu-open"
    >
      <UserProfile
        text={displayName || username}
        label={username}
        id="userprofile"
        userId={userId}
        size="40"
        withOutText={withOutText}
        className={cn(
          'min-w-0 overflow-visible',
          withOutText ? 'w-10 shrink-0' : 'flex-1 overflow-hidden',
        )}
        classNameText="block w-full pl-1 text-left text-text-primary"
        classNameLabel="block w-full pl-1 text-left text-text-secondary"
      />
      {!withOutText && (
        <ChevronUp className="fill-icon-secondary mr-1 ml-1 h-4 w-4 shrink-0 rotate-x-180 group-data-[state=open]:rotate-x-0" />
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
                  {username ? (
                    <span className="text-text-secondary break-all">{username}</span>
                  ) : null}
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        className={cn(cardMenuSurfaceClass, 'z-100 flex w-[240px] flex-col gap-2 p-2')}
        side="bottom"
        sideOffset={8}
        align={isDesktopOpen ? 'center' : 'start'}
      >
        <div className="flex items-center justify-between gap-2 px-2 pt-2">
          <span className="text-text-secondary text-xs leading-4 font-medium">
            {t('plan.label')}
          </span>
          <UserPlanBadge />
        </div>

        <div className="flex flex-col">
          <DropdownMenuItem
            onSelect={onOpenProfile}
            className={cn(cardMenuItemClass, 'px-2 whitespace-nowrap')}
            data-umami-event="header-profile-open"
          >
            <Settings />
            <span>{profileText}</span>
          </DropdownMenuItem>

          {!isInstalled && (
            <DropdownMenuItem
              onClick={() => {
                if (canInstall) void promptInstall();
                else toast.info(t(`installHints.${installHintKey}`));
              }}
              className={cn(cardMenuItemClass, 'px-2 whitespace-nowrap')}
              data-umami-event="header-pwa-install"
            >
              <Download />
              <span>{t('installApp')}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className={cardMenuSeparatorClass} />

          <DropdownMenuItem
            onSelect={onLogout}
            className={cn(cardMenuDeleteItemClass, 'px-2 whitespace-nowrap')}
            data-umami-event="header-logout"
          >
            <Exit />
            <span>{logoutText}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
