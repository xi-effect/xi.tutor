import { Sidebar, SidebarInset } from '@xipkg/sidebar';

import { ScrollArea } from '@xipkg/scrollarea';
import { SideBarItems } from './SideBarItems';

export const Desktop = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Sidebar collapsible="icon" className="absolute w-full pt-[64px] md:w-[350px]">
        <SideBarItems />
      </Sidebar>
      <SidebarInset>
        <ScrollArea className="mt-[64px] h-full w-full">{children}</ScrollArea>
      </SidebarInset>
    </>
  );
};
