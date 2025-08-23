import { Sidebar, SidebarInset } from '@xipkg/sidebar';

import { SideBarItems } from './SideBarItems';

export const Desktop = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Sidebar id="sidebar" collapsible="icon" className="absolute w-full pt-[64px] md:w-[300px]">
        <SideBarItems />
      </Sidebar>
      <SidebarInset className="h-screen overflow-hidden pt-[64px]">{children}</SidebarInset>
    </>
  );
};
