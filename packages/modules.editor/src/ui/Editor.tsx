import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import content from '../const/content';
import { useEditorActive } from '../hooks/UseEditorActive';
import { BubbleMenuWrapper } from './components/BubbleMenuWrapper/BubbleMenuWrapper';
import { extensions } from '../config/editorConfig';
import { DragHandleWrapper } from './components/DragHandleWrapper';

export const Editor = () => {
  const editor = useEditor({
    extensions,
    content,
  });

  const activeStates = useEditorActive(editor);

  if (!editor) return null;

  return (
    <>
      <DragHandleWrapper editor={editor} />
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenuWrapper editor={editor} activeStates={activeStates} />
    </>
  );
};
