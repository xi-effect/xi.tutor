import { Account, Exit, Key, Palette, Notification } from '@xipkg/icons';
import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from 'common.auth';

type ItemT = {
  name: string;
  query: string;
};

const options: ItemT[] = [
  {
    name: 'Личные данные',
    query: 'personalInfo',
  },
  // {
  //   name: 'Персонализация',
  //   query: 'personalisation',
  // },
  {
    name: 'Безопасность',
    query: 'security',
  },
  {
    name: 'Уведомления',
    query: 'notifications',
  },
];

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
    const iconClasses = `transition-colors ease-in dark:fill-gray-80 ${
      item.query === profileType ? 'fill-brand-80 dark:fill-brand-80' : 'group-hover:fill-brand-80'
    }`;

    switch (index) {
      case 0:
        return <Account className={iconClasses} key="account-icon" />;
      case 1:
        return <Palette className={iconClasses} key="palette-icon" />;
      case 2:
        return <Key className={iconClasses} key="key-icon" />;
      case 3:
        return <Notification className={iconClasses} key="notification-icon" />;
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
          ? 'bg-brand-0 text-brand-80'
          : 'text-gray-90 hover:bg-brand-0 hover:text-brand-80 bg-transparent'
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
  const { logout } = useAuth();
  const navigate = useNavigate();

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
        <Item item={item} index={index} key={index} onMenuItemChange={handleMenuItem} />
      ))}
      <button
        type="button"
        onClick={() => handleExit()}
        className="text-gray-60 dark:text-gray-80 hover:bg-red-0 group mt-10 flex h-[40px] w-full flex-row items-center rounded-lg bg-transparent p-2 transition-colors ease-in hover:cursor-pointer hover:text-red-100"
      >
        <Exit className="dark:fill-gray-80 transition-colors ease-in group-hover:fill-red-100" />
        <span className="pl-2 text-[14px] font-normal">Выйти</span>
      </button>
    </div>
  );
};
