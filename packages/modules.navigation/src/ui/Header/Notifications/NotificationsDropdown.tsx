import { Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { SidebarMenuButton, SidebarMenuItem } from '@xipkg/sidebar';

export const NotificationsDropdown = ({
  isOpen,
  onOpenChange,
  onOpenSettings,
  notificationsList,
  badge,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  notificationsList: React.ReactNode;
  badge: React.ReactNode;
}) => {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton className="relative h-10 w-full p-2 focus-visible:ring-0 focus-visible:ring-offset-0">
            <>
              <Notification className="fill-gray-80 size-6" size="s" />
              <span className="text-s-base">Уведомления</span>
            </>
          </SidebarMenuButton>
          {badge}
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
