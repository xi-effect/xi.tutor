import { FloatingMenu } from '@tiptap/react/menus';
import { useState } from 'react';
import { BubbleMenuWrapper } from './BubbleMenuWrapper/BubbleMenuWrapper';
import { DragHandleWrapper } from './DragHandleWrapper';
import { Editor } from '@tiptap/core';
import { useEditorActive } from '../../hooks/UseEditorActive';

export const EditorToolkit = ({ editor }: { editor: Editor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const activeStates = useEditorActive(editor);

  const handleDragEnd = () => {
    if (editor) {
      const { from } = editor.state.selection;
      editor.commands.setTextSelection(from);
      setIsDragging(false);
    }
  };

  return (
    <>
      <DragHandleWrapper
        editor={editor}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      {!isDragging && <BubbleMenuWrapper editor={editor} activeStates={activeStates} />}
    </>
  );
};
