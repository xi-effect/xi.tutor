import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Placeholder } from '@tiptap/extensions';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { UniqueID } from '@tiptap/extension-unique-id';
import * as Y from 'yjs';

export const getExtensions = (
  provider: HocuspocusProvider | undefined,
  ydoc: Y.Doc | undefined,
  userData: { name: string; color: string } = { name: 'Igor', color: '#ff00ff' },
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
      // Отключаем некоторые расширения, которые будем настраивать отдельно
      horizontalRule: false,
      dropcursor: {
        width: 2,
        color: '#3b82f6',
      },
    }),
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
      placeholder: 'Начни писать здесь…',
      emptyEditorClass: 'is-editor-empty',
      showOnlyWhenEditable: true,
    }),
  ];

  if (!provider || !ydoc) {
    console.warn('Y.js provider или document не инициализированы, работаем в автономном режиме', {
      hasProvider: !!provider,
      hasYdoc: !!ydoc,
    });
    return base;
  }

  console.log('Инициализируем коллаборативные расширения TipTap', {
    hasProvider: !!provider,
    hasYdoc: !!ydoc,
    providerConnected: provider?.isConnected,
  });

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
      }),
    ];
  } catch (error) {
    console.error('Ошибка при инициализации коллаборативных расширений:', error);
    return base;
  }
};
