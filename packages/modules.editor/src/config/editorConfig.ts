import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Placeholder } from '@tiptap/extensions';

export const getExtensions = (
  provider: HocuspocusProvider | undefined,
  userData: { name: string; color: string } = { name: 'Igor', color: '#ff00ff' },
) => {
  const base = [
    StarterKit,
    Underline,
    Link.configure({
      HTMLAttributes: {
        class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer',
      },
      openOnClick: true,
      autolink: true,
    }),
    Placeholder.configure({
      placeholder: 'Начни писать здесь…',
      emptyEditorClass: 'is-editor-empty',
      showOnlyWhenEditable: true,
    }),
  ];

  if (!provider || !provider.document) {
    console.error('Y.js provider или document не инициализированы');
    return base;
  }

  return [
    ...base,
    Collaboration.configure({ document: provider.document }),
    CollaborationCursor.configure({ provider, user: userData }),
  ];
};
