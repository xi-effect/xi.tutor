import type { ComponentType } from 'react';
import { ArrowBottom, ArrowUp, Copy, H1, H2, H3, Ol, Task, Text, Trash, Ul } from '@xipkg/icons';
import type { BlockTypeT } from '../types';

/** @xipkg/icons компоненты; нам нужны только className/size. Реюзается в NotesEditorToolbar. */
export type IconComponent = ComponentType<{ className?: string; size?: 'sm' | 'lg' | 'default' }>;

/**
 * Действия вставки блока — единый порядок / лейблы (namespace `editor`) / иконки
 * для BlockMenu (десктопный dropdown) и NotesEditorToolbar (мобильный тулбар).
 * `type` передаётся в `useBlockMenuActions().insertBlock`.
 */
export const INSERT_BLOCK_ACTIONS: readonly {
  type: BlockTypeT;
  labelKey: string;
  Icon: IconComponent;
}[] = [
  { type: 'paragraph', labelKey: 'blockMenu.text', Icon: Text },
  { type: 'heading1', labelKey: 'blockMenu.heading1', Icon: H1 },
  { type: 'heading2', labelKey: 'blockMenu.heading2', Icon: H2 },
  { type: 'heading3', labelKey: 'blockMenu.heading3', Icon: H3 },
  { type: 'bulletList', labelKey: 'blockMenu.bulletList', Icon: Ul },
  { type: 'orderedList', labelKey: 'blockMenu.orderedList', Icon: Ol },
  { type: 'taskList', labelKey: 'blockMenu.taskList', Icon: Task },
];

export type BlockOpKey = 'duplicate' | 'moveUp' | 'moveDown' | 'delete';

/**
 * Операции над текущим блоком — единый список. `shortcut` показывает только BlockMenu.
 * `key` соответствует хендлерам `useBlockMenuActions` (`delete` → `remove`).
 */
export const BLOCK_OP_ACTIONS: readonly {
  key: BlockOpKey;
  labelKey: string;
  Icon: IconComponent;
  shortcut: { mac: string; other: string };
}[] = [
  {
    key: 'duplicate',
    labelKey: 'blockMenu.duplicate',
    Icon: Copy,
    shortcut: { mac: '⌘+⇧+C', other: 'Ctrl+Shift+C' },
  },
  {
    key: 'moveUp',
    labelKey: 'blockMenu.moveUp',
    Icon: ArrowUp,
    shortcut: { mac: '⌘+⇧+↑', other: 'Ctrl+Shift+↑' },
  },
  {
    key: 'moveDown',
    labelKey: 'blockMenu.moveDown',
    Icon: ArrowBottom,
    shortcut: { mac: '⌘+⇧+↓', other: 'Ctrl+Shift+↓' },
  },
  {
    key: 'delete',
    labelKey: 'blockMenu.delete',
    Icon: Trash,
    shortcut: { mac: '⌘+⌫', other: 'Del' },
  },
];
