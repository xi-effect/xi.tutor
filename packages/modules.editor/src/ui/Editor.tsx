import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import DragHandle from '@tiptap/extension-drag-handle-react';
import StarterKit from '@tiptap/starter-kit';
import { Move } from '@xipkg/icons';

const extensions = [StarterKit];

const content = `
      <p>
        Первый текст
      </p>
      <p>
        Второй текст
      </p>
      <p>
        Третий текст
      </p>
`;

export const Editor = () => {
  const editor = useEditor({
    extensions,
    content,
  });

  return (
    <>
      <DragHandle editor={editor}>
        <div className="cursor-grab active:cursor-grabbing">
          <Move size="sm" className="cursor-pointer" />
        </div>
      </DragHandle>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </>
  );
};
