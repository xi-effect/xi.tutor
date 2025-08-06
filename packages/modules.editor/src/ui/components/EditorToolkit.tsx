import { FloatingMenu } from '@tiptap/react/menus';
import { useState } from 'react';
import { BubbleMenuWrapper } from './BubbleMenuWrapper/BubbleMenuWrapper';
import { DragHandleWrapper } from './DragHandleWrapper';
import { Editor } from '@tiptap/core';
import { useEditorActive } from '../../hooks/UseEditorActive';

export const EditorToolkit = ({ editor }: { editor: Editor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const activeStates = useEditorActive(editor);

  return (
    <>
      <DragHandleWrapper
        editor={editor}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      {!isDragging && <BubbleMenuWrapper editor={editor} activeStates={activeStates} />}
    </>
  );
};
