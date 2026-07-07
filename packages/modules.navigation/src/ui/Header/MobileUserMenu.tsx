import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Drawer, DrawerTrigger } from '@xipkg/drawer';
import { UserProfile } from '@xipkg/userprofile';
import { useTranslation } from 'react-i18next';

import { DRAWER_CONTENT_ABOVE_BAR_CLASS } from '../constants';
import { NavigationDrawerContent } from '../NavigationDrawerContent';
import { DrawerRoleSelector } from './DrawerRoleSelector';
import { Account, Exit, Download, Close } from '@xipkg/icons';
import { toast } from 'sonner';
import { useCurrentUser, usePWAInstall } from 'common.services';
import { cn } from '@xipkg/utils';

const menuRowClassName = cn(
  'border-gray-10 flex w-full items-center gap-3 rounded-xl border bg-gray-0 px-4 h-[48px] text-left transition-colors',
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
          className="text-gray-80 hover:bg-gray-10 focus:bg-gray-10 size-10 shrink-0 overflow-hidden rounded-xl p-0"
          data-umami-event="header-user-menu-open"
          data-umami-event-device="mobile"
        >
          <UserProfile id="userprofile" userId={userId} size="40" withOutText />
        </Button>
      </DrawerTrigger>
      <NavigationDrawerContent className={DRAWER_CONTENT_ABOVE_BAR_CLASS}>
        <div className="dark:bg-gray-0 flex flex-col gap-5">
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
              className={cn(menuRowClassName, 'border-red-20 hover:bg-red-0')}
            >
              <Exit className="fill-red-80 size-6 shrink-0" />
              <span className="text-m-base text-red-80 font-medium">{logoutText}</span>
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
              <Account className="size-6 shrink-0 text-gray-100" />
              <span className="text-m-base font-medium text-gray-100">{profileText}</span>
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
                <Download className="size-6 shrink-0 text-gray-100" />
                <span className="text-m-base font-medium text-gray-100">{t('installApp')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="size-10 shrink-0 overflow-hidden rounded-lg">
                <UserProfile id="userprofile-footer" userId={userId} size="40" withOutText />
              </div>
              <span className="text-m-base truncate font-medium text-gray-100">{displayName}</span>
            </div>
            <button
              type="button"
              aria-label={t('close')}
              onClick={() => setOpen(false)}
              className="bg-gray-5 hover:bg-gray-10 focus:bg-gray-10 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
            >
              <Close className="fill-gray-80 size-5" />
            </button>
          </div>
        </div>
      </NavigationDrawerContent>
    </Drawer>
  );
};
