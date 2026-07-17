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

export const navBarElements: NavbarElementT[] = [
  {
    action: 'select',
    title: 'Выбор',
    icon: <Cursor className={boardToolbarIconClass} />,
  },
  { action: 'hand', title: 'Рука', icon: <Hand className={boardToolbarIconClass} /> },
  {
    action: 'pen',
    title: 'Перо',
    icon: <Pen className={boardToolbarIconClass} />,
    menuPopupContent: [
      {
        icon: <Pen className="fill-unset h-8 w-8" size="lg" />,
        action: 'open-style',
        color: 'blue',
      },
    ],
  },
  { action: 'eraser', title: 'Ластик', icon: <Eraser className={boardToolbarIconClass} /> },
  { action: 'text', title: 'Текст', icon: <TText className={boardToolbarIconCompactClass} /> },
  {
    action: 'geo',
    title: 'Фигуры',
    icon: <Figures className={boardToolbarIconClass} />,
  },
  {
    action: 'arrow',
    title: 'Стрелка',
    icon: <Arrow className={boardToolbarIconClass} />,
  },
  { action: 'frame', title: 'Фрейм', icon: <Transform className={boardToolbarIconClass} /> },
  {
    action: 'sticker',
    title: 'Стикер',
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
  { action: 'emoji', title: 'Эмодзи', icon: <Emotions className={boardToolbarIconClass} /> },
  {
    action: 'asset',
    title: 'Загрузить файл. Фото: до 1 МБ. PDF, аудио и прочие файлы: до 5 МБ.',
    icon: <FilePlus className={boardToolbarIconClass} />,
  },
];
