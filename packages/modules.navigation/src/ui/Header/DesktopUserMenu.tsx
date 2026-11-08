import { useEffect, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { UserProfile } from '@xipkg/userprofile';
import { Portal as TooltipPortal } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  cardMenuDeleteItemClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
  useSupportModalStore,
} from 'common.ui';

import { UserPlanBadge } from './UserPlanBadge';
import {
  FIRST_STEPS_CLOSE_USER_MENU_EVENT,
  FIRST_STEPS_OPEN_USER_MENU_EVENT,
  useCurrentUser,
} from 'common.services';
import {
  Download,
  Exit,
  HelpCircle,
  InfoCircle,
  MenuDots,
  MessageHeartCircle,
  Settings,
} from '@xipkg/icons';
import { usePWAInstall } from 'common.services';

interface DesktopUserMenuProps {
  withOutText: boolean;
  userId: number;
  onOpenProfile?: () => void;
  onLogout: () => void;
  profileText: string;
  logoutText: string;
  showPlanOnTrigger?: boolean;
}

export const DesktopUserMenu = ({
  withOutText,
  userId,
  onOpenProfile,
  onLogout,
  profileText,
  logoutText,
  showPlanOnTrigger = false,
}: DesktopUserMenuProps) => {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const openSupportModal = useSupportModalStore((state) => state.open);
  const { canInstall, promptInstall, isInstalled, installHintKey } = usePWAInstall();

  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const tourLockRef = useRef(false);
  const supportLockRef = useRef(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const allowTooltipRef = useRef(true);

  const displayName = user?.display_name?.trim() || user?.username || '';
  const username = user?.username?.trim() || '';
  const showTooltip = !withOutText && Boolean(displayName || username);

  const openHints = async () => {
    try {
      sessionStorage.removeItem('onboarding_menu_hidden');

      if (user?.onboarding_stage === 'completed') {
        sessionStorage.setItem('show_onboarding_for_completed', 'true');
        window.dispatchEvent(new Event('onboarding-show-requested'));
      }

      await navigate({ to: '/' });
    } catch (error) {
      console.error('Ошибка при запуске обучения:', error);
    }
  };

  useEffect(() => {
    const openMenu = (event: Event) => {
      const support = (event as CustomEvent<{ support?: boolean }>).detail?.support === true;
      tourLockRef.current = true;
      supportLockRef.current = support;
      setMenuOpen(true);
      setSupportOpen(support);
    };
    const closeMenu = () => {
      tourLockRef.current = false;
      supportLockRef.current = false;
      setSupportOpen(false);
      setMenuOpen(false);
    };

    window.addEventListener(FIRST_STEPS_OPEN_USER_MENU_EVENT, openMenu);
    window.addEventListener(FIRST_STEPS_CLOSE_USER_MENU_EVENT, closeMenu);
    return () => {
      window.removeEventListener(FIRST_STEPS_OPEN_USER_MENU_EVENT, openMenu);
      window.removeEventListener(FIRST_STEPS_CLOSE_USER_MENU_EVENT, closeMenu);
    };
  }, []);

  const triggerButton = (
    <Button
      variant="none"
      size="s"
      className={cn(
        'group flex h-10 w-full min-w-0 items-center justify-start overflow-visible rounded-lg !p-0',
        'hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
      )}
      id="hints-button"
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
      {!withOutText && showPlanOnTrigger ? <UserPlanBadge className="shrink-0" /> : null}
      {!withOutText ? <MenuDots className="fill-icon-secondary mr-1 ml-1 size-4 shrink-0" /> : null}
    </Button>
  );

  return (
    <DropdownMenu
      modal={false}
      open={menuOpen}
      onOpenChange={(open) => {
        if (!open && tourLockRef.current) return;
        setMenuOpen(open);
        if (!open) setSupportOpen(false);
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
                  {username ? <span className="break-all opacity-70">{username}</span> : null}
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        data-first-step="user-menu"
        className={cn(cardMenuSurfaceClass, 'z-100 w-[240px] overflow-visible p-2')}
        side="top"
        sideOffset={8}
        align="start"
        onInteractOutside={(event) => {
          if (tourLockRef.current) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (tourLockRef.current) event.preventDefault();
        }}
      >
        <div className="mb-2 flex w-full items-center justify-between gap-3 px-2 pt-2 pb-1">
          <span className="text-text-secondary shrink-0 text-xs leading-4 font-medium">
            {t('plan.label')}
          </span>
          <UserPlanBadge className="shrink-0" />
        </div>

        <div className="flex flex-col">
          {onOpenProfile ? (
            <DropdownMenuItem
              onSelect={onOpenProfile}
              className={cn(cardMenuItemClass, 'px-2 whitespace-nowrap')}
              data-first-step="settings-item"
              data-umami-event="header-profile-open"
            >
              <Settings />
              <span>{profileText}</span>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSub
            open={supportOpen}
            onOpenChange={(open) => {
              if (!open && supportLockRef.current) return;
              setSupportOpen(open);
            }}
          >
            <DropdownMenuSubTrigger
              className={cn(
                cardMenuItemClass,
                'relative w-full !pr-8 !pl-2',
                'data-[state=open]:bg-status-info-background data-[state=open]:text-text-link data-[state=open]:font-medium',
                '[&>svg:last-child]:pointer-events-none [&>svg:last-child]:absolute [&>svg:last-child]:top-1/2 [&>svg:last-child]:right-2 [&>svg:last-child]:!m-0 [&>svg:last-child]:size-4 [&>svg:last-child]:-translate-y-1/2',
                '[&>svg:last-child]:!fill-none [&>svg:last-child]:stroke-current',
              )}
              data-umami-event="navigation-support-menu"
            >
              <MessageHeartCircle />
              <span>{t('help')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className={cn(cardMenuSurfaceClass, 'z-100 flex min-w-[220px] flex-col gap-1 p-2')}
              sideOffset={8}
            >
              <DropdownMenuItem
                className={cn(cardMenuItemClass, 'px-2 whitespace-nowrap')}
                data-first-step="support-item"
                data-umami-event="navigation-support"
                onSelect={() => {
                  window.setTimeout(() => openSupportModal(), 0);
                }}
              >
                <MessageHeartCircle />
                <span>{t('support')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(cardMenuItemClass, 'px-2 whitespace-nowrap')}
                data-umami-event="navigation-wiki"
                onSelect={() => {
                  window.open('https://support.sovlium.ru', '_blank');
                }}
              >
                <HelpCircle />
                <span>{t('wiki')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(cardMenuItemClass, 'px-2 whitespace-nowrap')}
                data-umami-event="navigation-hints"
                onSelect={() => {
                  void openHints();
                }}
              >
                <InfoCircle />
                <span>{t('hints')}</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

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
