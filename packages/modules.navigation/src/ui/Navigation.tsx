import { useMediaQuery } from '@xipkg/utils';
import { Desktop } from './Desktop';
import { Header } from './Header';
import { Mobile } from './Mobile';
import { SidebarProvider } from '@xipkg/sidebar';
import { useMenuStore } from '../store';

const NavigationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 960px)');

  if (isMobile) {
    return <Mobile>{children}</Mobile>;
  }

  return <Desktop>{children}</Desktop>;
};

export const Navigation = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { isOpen, toggle, isDesktopOpen, setDesktopOpen } = useMenuStore();

  // Для мобильной версии используем isOpen из useMenuStore для Drawer
  if (isMobile) {
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': '300px',
          } as React.CSSProperties
        }
        open={isOpen}
        onOpenChange={toggle}
      >
        <Header />
        <NavigationLayout>{children}</NavigationLayout>
      </SidebarProvider>
    );
  }

  // Для десктоп версии используем isDesktopOpen из store с сохранением в localStorage
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '300px',
        } as React.CSSProperties
      }
      open={isDesktopOpen}
      onOpenChange={setDesktopOpen}
    >
      <Header />
      <NavigationLayout>{children}</NavigationLayout>
    </SidebarProvider>
  );
};
