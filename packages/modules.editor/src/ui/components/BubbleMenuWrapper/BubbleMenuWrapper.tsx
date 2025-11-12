import { BubbleMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';
import { Italic, Bold, Stroke, Underline as UnderlineIcon, Link as LinkIcon } from '@xipkg/icons';
import { BubbleButton } from './BubbleButton';
import { useEditorActive } from '../../../hooks';
import { NodeSelection } from '@tiptap/pm/state';

interface BubbleMenuProps {
  editor: Editor;
  isReadOnly?: boolean;
}

export const BubbleMenuWrapper = ({ editor, isReadOnly }: BubbleMenuProps) => {
  const activeStates = useEditorActive(editor);

  // Блокируем меню если редактор в readonly режиме или не редактируемый
  const shouldShow = !isReadOnly && editor.isEditable !== false;

  if (!shouldShow) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      className="border-gray-10 bg-gray-0 flex gap-1 rounded-lg border p-2 shadow-lg"
      shouldShow={({ editor }) => {
        const { selection } = editor.state;
        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          return false;
        }
        return selection.content().size > 0 && !selection.empty;
      }}
      options={{
        placement: 'top',
      }}
    >
      <BubbleButton ariaLabel="Жирный" type="bold" isActive={activeStates.bold}>
        <Bold />
      </BubbleButton>

      <BubbleButton ariaLabel="Курсив" type="italic" isActive={activeStates.italic}>
        <Italic />
      </BubbleButton>

      <BubbleButton ariaLabel="Подчеркивание" type="underline" isActive={activeStates.underline}>
        <UnderlineIcon />
      </BubbleButton>

      <BubbleButton ariaLabel="Зачеркивание" type="strike" isActive={activeStates.strike}>
        <Stroke />
      </BubbleButton>

      <BubbleButton ariaLabel="Ссылка" type="link" isActive={activeStates.link}>
        <LinkIcon />
      </BubbleButton>
    </BubbleMenu>
  );
};
