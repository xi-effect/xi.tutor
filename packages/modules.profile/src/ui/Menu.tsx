import { Account, Exit, Key, Palette, Notification, File, Music } from '@xipkg/icons';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from 'common.auth';
import { THEME_CUSTOMIZATION_ENABLED } from 'common.theme';
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
      case 'security':
        return <Key className={iconClasses} key="key-icon" />;
      case 'notifications':
        return <Notification className={iconClasses} key="notification-icon" />;
      case 'effects':
        return <Music className={iconClasses} key="music-icon" />;
      case 'report':
        return <File className={iconClasses} key="report-icon" />;
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

  const options: ItemT[] = useMemo(
    () => [
      {
        name: t('menu.personalInfo'),
        query: 'personalInfo',
      },
      ...(THEME_CUSTOMIZATION_ENABLED
        ? [
            {
              name: t('menu.personalisation'),
              query: 'personalisation',
            },
          ]
        : []),
      {
        name: t('menu.security'),
        query: 'security',
      },
      {
        name: t('menu.notifications'),
        query: 'notifications',
      },
      {
        name: t('menu.effects'),
        query: 'effects',
      },
      {
        name: t('menu.report'),
        query: 'report',
      },
    ],
    [t],
  );

  const handleMenuItem = (index: number, query: string) => {
    setActiveQuery(query);
    setActiveContent(index);
    setShowContent(true);
  };

  const handleExit = async () => {
    logout();
    // TODO: переделать, сделать редирект только по 200
    navigate({ to: '/signin' });
  };

  return (
    <div className="flex w-full flex-col gap-1 sm:w-[220px]">
      {options.map((item, index) => (
        <Item item={item} index={index} key={item.query} onMenuItemChange={handleMenuItem} />
      ))}
      <button
        type="button"
        onClick={() => handleExit()}
        className="text-text-secondary dark:text-text-primary hover:bg-status-error-background group hover:text-text-danger mt-10 flex h-[40px] w-full flex-row items-center rounded-lg bg-transparent p-2 transition-colors ease-in hover:cursor-pointer"
        data-umami-event="profile-logout"
      >
        <Exit className="dark:fill-icon-primary group-hover:fill-icon-danger transition-colors ease-in" />
        <span className="pl-2 text-[14px] font-normal">{t('menu.logout')}</span>
      </button>
    </div>
  );
};
