import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import type { DecorationAttrs } from '@tiptap/pm/view';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Placeholder } from '@tiptap/extensions';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { UniqueID } from '@tiptap/extension-unique-id';
import * as Y from 'yjs';
import { CustomImage, MoveBlockKeyboard, NormalizeSelection } from '../extensions';

/** Курсор в стиле доски: вертикальная линия + шильдик с именем */
function collaborationCaretRender(user: { name?: string; color?: string }): HTMLElement {
  const color = user.color ?? '#6b7280';
  const name = user.name ?? 'Участник';

  const cursor = document.createElement('span');
  cursor.classList.add('collaboration-carets__caret', 'collaboration-cursor--board-style');
  cursor.setAttribute('style', `--collab-color: ${color}; border-color: ${color}`);

  const label = document.createElement('div');
  label.classList.add('collaboration-carets__label');
  label.setAttribute('style', `background-color: ${color}`);
  label.textContent = name;
  cursor.appendChild(label);

  return cursor;
}

/** Выделение в стиле Notion: полупрозрачный фон (поддержка HSL и hex) */
function collaborationSelectionRender(user: { name?: string; color?: string }): DecorationAttrs {
  const color = user.color ?? '#6b7280';
  return {
    class: 'collaboration-carets__selection',
    style: `background: color-mix(in srgb, ${color} 35%, transparent);`,
  };
}

export const getExtensions = (
  provider: HocuspocusProvider | undefined,
  ydoc: Y.Doc | undefined,
  userData: { name: string; color: string } = { name: 'Участник', color: '#6b7280' },
) => {
  const base = [
    StarterKit.configure({
      // Настраиваем Link из StarterKit
      link: {
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer',
        },
        openOnClick: true,
        autolink: true,
      },
      // Отключаем undoRedo — Collaboration приносит свою реализацию,
      // конфликт двух history-плагинов вызывает infinite update loop
      undoRedo: false,
      // Отключаем некоторые расширения, которые будем настраивать отдельно
      horizontalRule: false,
      underline: false, // подключаем Underline отдельно ниже — иначе дубликат имени
      dropcursor: {
        width: 2,
        color: '#3b82f6',
      },
    }),
    CustomImage.configure({ inline: false }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    UniqueID.configure({
      types: [
        'paragraph',
        'bulletList',
        'orderedList',
        'taskList',
        'heading',
        'blockquote',
        'codeBlock',
      ],
    }),
    Placeholder.configure({
      placeholder: 'Начните писать здесь…',
      emptyEditorClass: 'is-editor-empty',
      showOnlyWhenEditable: true,
    }),
    MoveBlockKeyboard,
    NormalizeSelection,
  ];

  if (!provider || !ydoc) {
    console.warn('Y.js provider или document не инициализированы, работаем в автономном режиме', {
      hasProvider: !!provider,
      hasYdoc: !!ydoc,
    });
    return base;
  }

  try {
    return [
      ...base,
      Collaboration.configure({
        document: ydoc,
        // Используем поле 'default' для хранения содержимого
        // field: 'default'
      }),
      // Временно отключаем CollaborationCursor из-за проблем с provider.doc
      CollaborationCaret.configure({
        provider,
        user: userData,
        render: collaborationCaretRender,
        selectionRender: collaborationSelectionRender,
      }),
    ];
  } catch (error) {
    console.error('Ошибка при инициализации коллаборативных расширений:', error);
    return base;
  }
};
