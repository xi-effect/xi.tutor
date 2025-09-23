import { Editor } from '@tiptap/core';
import { Link as LinkIcon } from '@xipkg/icons';
import { BubbleButton } from './BubbleButton';

interface LinkButtonProps {
  editor: Editor;
  isActive: boolean;
}

export const LinkButton = ({ editor, isActive }: LinkButtonProps) => {
  const handleClick = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl || 'https://');

      if (url === null) return;
      if (url === '') {
        editor.chain().focus().unsetLink().run();
        return;
      }

      editor
        .chain()
        .focus()
        .setLink({
          href: url,
          class:
            'text-blue-500 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer',
        })
        .run();
    }
  };

  return (
    <BubbleButton isActive={isActive} onClick={handleClick} ariaLabel="Ссылка">
      <LinkIcon />
    </BubbleButton>
  );
};
