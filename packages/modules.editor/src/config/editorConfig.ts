import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

export const extensions = [
  StarterKit,
  Underline,
  Link.configure({
    HTMLAttributes: {
      class:
        'text-blue-500 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer',
    },
    openOnClick: true,
    autolink: true,
  }),
];
