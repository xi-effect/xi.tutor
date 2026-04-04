import { Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@xipkg/drawer';
import { useTranslation } from 'react-i18next';
import { DRAWER_CONTENT_ABOVE_BAR_CLASS } from '../../constants';
import { cn } from '@xipkg/utils';

export const NotificationsMobileDrawer = ({
  isOpen,
  onOpenChange,
  onOpenSettings,
  notificationsList,
  badge,
  countLabel,
  hasUnread,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  notificationsList: React.ReactNode;
  badge: React.ReactNode;
  countLabel: string | number;
  hasUnread: boolean;
}) => {
  const { t } = useTranslation('navigation');

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="none"
          className={cn(
            'relative size-10 shrink-0 rounded-xl p-0 transition-colors',
            'bg-brand-5 text-brand-100 hover:bg-brand-10 focus-visible:bg-brand-10',
          )}
          aria-label={t('notifications')}
        >
          <Notification className="fill-brand-100 size-6" size="s" />
          {badge}
        </Button>
      </DrawerTrigger>

      <DrawerContent className={cn(DRAWER_CONTENT_ABOVE_BAR_CLASS, 'rounded-t-2xl')}>
        <div className="dark:bg-gray-0 flex h-full flex-col p-0.5">
          <DrawerHeader className="flex flex-row flex-wrap items-center gap-2 pt-3 pr-2 pb-4 pl-1">
            <DrawerTitle className="text-m-base font-semibold text-gray-100">
              {t('notifications')}
            </DrawerTitle>
            {hasUnread && (
              <div
                className="text-xs-base inline-flex h-6 min-h-6 w-fit min-w-6 items-center justify-center rounded-lg bg-(--xi-pink-20) px-2 leading-none font-medium text-(--xi-pink-60) tabular-nums"
                aria-hidden
              >
                {countLabel}
              </div>
            )}
            <div className="ml-auto flex items-center">
              <Button
                onClick={onOpenSettings}
                variant="none"
                className="text-gray-80 hover:bg-gray-10 size-10 rounded-lg p-1"
                aria-label={t('notificationSettings')}
              >
                <Settings className="size-6" size="s" />
              </Button>
            </div>
          </DrawerHeader>

          {notificationsList}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
