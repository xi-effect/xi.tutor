import { Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@xipkg/sidebar';

import { NotificationBadge } from './NotificationBadge';

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
  const { state } = useSidebar();
  const showCountPill = hasUnread && state === 'expanded';

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton className="relative flex h-10 w-full items-center gap-5 rounded-lg p-2 focus-visible:ring-0 focus-visible:ring-offset-0">
            <span className="relative inline-flex size-6 shrink-0 items-center justify-center">
              <Notification className="fill-gray-80 size-6" size="s" />
              {hasUnread && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[var(--xi-pink-20)]"
                  aria-hidden
                >
                  <span className="size-[6px] shrink-0 rounded-full bg-[var(--xi-pink-60)]" />
                </span>
              )}
            </span>
            <span className="text-s-base min-w-0 flex-1 truncate text-left">Уведомления</span>
            {showCountPill && <NotificationBadge count={countLabel} variant="sidebar" />}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        alignOffset={0}
        sideOffset={8}
        className="flex w-[268px] flex-col gap-1 rounded-[20px] border-2 px-1 py-1"
      >
        <DropdownMenuLabel className="text-s-base flex h-[48px] items-center p-3 font-semibold text-gray-100">
          Уведомления
          <div className="ml-auto flex items-center gap-1">
            <Button onClick={onOpenSettings} variant="none" className="h-[32px] w-[32px] p-1">
              <Settings className="fill-gray-80 size-6" size="s" />
            </Button>
          </div>
        </DropdownMenuLabel>
        {notificationsList}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
