import { SidebarTrigger } from '@xipkg/sidebar';

export const CustomTrigger = () => {
  return (
    <div className="flex items-center gap-4 p-4">
      <SidebarTrigger />
      <img src="/logo.svg" className="h-4" />
    </div>
  );
};
