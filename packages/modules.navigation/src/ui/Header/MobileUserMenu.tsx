import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Drawer, DrawerTrigger } from '@xipkg/drawer';
import { UserProfile } from '@xipkg/userprofile';
import { useTranslation } from 'react-i18next';

import { DRAWER_CONTENT_ABOVE_BAR_CLASS } from '../constants';
import { NavigationDrawerContent } from '../NavigationDrawerContent';
import { DrawerRoleSelector } from './DrawerRoleSelector';
import { Close, Download, Exit, Settings } from '@xipkg/icons';
import { toast } from 'sonner';
import { useCurrentUser, usePWAInstall } from 'common.services';
import { cn } from '@xipkg/utils';

const menuRowClassName = cn(
  'border-border-default flex w-full items-center gap-3 rounded-xl border bg-background-surface px-4 h-[48px] text-left transition-colors',
);

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
  const { t } = useTranslation('navigation');
  const { data: user } = useCurrentUser();
  const { canInstall, promptInstall, isInstalled, installHint } = usePWAInstall();

  const displayName = user?.display_name?.trim() || user?.username || '';

  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="none"
          className="text-text-primary hover:bg-background-subtle focus:bg-background-subtle size-10 shrink-0 overflow-hidden rounded-xl p-0"
          data-umami-event="header-user-menu-open"
          data-umami-event-device="mobile"
        >
          <UserProfile id="userprofile" userId={userId} size="40" withOutText />
        </Button>
      </DrawerTrigger>
      <NavigationDrawerContent className={DRAWER_CONTENT_ABOVE_BAR_CLASS}>
        <div className="dark:bg-background-surface flex flex-col gap-5">
          <DrawerRoleSelector compact />

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              data-umami-event="header-logout"
              data-umami-event-device="mobile"
              className={cn(
                menuRowClassName,
                'border-border-error hover:bg-status-error-background',
              )}
            >
              <Exit className="fill-icon-danger size-6 shrink-0" />
              <span className="text-m-base text-text-danger font-medium">{logoutText}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenProfile();
              }}
              data-umami-event="header-profile-open"
              data-umami-event-device="mobile"
              className={menuRowClassName}
            >
              <Settings className="text-text-primary size-6 shrink-0" />
              <span className="text-m-base text-text-primary font-medium">{profileText}</span>
            </button>
            {!isInstalled && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (canInstall) void promptInstall();
                  else toast.info(installHint);
                }}
                data-umami-event="header-pwa-install"
                data-umami-event-device="mobile"
                className={menuRowClassName}
              >
                <Download className="text-text-primary size-6 shrink-0" />
                <span className="text-m-base text-text-primary font-medium">{t('installApp')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="size-10 shrink-0 overflow-hidden rounded-lg">
                <UserProfile id="userprofile-footer" userId={userId} size="40" withOutText />
              </div>
              <span className="text-m-base text-text-primary truncate font-medium">
                {displayName}
              </span>
            </div>
            <button
              type="button"
              aria-label={t('close')}
              onClick={() => setOpen(false)}
              className="bg-background-page hover:bg-background-subtle focus:bg-background-subtle flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
            >
              <Close className="fill-icon-primary size-5" />
            </button>
          </div>
        </div>
      </NavigationDrawerContent>
    </Drawer>
  );
};
