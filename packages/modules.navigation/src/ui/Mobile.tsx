import { Drawer, DrawerContent } from '@xipkg/drawer';
import { Sidebar } from '@xipkg/sidebar';
import { useMenuStore } from '../store';
import { SideBarItems } from './SideBarItems';

export const Mobile = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, open: openMenu, close } = useMenuStore();

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => (open ? openMenu() : close())} modal>
        <DrawerContent className="max-h-[calc(100dvh-64px)] w-full">
          <div className="dark:bg-gray-0 h-full p-4">
            <Sidebar collapsible="none" variant="inset" className="w-full">
              <SideBarItems />
            </Sidebar>
          </div>
        </DrawerContent>
      </Drawer>
      <div className="w-full pt-[64px]">{children}</div>
    </>
  );
};
