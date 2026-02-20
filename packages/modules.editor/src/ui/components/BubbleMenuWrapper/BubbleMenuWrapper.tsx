import { BubbleMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';
import { Italic, Bold, Stroke, Underline as UnderlineIcon, Link as LinkIcon } from '@xipkg/icons';
import type { EditorState } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';
import { BubbleButton } from './BubbleButton';
import { useEditorActive } from '../../../hooks';

interface BubbleMenuProps {
  editor: Editor;
  isReadOnly?: boolean;
}

/** Показывать BubbleMenu только при валидной TextSelection внутри textblock (не doc, не блок без inline). */
function isValidTextSelectionForBubbleMenu(state: EditorState): boolean {
  const { doc, selection } = state;
  if (!(selection instanceof TextSelection) || selection.empty) return false;
  const from = selection.from;
  const to = selection.to;
  if (from === 0 || to === 0) return false;
  try {
    const $from = doc.resolve(from);
    const $to = doc.resolve(to);
    return $from.parent.isTextblock && $to.parent.isTextblock;
  } catch {
    return false;
  }
}

export const BubbleMenuWrapper = ({ editor, isReadOnly }: BubbleMenuProps) => {
  const activeStates = useEditorActive(editor);

  const canShowToolbar = !isReadOnly && editor.isEditable !== false;
  if (!canShowToolbar) return null;

  return (
    <BubbleMenu
      editor={editor}
      className="border-gray-10 bg-gray-0 flex gap-1 rounded-lg border p-2 shadow-lg"
      shouldShow={({ state }) => isValidTextSelectionForBubbleMenu(state)}
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
