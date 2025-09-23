import { BubbleMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';
import { Italic, Bold, Stroke, Underline as UnderlineIcon } from '@xipkg/icons';
import { BubbleButton } from './BubbleButton';
import { LinkButton } from './LinkButton';

interface BubbleMenuProps {
  editor: Editor;
  activeStates: {
    bold: boolean;
    italic: boolean;
    strike: boolean;
    underline: boolean;
    link: boolean;
  };
  isReadOnly?: boolean;
}

export const BubbleMenuWrapper = ({ editor, activeStates, isReadOnly }: BubbleMenuProps) => {
  if (isReadOnly) return null;

  return (
    <BubbleMenu
      editor={editor}
      className="border-gray-10 bg-gray-0 flex gap-1 rounded-lg border p-2 shadow-lg"
      shouldShow={({ editor }) => {
        const { selection } = editor.state;
        return selection.content().size > 0 && !selection.empty;
      }}
      options={{
        placement: 'top',
      }}
    >
      <BubbleButton
        isActive={activeStates.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
        ariaLabel="Жирный"
      >
        <Bold />
      </BubbleButton>

      <BubbleButton
        isActive={activeStates.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        ariaLabel="Курсив"
      >
        <Italic />
      </BubbleButton>

      <BubbleButton
        isActive={activeStates.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        ariaLabel="Подчеркивание"
      >
        <UnderlineIcon />
      </BubbleButton>

      <BubbleButton
        isActive={activeStates.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        ariaLabel="Зачеркивание"
      >
        <Stroke />
      </BubbleButton>

      <LinkButton editor={editor} isActive={activeStates.link} />
    </BubbleMenu>
  );
};
