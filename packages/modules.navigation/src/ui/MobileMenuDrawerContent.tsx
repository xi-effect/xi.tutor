import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Group, Home, Payments, BookOpened, Calendar, Close } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';
import { useCallStore } from 'modules.calls';
import { useMenuStore } from '../store';
import { cn } from '@xipkg/utils';

const menuRowClassName = cn(
  'flex h-[48px] w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors',
);

type MenuItem = {
  id: string;
  titleKey: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const MobileMenuDrawerContent = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation('navigation');
  const { close } = useMenuStore();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });
  const { callId } = useParams({ strict: false });
  const isStarted = useCallStore((state) => state.isStarted);
  const mode = useCallStore((state) => state.mode);

  const menuItems: MenuItem[] = [
    { id: 'home-menu-item', titleKey: 'home', url: '/', icon: Home },
    { id: 'classrooms-menu-item', titleKey: 'classrooms', url: '/classrooms', icon: Group },
    { id: 'calendar-menu-item', titleKey: 'schedule', url: '/schedule', icon: Calendar },
    ...(isTutor
      ? [{ id: 'materials-menu-item', titleKey: 'materials', url: '/materials', icon: BookOpened }]
      : []),
    { id: 'payments-menu-item', titleKey: 'payments', url: '/payments', icon: Payments },
  ];

  const getIsActive = (url: string) => {
    if (url === '/') return pathname === '/';
    if (pathname.includes('board')) return url === '/materials';
    if (pathname.includes('call')) return url === '/classrooms';
    return pathname.includes(url);
  };

  const handleClick = (url: string) => {
    const filteredSearch = isStarted && search.call ? { call: search.call } : {};
    if (isStarted && mode === 'full') {
      navigate({
        to: url,
        search: () => ({ ...filteredSearch, call: callId }),
      });
    } else {
      navigate({ to: url, search: () => filteredSearch });
    }
    close();
    onClose();
  };

  return (
    <div className="dark:bg-background-surface flex flex-col gap-5 rounded-t-2xl">
      <div className="flex flex-col gap-3">
        {menuItems.map((item) => {
          const isActive = getIsActive(item.url);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.url)}
              data-umami-event={`navigation-mobile-${item.titleKey}`}
              data-umami-event-url={item.url}
              className={cn(
                menuRowClassName,
                isActive
                  ? 'bg-status-info-background text-text-link border-transparent'
                  : 'border-border-default bg-background-surface hover:bg-background-page text-text-primary border',
              )}
            >
              <Icon
                className={cn(
                  'size-6 shrink-0',
                  isActive ? 'fill-icon-brand' : 'fill-icon-secondary',
                )}
              />
              <span
                className={cn(
                  'text-m-base font-medium',
                  isActive ? 'text-text-link' : 'text-text-primary',
                )}
              >
                {t(item.titleKey)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-m-base text-text-primary font-medium">{t('menu')}</span>
        <button
          type="button"
          onClick={() => {
            close();
            onClose();
          }}
          aria-label={t('close')}
          className="bg-background-page hover:bg-background-subtle focus:bg-background-subtle flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
        >
          <Close className="fill-icon-primary size-5" />
        </button>
      </div>
    </div>
  );
};
