import {
  Account,
  Calendar,
  Exit,
  File,
  Key,
  Music,
  Star,
  Notification,
  Palette,
  SoundOn,
  WhiteBoard,
} from '@xipkg/icons';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from 'common.auth';
import { useCurrentUser } from 'common.services';
import { useSubscriptionUiStore } from 'common.subscription';
import { THEME_CUSTOMIZATION_ENABLED } from 'common.theme';
import { ProfileRoleSwitcher } from './ProfileRoleSwitcher';
import { ConfirmDialog } from 'common.ui';
import { useTranslation } from 'react-i18next';

type ItemT = {
  name: string;
  query: string;
};

type ItemPropsT = {
  index: number;
  item: ItemT;
  onMenuItemChange: (index: number, query: string) => void;
};

const Item = ({ index, item, onMenuItemChange }: ItemPropsT) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });

  // Извлекаем информацию о профиле из параметра iid
  const profileType = search.profile || '';

  const isActive = profileType === item.query;

  // Рендерим соответствующую иконку в зависимости от индекса элемента
  const renderIcon = () => {
    const iconClasses = `transition-colors ease-in dark:fill-icon-primary ${
      item.query === profileType
        ? 'fill-icon-brand dark:fill-icon-brand'
        : 'group-hover:fill-icon-brand'
    }`;

    switch (item.query) {
      case 'personalInfo':
        return <Account className={iconClasses} key="account-icon" />;
      case 'personalisation':
        return <Palette className={iconClasses} key="palette-icon" />;
      case 'schedule':
        return <Calendar className={iconClasses} key="calendar-icon" />;
      case 'security':
        return <Key className={iconClasses} key="key-icon" />;
      case 'notifications':
        return <Notification className={iconClasses} key="notification-icon" />;
      case 'soundAndVideo':
        return <SoundOn className={iconClasses} key="sound-and-video-icon" />;
      case 'effects':
        return <Music className={iconClasses} key="music-icon" />;
      case 'board':
        return <WhiteBoard className={iconClasses} key="board-icon" />;
      case 'report':
        return <File className={iconClasses} key="report-icon" />;
      case 'subscription':
        return <Star className={iconClasses} key="subscription-icon" />;
      default:
        return null;
    }
  };

  const handleClick = () => {
    onMenuItemChange(index, item.query);
    navigate({
      to: pathname,
      search: { profile: item.query },
    });
  };

  return (
    <button
      type="button"
      onClick={() => handleClick()}
      className={`${
        isActive
          ? 'bg-status-info-background text-text-link'
          : 'text-text-primary hover:bg-status-info-background hover:text-text-link bg-transparent'
      } group flex h-[40px] w-full flex-row items-center rounded-lg p-2 transition-colors ease-in hover:cursor-pointer`}
      key={index.toString()}
    >
      {renderIcon()}
      <span className="pl-2 text-[14px] font-normal">{item.name}</span>
    </button>
  );
};

type MenuPropsT = {
  setActiveContent: Dispatch<SetStateAction<number>>;
  setShowContent: Dispatch<SetStateAction<boolean>>;
  setActiveQuery: Dispatch<SetStateAction<string>>;
};

export const Menu = ({ setActiveContent, setActiveQuery, setShowContent }: MenuPropsT) => {
  const { t } = useTranslation('profile');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const options: ItemT[] = useMemo(
    () => [
      {
        name: t('menu.personalInfo'),
        query: 'personalInfo',
      },
      ...(isTutor
        ? [
            {
              name: t('menu.subscription'),
              query: 'subscription',
            },
          ]
        : []),
      ...(THEME_CUSTOMIZATION_ENABLED
        ? [
            {
              name: t('menu.personalisation'),
              query: 'personalisation',
            },
          ]
        : []),
      {
        name: t('menu.schedule'),
        query: 'schedule',
      },
      {
        name: t('menu.security'),
        query: 'security',
      },
      {
        name: t('menu.notifications'),
        query: 'notifications',
      },
      {
        name: t('menu.soundAndVideo'),
        query: 'soundAndVideo',
      },
      {
        name: t('menu.effects'),
        query: 'effects',
      },
      {
        name: t('menu.board'),
        query: 'board',
      },
      {
        name: t('menu.report'),
        query: 'report',
      },
    ],
    [isTutor, t],
  );

  const handleMenuItem = (index: number, query: string) => {
    if (query === 'subscription') {
      useSubscriptionUiStore.getState().openOverview();
    }
    setActiveQuery(query);
    setActiveContent(index);
    setShowContent(true);
  };

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleExit = async () => {
    await logout();
    await navigate({ to: '/signin', replace: true });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col sm:w-[220px]">
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
        {options.map((item, index) => (
          <Item item={item} index={index} key={item.query} onMenuItemChange={handleMenuItem} />
        ))}
      </div>
      <div className="flex shrink-0 flex-col gap-3 pt-4">
        <ProfileRoleSwitcher />
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(true)}
          className="text-text-secondary dark:text-text-primary hover:bg-status-error-background group hover:text-text-danger flex h-10 w-full flex-row items-center rounded-lg bg-transparent p-2 transition-colors ease-in hover:cursor-pointer"
          data-umami-event="profile-logout"
        >
          <Exit className="dark:fill-icon-primary group-hover:fill-icon-danger transition-colors ease-in" />
          <span className="pl-2 text-[14px] font-normal">{t('menu.logout')}</span>
        </button>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title={t('menu.logoutConfirmTitle')}
        description={t('menu.logoutConfirmDescription')}
        confirmLabel={t('menu.logoutConfirmAction')}
        cancelLabel={t('menu.logoutConfirmCancel')}
        onConfirm={handleExit}
      />
    </div>
  );
};
