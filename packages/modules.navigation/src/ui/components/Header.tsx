import { SidebarTrigger } from '@xipkg/sidebar';
import { Logo } from 'common.ui';

export const Header = () => {
  return (
    <div className="fixed top-0 right-0 left-0 z-20 flex h-[64px] w-full items-center gap-4 px-4 py-3">
      <SidebarTrigger />
      <Logo />
    </div>
  );
};
