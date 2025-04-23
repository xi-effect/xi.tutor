import { SidebarTrigger, useSidebar } from '@xipkg/sidebar';
import { Logo } from 'common.ui';
import { useMenuStore } from '../../store';
import { SwiperRef } from 'swiper/react';
import { useMediaQuery } from '@xipkg/utils';
import { UserProfile } from '@xipkg/userprofile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { UserSettings } from 'modules.profile';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';

export const Header = ({
  swiperRef,
  toggle,
}: {
  swiperRef: React.RefObject<SwiperRef | null>;
  toggle: () => void;
}) => {
  const { isOpen } = useMenuStore();
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { toggleSidebar } = useSidebar();
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });

  // Состояние модалки определяется URL параметром iid (используем его вместо profile)
  const [open, setOpen] = useState(false);

  // Синхронизируем состояние модалки с URL
  useEffect(() => {
    // Используем iid параметр для определения, открыта ли модалка и какая вкладка активна
    const profileParam = search.iid;
    const hasProfileParam = !!profileParam;
    if (hasProfileParam !== open) {
      setOpen(hasProfileParam);
    }
  }, [search.iid, open]);

  const handleToggle = () => {
    toggle();

    if (isMobile) {
      swiperRef.current?.swiper.slideTo(Number(isOpen));
    } else {
      toggleSidebar();
    }
  };

  const handleOpenProfile = () => {
    // Используем параметр iid для хранения значения "profile:home"
    navigate({
      to: pathname,
      search: { iid: 'profile:home' },
    });
  };

  return (
    <div className="fixed top-0 right-0 left-0 z-20 flex h-[64px] w-full items-center gap-4 px-4 py-3">
      <SidebarTrigger onClick={handleToggle} />
      <Logo />
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserProfile userId={null} size="m" withOutText />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem onClick={handleOpenProfile}>{t('profile')}</DropdownMenuItem>
            <DropdownMenuItem>{t('logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <UserSettings open={open} setOpen={setOpen} />
    </div>
  );
};
