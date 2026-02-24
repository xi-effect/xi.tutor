import { Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@xipkg/drawer';

export const NotificationsMobileDrawer = ({
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
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="none" className="relative size-8 p-1">
          <Notification className="fill-gray-80 size-6" size="s" />
          {badge}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[calc(100dvh-64px)] w-full">
        <div className="dark:bg-gray-0 h-full p-0.5">
          <DrawerHeader className="flex items-center pt-2 pb-6 pl-1">
            <DrawerTitle className="text-m-base font-semibold text-gray-100">
              Уведомления
            </DrawerTitle>

            <div className="ml-auto flex items-center">
              <Button onClick={onOpenSettings} variant="none" className="size-8 p-1">
                <Settings className="fill-gray-80 size-6" size="s" />
              </Button>
            </div>
          </DrawerHeader>

          {notificationsList}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
