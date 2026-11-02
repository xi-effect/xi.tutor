import { useMediaQuery } from '@xipkg/utils';
import { Drawer } from '@xipkg/drawer';
import { Sidebar, SidebarInset } from '@xipkg/sidebar';
import { SideBarItems } from './SideBarItems';
import { SidebarProvider } from '@xipkg/sidebar';
import { useFocusModeStore, useSupportModalStore } from 'common.ui';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { SupportModal } from './SupportModal';
import { SubscriptionReleaseNoteHost } from './announcements/SubscriptionReleaseNoteHost';
import { PostLessonFeedbackHost } from './feedback/PostLessonFeedbackHost';
import { SubscriptionHost } from 'features.subscription';
import { useMenuStore } from '../store';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { MobileBottomBar } from './MobileBottomBar';
import { MobileMenuDrawerContent } from './MobileMenuDrawerContent';
import { NavigationDrawerContent } from './NavigationDrawerContent';
import { DRAWER_CONTENT_ABOVE_BAR_CLASS, MOBILE_BOTTOM_BAR_HEIGHT, isBoardPath } from './constants';
import { SettingsSidebar } from './SettingsSidebar';
import { useSettingsSearch } from './useSettingsSearch';
import {
  isSettingsPath,
  rememberSettingsReturn,
  resolveSettingsSlug,
} from 'modules.profile/sections';

const SIDEBAR_WIDTH_EXPANDED = '260px';
const SIDEBAR_WIDTH_COLLAPSED = '72px';

const NavigationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const settingsSearch = useSettingsSearch();
  const latestLocation = useRef({ location, settingsSearch });
  latestLocation.current = { location, settingsSearch };
  const onSettings = isSettingsPath(pathname);
  const { isOpen, open: openMenu, close } = useMenuStore();
  const focusMode = useFocusModeStore((s) => s.focusMode);
  const isSupportOpen = useSupportModalStore((s) => s.isOpen);
  const setSupportOpen = useSupportModalStore((s) => s.setOpen);
  const hideMobileNav = isMobile && (focusMode || isBoardPath(pathname));

  // Старые ссылки ?profile=personalInfo открывают страницу настроек.
  // Путь, с которого ушли, запоминаем для кнопки «Назад».
  useLayoutEffect(() => {
    const current = latestLocation.current.location;
    const profile =
      current.search && typeof current.search === 'object' && 'profile' in current.search
        ? current.search.profile
        : undefined;

    if (!isSettingsPath(current.pathname)) {
      rememberSettingsReturn(current.pathname, current.search);
    }

    if (typeof profile !== 'string' || profile.length === 0) return;

    void navigate({
      to: '/settings/$section',
      params: { section: resolveSettingsSlug(profile) },
      search: latestLocation.current.settingsSearch,
      replace: true,
    });
  }, [location.href, navigate]);

  // Мемоизируем children, чтобы они не пересоздавались при изменении isMobile
  const stableChildren = useMemo(() => children, [children]);

  const insetClassName =
    focusMode || hideMobileNav
      ? isMobile
        ? 'w-full h-screen min-h-0 overflow-hidden'
        : 'h-screen min-h-0 overflow-hidden'
      : isMobile
        ? 'h-dvh min-h-0 w-full overflow-hidden'
        : 'h-screen min-h-0 overflow-hidden';

  // paddingBottom через style: динамический `pb-[${n}px]` Tailwind JIT не генерирует.
  // --calls-layout-bottom-offset читают Call / доски / PreJoin, чтобы не залезать под
  // fixed MobileBottomBar.
  const insetStyle =
    isMobile && !hideMobileNav
      ? ({
          paddingBottom: MOBILE_BOTTOM_BAR_HEIGHT,
          '--calls-layout-bottom-offset': `${MOBILE_BOTTOM_BAR_HEIGHT}px`,
        } as React.CSSProperties)
      : undefined;

  // Используем один компонент, который условно рендерит нужную структуру
  // но children всегда остаются в одном месте с одним ключом
  // Это позволяет React сохранять состояние компонентов при переключении
  return (
    <>
      {/* Мобильное меню по бургеру — список навигации (не перекрывает нижнюю панель) */}
      {isMobile && !hideMobileNav && (
        <Drawer open={isOpen} onOpenChange={(open) => (open ? openMenu() : close())} modal>
          <NavigationDrawerContent className={DRAWER_CONTENT_ABOVE_BAR_CLASS}>
            <MobileMenuDrawerContent onClose={close} />
          </NavigationDrawerContent>
        </Drawer>
      )}

      {/* Desktop Sidebar — скрыт в режиме фокуса */}
      {!isMobile && !focusMode && (
        <Sidebar
          id="sidebar"
          collapsible="icon"
          className="bg-background-page border-r-border-default absolute w-full border-r md:w-(--sidebar-width)"
        >
          {onSettings ? <SettingsSidebar /> : <SideBarItems />}
        </Sidebar>
      )}

      {/* Children всегда рендерятся в одном месте с одним ключом и одним типом элемента */}
      {/* Используем SidebarInset для обоих случаев, чтобы React сохранял состояние */}
      <SidebarInset className={insetClassName} style={insetStyle} key="navigation-content">
        {stableChildren}
      </SidebarInset>

      {/* Мобильная нижняя панель — скрыта в фокусе и на доске */}
      {isMobile && !hideMobileNav && <MobileBottomBar />}

      <SupportModal open={isSupportOpen} onOpenChange={setSupportOpen} />
      <SubscriptionReleaseNoteHost />
      <PostLessonFeedbackHost />
      <SubscriptionHost />
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
