import {
  BookOpened,
  Calendar,
  Group,
  HelpCircle,
  Home,
  InfoCircle,
  Payments,
  TelegramFilled,
} from '@xipkg/icons';
import { type ComponentType } from 'react';

type TopMenuItem = {
  id: string;
  titleKey: 'home' | 'schedule' | 'classrooms' | 'materials' | 'payments';
  url: '/' | '/schedule' | '/classrooms' | '/materials' | '/payments';
  icon: ComponentType<{ className?: string }>;
};

type FooterMenuItem = {
  titleKey: 'support' | 'wiki' | 'hints';
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
};

export const getTopMenuConfig = (isTutor: boolean): TopMenuItem[] => {
  const topMenu: TopMenuItem[] = [
    {
      id: 'home-menu-item',
      titleKey: 'home',
      url: '/',
      icon: Home,
    },
    {
      id: 'calendar-menu-item',
      titleKey: 'schedule',
      url: '/schedule',
      icon: Calendar,
    },
    {
      id: 'classrooms-menu-item',
      titleKey: 'classrooms',
      url: '/classrooms',
      icon: Group,
    },
  ];

  if (isTutor) {
    topMenu.push({
      id: 'materials-menu-item',
      titleKey: 'materials',
      url: '/materials',
      icon: BookOpened,
    });
  }

  topMenu.push({
    id: 'payments-menu-item',
    titleKey: 'payments',
    url: '/payments',
    icon: Payments,
  });

  return topMenu;
};

export const getFooterMenuConfig = (onHintsClick: () => void): FooterMenuItem[] => [
  {
    titleKey: 'support',
    onClick: () => {
      window.open('https://t.me/sovlium_support_bot', '_blank');
    },
    icon: TelegramFilled,
  },
  {
    titleKey: 'wiki',
    onClick: () => {
      window.open('https://support.sovlium.ru', '_blank');
    },
    icon: HelpCircle,
  },
  {
    titleKey: 'hints',
    onClick: onHintsClick,
    icon: InfoCircle,
  },
];
