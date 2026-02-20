import { useMediaQuery } from '@xipkg/utils';
import { Drawer, DrawerContent } from '@xipkg/drawer';
import { Sidebar, SidebarInset } from '@xipkg/sidebar';
// import { Header } from './Header';
import { SideBarItems } from './SideBarItems';
import { SidebarProvider } from '@xipkg/sidebar';
import { useMenuStore } from '../store';
import { useMemo } from 'react';

const NavigationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { isOpen, open: openMenu, close } = useMenuStore();

  // Мемоизируем children, чтобы они не пересоздавались при изменении isMobile
  const stableChildren = useMemo(() => children, [children]);

  // Используем один компонент, который условно рендерит нужную структуру
  // но children всегда остаются в одном месте с одним ключом
  // Это позволяет React сохранять состояние компонентов при переключении
  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={isOpen} onOpenChange={(open) => (open ? openMenu() : close())} modal>
          <DrawerContent className="max-h-[calc(100dvh-64px)] w-full">
            <div className="dark:bg-gray-0 h-full p-4">
              <Sidebar collapsible="none" variant="inset" className="w-full">
                <SideBarItems />
              </Sidebar>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          id="sidebar"
          collapsible="icon"
          className="dark:bg-gray-0 absolute w-full md:w-[300px]"
        >
          <SideBarItems />
        </Sidebar>
      )}

      {/* Children всегда рендерятся в одном месте с одним ключом и одним типом элемента */}
      {/* Используем SidebarInset для обоих случаев, чтобы React сохранял состояние */}
      <SidebarInset
        className={isMobile ? 'w-full' : 'h-screen overflow-hidden'}
        key="navigation-content"
      >
        {stableChildren}
      </SidebarInset>
    </>
  );
};

export const Navigation = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { isOpen, toggle, isDesktopOpen, setDesktopOpen } = useMenuStore();

  // Мемоизируем children, чтобы они не пересоздавались при изменении размера окна
  const stableChildren = useMemo(() => children, [children]);

  // Динамически выбираем пропсы для SidebarProvider в зависимости от размера экрана
  const sidebarOpen = isMobile ? isOpen : isDesktopOpen;
  const sidebarOnOpenChange = isMobile ? toggle : setDesktopOpen;

  // Используем один SidebarProvider с динамическими пропсами вместо условного рендеринга
  // Это предотвращает пересоздание всего дерева компонентов при изменении размера окна
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '300px',
        } as React.CSSProperties
      }
      open={sidebarOpen}
      onOpenChange={sidebarOnOpenChange}
    >
      {/* <Header /> */}
      <NavigationLayout>{stableChildren}</NavigationLayout>
    </SidebarProvider>
  );
};
