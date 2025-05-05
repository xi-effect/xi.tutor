import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { YjsEditor } from '@slate-yjs/core';
import { CSSProperties } from 'react';

// Типы для элементов редактора

// Базовый тип для текста
export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
  type?: string;
  strikethrough?: boolean;
  prism?: boolean;
  id?: string;
  className?: string;
}

export interface Ancestor {
  id?: string;
  type?: string;
  children?: Descendant[];
}

export interface Node {
  id?: string;
}

// Базовый элемент
export interface BaseElement {
  id: string;
  type: string;
  children: Descendant[];
  style?: CSSProperties;
}

// Элемент параграфа
export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
}

// Элемент заголовка
export interface HeadingElement extends BaseElement {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

// Элемент изображения
export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  alt?: string;
}

// Элемент блока изображения
export interface ImageBlockElement extends BaseElement {
  type: 'imageBlock';
  url: string;
  alt?: string;
}

// Элемент видео
export interface VideoElement extends BaseElement {
  type: 'video';
  url: string;
}

// Элемент блока видео
export interface VideoBlockElement extends BaseElement {
  type: 'videoBlock';
  url: string;
}

// Элемент файла
export interface FileElement extends BaseElement {
  type: 'file';
  url: string;
  fileName: string;
  size?: number;
}

// Элемент блока файла
export interface FileBlockElement extends BaseElement {
  type: 'fileBlock';
  url: string;
  fileName: string;
  size?: number;
}

// Элемент цитаты
export interface QuoteElement extends BaseElement {
  type: 'quote';
}

// Элемент текста цитаты
export interface QuoteTextElement extends BaseElement {
  type: 'quoteText';
}

// Элемент автора цитаты
export interface QuoteAuthorElement extends BaseElement {
  type: 'quoteAuthor';
}

// Элемент совета/подсказки
export interface TipElement extends BaseElement {
  type: 'tip';
  color?: string;
  bg?: string;
  icon?: React.ReactNode;
}

// Элемент кода
export interface CodeElement extends BaseElement {
  type: 'code';
  language: string;
}

// Элемент маркированного списка
export interface BulletedListElement extends BaseElement {
  type: 'bulleted-list';
}

// Элемент нумерованного списка
export interface NumberedListElement extends BaseElement {
  type: 'numbered-list';
}

// Элемент пункта списка
export interface ListItemElement extends BaseElement {
  type: 'list-item';
}

// Элемент ссылки
export interface LinkElement extends BaseElement {
  type: 'link';
  url: string;
}

// Элемент разделителя
export interface DividerElement extends BaseElement {
  type: 'divider';
}

// Элемент иконки
export interface IconElement extends BaseElement {
  type: 'icon';
  icon: React.ReactNode;
}

// Тип медиа-элемента
export type MediaElement = ImageElement | VideoElement | FileElement;

// Объединение всех типов элементов
export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | ImageElement
  | ImageBlockElement
  | VideoElement
  | VideoBlockElement
  | FileElement
  | FileBlockElement
  | QuoteElement
  | QuoteTextElement
  | QuoteAuthorElement
  | TipElement
  | CodeElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | LinkElement
  | DividerElement
  | IconElement;

// Расширение типов Slate
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor & YjsEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Тип загруженного файла
export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

// Тип для кастомного редактора
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor & YjsEditor;
