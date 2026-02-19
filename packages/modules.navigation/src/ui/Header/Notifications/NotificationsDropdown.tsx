import { Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

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
        <Button variant="none" className="relative size-8 p-1">
          <Notification className="fill-gray-80 size-6" size="s" />
          {badge}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="rounded-5 flex w-[310px] flex-col gap-1 border-2 p-1"
      >
        <DropdownMenuLabel className="text-m-base flex h-12 items-center p-3 font-semibold text-gray-100">
          Уведомления
          <div className="ml-auto flex items-center gap-1">
            <Button onClick={onOpenSettings} variant="none" className="size-8 p-1">
              <Settings className="fill-gray-80 size-6" size="s" />
            </Button>
          </div>
        </DropdownMenuLabel>
        {notificationsList}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
