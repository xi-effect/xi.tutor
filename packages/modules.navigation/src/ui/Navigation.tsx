import { useMediaQuery } from '@xipkg/utils';
import { Drawer, DrawerContent } from '@xipkg/drawer';
import { Sidebar, SidebarInset } from '@xipkg/sidebar';
import { SideBarItems } from './SideBarItems';
import { SidebarProvider } from '@xipkg/sidebar';
import { useFocusModeStore } from 'common.ui';
import { useMenuStore } from '../store';
import { useEffect, useMemo } from 'react';
import { MobileBottomBar } from './MobileBottomBar';
import { MobileMenuDrawerContent } from './MobileMenuDrawerContent';
import { DRAWER_CONTENT_ABOVE_BAR_CLASS } from './constants';

const SIDEBAR_WIDTH_EXPANDED = '300px';
const SIDEBAR_WIDTH_COLLAPSED = '72px';

const NavigationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { isOpen, open: openMenu, close } = useMenuStore();
  const focusMode = useFocusModeStore((s) => s.focusMode);

  // Мемоизируем children, чтобы они не пересоздавались при изменении isMobile
  const stableChildren = useMemo(() => children, [children]);

  const insetClassName = focusMode
    ? isMobile
      ? 'w-full h-screen min-h-0 overflow-hidden'
      : 'h-screen min-h-0 overflow-hidden'
    : isMobile
      ? 'w-full pb-[64px]'
      : 'h-screen min-h-0 overflow-hidden';

  // Используем один компонент, который условно рендерит нужную структуру
  // но children всегда остаются в одном месте с одним ключом
  // Это позволяет React сохранять состояние компонентов при переключении
  return (
    <>
      {/* Мобильное меню по бургеру — список навигации (не перекрывает нижнюю панель) */}
      {isMobile && !focusMode && (
        <Drawer open={isOpen} onOpenChange={(open) => (open ? openMenu() : close())} modal>
          <DrawerContent className={DRAWER_CONTENT_ABOVE_BAR_CLASS}>
            <MobileMenuDrawerContent onClose={close} />
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop Sidebar — скрыт в режиме фокуса */}
      {!isMobile && !focusMode && (
        <Sidebar
          id="sidebar"
          collapsible="icon"
          className="dark:bg-gray-0 absolute w-full md:w-(--sidebar-width)"
        >
          <SideBarItems />
        </Sidebar>
      )}

      {/* Children всегда рендерятся в одном месте с одним ключом и одним типом элемента */}
      {/* Используем SidebarInset для обоих случаев, чтобы React сохранял состояние */}
      <SidebarInset className={insetClassName} key="navigation-content">
        {stableChildren}
      </SidebarInset>

      {/* Мобильная нижняя панель навигации (не в режиме фокуса) */}
      {isMobile && !focusMode && <MobileBottomBar />}
    </>
  );
};

export const Navigation = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { isOpen, toggle, isDesktopOpen, setDesktopOpen } = useMenuStore();
  const focusMode = useFocusModeStore((s) => s.focusMode);
  const setFocusMode = useFocusModeStore((s) => s.setFocusMode);

  // В режиме фокуса — выход по Esc
  useEffect(() => {
    if (!focusMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, setFocusMode]);

  // Мемоизируем children, чтобы они не пересоздавались при изменении размера окна
  const stableChildren = useMemo(() => children, [children]);

  // Динамически выбираем пропсы для SidebarProvider в зависимости от размера экрана
  const sidebarOpen = isMobile ? isOpen : isDesktopOpen;
  const sidebarOnOpenChange = isMobile ? toggle : setDesktopOpen;

  // Используем один SidebarProvider с динамическими пропсами вместо условного рендеринга
  // Это предотвращает пересоздание всего дерева компонентов при изменении размера окна
  // В режиме фокуса (доска на весь экран) не показываем верхний хедер приложения
  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={sidebarOnOpenChange}
      style={
        {
          '--sidebar-width': sidebarWidth,
        } as React.CSSProperties
      }
    >
      <NavigationLayout>{stableChildren}</NavigationLayout>
    </SidebarProvider>
  );
};
