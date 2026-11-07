import { BookOpened, Calendar, Group, Home, Payments, PersonalData, Task } from '@xipkg/icons';
import { type ComponentType } from 'react';

type TopMenuItem = {
  id: string;
  titleKey: 'home' | 'schedule' | 'classrooms' | 'students' | 'materials' | 'mathBank' | 'payments';
  url: '/' | '/schedule' | '/classrooms' | '/students' | '/materials' | '/bank' | '/payments';
  icon: ComponentType<{ className?: string; theme?: string }>;
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
    topMenu.push(
      {
        id: 'students-menu-item',
        titleKey: 'students',
        url: '/students',
        icon: PersonalData,
      },
      {
        id: 'materials-menu-item',
        titleKey: 'materials',
        url: '/materials',
        icon: BookOpened,
      },
      {
        id: 'bank-menu-item',
        titleKey: 'mathBank',
        url: '/bank',
        icon: Task,
      },
    );
  }

  topMenu.push({
    id: 'payments-menu-item',
    titleKey: 'payments',
    url: '/payments',
    icon: Payments,
  });

  return topMenu;
};
