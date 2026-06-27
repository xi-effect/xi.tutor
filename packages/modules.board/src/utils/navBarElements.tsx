import { ReactNode } from 'react';
import {
  Arrow,
  Cursor,
  Eraser,
  Figures,
  Hand,
  Image,
  Pen,
  Sticker,
  Transform,
  TText,
  Emotions,
  // FilePlus,
} from '@xipkg/icons';
import { boardIconClass } from '../ui/boardTheme';

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

export const navBarElements: NavbarElementT[] = [
  {
    action: 'select',
    title: 'Выбор',
    icon: <Cursor size="l" className={`h-8 w-8 ${boardIconClass}`} />,
  },
  { action: 'hand', title: 'Рука', icon: <Hand className={boardIconClass} /> },
  {
    action: 'pen',
    title: 'Перо',
    icon: <Pen size="l" className={`h-8 w-8 ${boardIconClass}`} />,
    menuPopupContent: [
      {
        icon: <Pen className="fill-unset h-8 w-8" size="l" />,
        action: 'open-style',
        color: 'blue',
      },
    ],
  },
  {
    action: 'sticker',
    title: 'Стикер',
    icon: <Sticker className={boardIconClass} />,
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
  { action: 'text', title: 'Текст', icon: <TText className={boardIconClass} /> },
  {
    action: 'geo',
    title: 'Фигуры',
    icon: <Figures size="l" className={`size-8 ${boardIconClass}`} />,
  },
  {
    action: 'arrow',
    title: 'Стрелка',
    icon: <Arrow size="l" className={`size-8 ${boardIconClass}`} />,
  },
  // { action: 'asset', title: 'Изображение', icon: <Image className={boardIconClass} /> },
  { action: 'asset', title: 'Загрузить файл', icon: <Image className={boardIconClass} /> },
  { action: 'eraser', title: 'Ластик', icon: <Eraser className={boardIconClass} /> },
  { action: 'frame', title: 'Фрейм', icon: <Transform className={boardIconClass} /> },
  { action: 'emoji', title: 'Эмодзи', icon: <Emotions className={boardIconClass} /> },
];
