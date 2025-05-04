import { Home, Calendar, Group, TelegramFilled, Payments, Materials, FAQ } from '@xipkg/icons';

export const items = [
  {
    titleKey: 'home',
    url: '/',
    icon: Home,
  },
  {
    titleKey: 'calendar',
    url: '/calendar',
    icon: Calendar,
  },
  {
    titleKey: 'students',
    url: '/classrooms',
    icon: Group,
  },
  {
    titleKey: 'materials',
    url: '/materials',
    icon: Materials,
  },
  {
    titleKey: 'payments',
    url: '/payments',
    icon: Payments,
  },
];

export const footerMenu = [
  {
    titleKey: 'support',
    url: '#',
    icon: TelegramFilled,
  },
  {
    titleKey: 'faq',
    url: '#',
    icon: FAQ,
  },
];
