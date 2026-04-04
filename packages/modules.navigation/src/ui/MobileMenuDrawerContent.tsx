import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Group, Home, Payments, BookOpened, Calendar, Close } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';
import { useCallStore } from 'modules.calls';
import { useMenuStore } from '../store';
import { cn } from '@xipkg/utils';

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
    const filteredSearch = search.call ? { call: search.call } : {};
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
    <div className="bg-gray-0 flex flex-col rounded-t-2xl">
      <div className="flex flex-col gap-2 p-3">
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
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                isActive
                  ? 'bg-brand-5 text-brand-100'
                  : 'border-gray-10 bg-gray-0 hover:bg-gray-5 border text-gray-100',
              )}
            >
              <Icon
                className={cn('size-6 shrink-0', isActive ? 'text-brand-100' : 'text-gray-60')}
              />
              <span className="text-m-base font-medium">{t(item.titleKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Подвал: «Меню» и кнопка закрытия */}
      <div className="border-gray-10 flex items-center justify-between border-t px-4 py-3">
        <span className="text-m-base text-gray-60">{t('menu')}</span>
        <button
          type="button"
          onClick={() => {
            close();
            onClose();
          }}
          aria-label={t('close')}
          className="text-gray-80 hover:bg-gray-10 focus:bg-gray-10 size-8 rounded-lg p-1 transition-colors"
        >
          <Close className="size-5" />
        </button>
      </div>
    </div>
  );
};
