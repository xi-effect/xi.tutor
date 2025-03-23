import { Home, Calendar, Group, TelegramFilled, Payments, Materials, FAQ } from '@xipkg/icons';

export const items = [
  {
    title: 'Главная',
    url: '/',
    icon: Home,
  },
  {
    title: 'Календарь',
    url: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Ученики',
    url: '/classrooms',
    icon: Group,
  },
  {
    title: 'Материалы',
    url: '/content',
    icon: Materials,
  },
  {
    title: 'Оплаты',
    url: '/payments',
    icon: Payments,
  },
];

export const footerMenu = [
  {
    title: 'Поддержка',
    url: '#',
    icon: TelegramFilled,
  },
  {
    title: 'FAQ',
    url: '#',
    icon: FAQ,
  },
];
