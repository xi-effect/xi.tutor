import { ReactNode } from 'react';
import {
  Arrow,
  Cursor,
  Eraser,
  Figures,
  Hand,
  Pen,
  Sticker,
  Transform,
  TText,
  Emotions,
  FilePlus,
} from '@xipkg/icons';
import i18n from 'i18next';
import { boardToolbarIconClass, boardToolbarIconCompactClass } from '../ui/boardTheme';

export type NavbarElementT = {
  action: string;
  title: string;
  icon: ReactNode | null;
  hasAToolTip?: boolean;
  menuPopupContent?: PopupItemT[];
};

export type PopupItemT = {
  icon: ReactNode | null;
  action: string;
  color: string;
};

const t = (key: string) => String(i18n.t(key, { ns: 'board' }));

export const navBarElements: NavbarElementT[] = [
  {
    action: 'select',
    get title() {
      return t('navbar.select');
    },
    icon: <Cursor className={boardToolbarIconClass} />,
  },
  {
    action: 'hand',
    get title() {
      return t('navbar.hand');
    },
    icon: <Hand className={boardToolbarIconClass} />,
  },
  {
    action: 'pen',
    get title() {
      return t('navbar.pen');
    },
    icon: <Pen className={boardToolbarIconClass} />,
    menuPopupContent: [
      {
        icon: <Pen className="fill-unset h-8 w-8" size="lg" />,
        action: 'open-style',
        color: 'blue',
      },
    ],
  },
  {
    action: 'eraser',
    get title() {
      return t('navbar.eraser');
    },
    icon: <Eraser className={boardToolbarIconClass} />,
  },
  {
    action: 'text',
    get title() {
      return t('navbar.text');
    },
    icon: <TText className={boardToolbarIconCompactClass} />,
  },
  {
    action: 'geo',
    get title() {
      return t('navbar.shapes');
    },
    icon: <Figures className={boardToolbarIconClass} />,
  },
  {
    action: 'arrow',
    get title() {
      return t('navbar.arrow');
    },
    icon: <Arrow className={boardToolbarIconClass} />,
  },
  {
    action: 'frame',
    get title() {
      return t('navbar.frame');
    },
    icon: <Transform className={boardToolbarIconClass} />,
  },
  {
    action: 'sticker',
    get title() {
      return t('navbar.sticker');
    },
    icon: <Sticker className={boardToolbarIconCompactClass} />,
    menuPopupContent: [
      {
        icon: <Sticker className="fill-gray-60" />,
        action: 'set-style',
        color: 'grey',
      },
      {
        icon: <Sticker className="fill-brand-100" />,
        action: 'set-style',
        color: 'blue',
      },
      {
        icon: <Sticker className="fill-red-100" />,
        action: 'set-style',
        color: 'red',
      },
      {
        icon: <Sticker className="fill-green-100" />,
        action: 'set-style',
        color: 'green',
      },
      {
        icon: <Sticker className="fill-orange-100" />,
        action: 'set-style',
        color: 'light-red',
      },
      {
        icon: <Sticker className="fill-yellow-100" />,
        action: 'set-style',
        color: 'yellow',
      },
      {
        icon: <Sticker className="fill-violet-100" />,
        action: 'set-style',
        color: 'violet',
      },
      {
        icon: <Sticker className="fill-pink-100" />,
        action: 'set-style',
        color: 'light-violet',
      },
      {
        icon: <Sticker className="fill-cyan-100" />,
        action: 'set-style',
        color: 'light-blue',
      },
    ],
  },
  {
    action: 'emoji',
    get title() {
      return t('navbar.emoji');
    },
    icon: <Emotions className={boardToolbarIconClass} />,
  },
  {
    action: 'asset',
    get title() {
      return t('navbar.uploadFile');
    },
    icon: <FilePlus className={boardToolbarIconClass} />,
  },
];
