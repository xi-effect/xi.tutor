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
}

export const BubbleMenuWrapper = ({ editor, activeStates }: BubbleMenuProps) => (
  <BubbleMenu
    editor={editor}
    className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
    shouldShow={({ editor }) => editor.view.state.selection.content().size > 0}
  >
    <BubbleButton
      isActive={activeStates.bold}
      onClick={() => editor.chain().focus().toggleBold().run()}
      ariaLabel="Жирный"
    >
      <Bold size="sm" />
    </BubbleButton>

    <BubbleButton
      isActive={activeStates.italic}
      onClick={() => editor.chain().focus().toggleItalic().run()}
      ariaLabel="Курсив"
    >
      <Italic size="sm" />
    </BubbleButton>

    <BubbleButton
      isActive={activeStates.strike}
      onClick={() => editor.chain().focus().toggleStrike().run()}
      ariaLabel="Зачеркивание"
    >
      <Stroke size="sm" />
    </BubbleButton>

    <BubbleButton
      isActive={activeStates.underline}
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      ariaLabel="Подчеркивание"
    >
      <UnderlineIcon size="sm" />
    </BubbleButton>

    <LinkButton editor={editor} isActive={activeStates.link} />
  </BubbleMenu>
);
