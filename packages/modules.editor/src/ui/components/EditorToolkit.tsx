import React, { useState } from 'react';
import { BubbleMenuWrapper } from './BubbleMenuWrapper/BubbleMenuWrapper';
import { DragHandleWrapper } from './DragHandleWrapper';
import { FloatingMenuWrapper } from './FloatingMenuWrapper';
import { Editor } from '@tiptap/core';

type EditorToolkitProps = {
  editor: Editor;
  isReadOnly: boolean;
};

export const EditorToolkit: React.FC<EditorToolkitProps> = ({ editor, isReadOnly }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = () => {
    const from = editor.state.selection.from;
    editor.commands.setTextSelection(from);
    setIsDragging(false);
  };

  return (
    <>
      <DragHandleWrapper
        editor={editor}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        isReadOnly={isReadOnly}
      />
      {/* <FloatingMenuWrapper editor={editor} isReadOnly={isReadOnly} /> */}

      {!isDragging && <BubbleMenuWrapper editor={editor} isReadOnly={isReadOnly} />}
    </>
  );
};
