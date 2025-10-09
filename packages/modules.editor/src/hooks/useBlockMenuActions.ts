import { Editor } from '@tiptap/react';
import { BlockTypeT } from '../types';

export function useBlockMenuActions(editor: Editor | null) {
  const duplicate = () => {
    if (!editor) return;

    const { state } = editor.view;
    const { selection } = state;
    const { $from } = selection;

    const node = $from.parent;
    const nodeType = node.type;

    const newNode = nodeType.create(node.attrs, node.content);

    editor.chain().focus().insertContentAt($from.after(), newNode).run();
  };

  const remove = () => {
    if (!editor) return;

    const { state } = editor.view;
    const { selection } = state;
    const { $from } = selection;

    editor
      .chain()
      .focus()
      .deleteRange({
        from: $from.before(),
        to: $from.after(),
      })
      .run();
  };

  const changeType = (type: BlockTypeT) => {
    if (!editor) return;

    const changeTypeMap: Record<string, () => void> = {
      paragraph: () => editor.chain().focus().setParagraph().run(),
      heading1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      heading2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      heading3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    };

    changeTypeMap[type]?.();
  };

  return {
    duplicate,
    remove,
    changeType,
  };
}
