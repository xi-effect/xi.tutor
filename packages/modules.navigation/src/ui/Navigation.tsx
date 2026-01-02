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
  const { isOpen, toggle } = useMenuStore();

  // Для мобильной версии используем useMenuStore, для десктоп - собственное состояние SidebarProvider
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

  // Для десктоп версии SidebarProvider управляет своим состоянием
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '300px',
        } as React.CSSProperties
      }
      defaultOpen={true}
    >
      <Header />
      <NavigationLayout>{children}</NavigationLayout>
    </SidebarProvider>
  );
};
