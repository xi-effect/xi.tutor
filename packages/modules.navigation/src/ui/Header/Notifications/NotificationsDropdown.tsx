import { useTranslation } from 'react-i18next';
import { Check, Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@xipkg/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { NotificationBadge } from './NotificationBadge';
import { useNotificationsContext } from 'common.services';

export const NotificationsDropdown = ({
  isOpen,
  onOpenChange,
  onOpenSettings,
  notificationsList,
  hasUnread,
  countLabel,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  notificationsList: React.ReactNode;
  hasUnread: boolean;
  countLabel: string;
}) => {
  const { t } = useTranslation('navigation');
  const { state } = useSidebar();
  const showCountPill = hasUnread && state === 'expanded';

  const { markAllAsRead } = useNotificationsContext();

  const handleMarkAsReadAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await markAllAsRead();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton className="relative flex h-10 w-full items-center gap-5 rounded-lg p-2 focus-visible:ring-0 focus-visible:ring-offset-0">
            <span className="relative inline-flex size-6 shrink-0 items-center justify-center">
              <Notification className="text-text-muted h-6 w-6" />
              {hasUnread && (
                <span
                  className="bg-tag-pink-background absolute -top-0.5 -right-0.5 flex h-[10px] w-[10px] items-center justify-center rounded-full"
                  aria-hidden
                >
                  <span className="bg-tag-pink-accent size-[6px] shrink-0 rounded-full" />
                </span>
              )}
            </span>
            <span className="text-s-base min-w-0 flex-1 truncate text-left">
              {t('notifications')}
            </span>
            {showCountPill && <NotificationBadge count={countLabel} variant="sidebar" />}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        alignOffset={0}
        sideOffset={8}
        collisionPadding={16}
        className="flex max-h-[var(--radix-dropdown-menu-content-available-height)] w-[268px] flex-col gap-1 rounded-[20px] border-2 px-1 py-1"
      >
        <DropdownMenuLabel className="text-s-base text-text-primary flex h-[48px] items-center p-3 font-semibold">
          {t('notifications')}
          <div className="ml-auto flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleMarkAsReadAll}
                    variant="none"
                    className="h-[32px] w-[32px] p-1"
                  >
                    <Check className="fill-icon-primary size-6" size="s" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{t('markAllAsRead')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button onClick={onOpenSettings} variant="none" className="h-[32px] w-[32px] p-1">
              <Settings className="fill-icon-primary size-6" size="s" />
            </Button>
          </div>
        </DropdownMenuLabel>
        {notificationsList}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
