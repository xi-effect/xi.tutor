import React, { useState } from 'react';
import { useEditorActive } from '../../hooks/useEditorActive';
import { BubbleMenuWrapper } from './BubbleMenuWrapper/BubbleMenuWrapper';
import { DragHandleWrapper } from './DragHandleWrapper';
import { FloatingMenuWrapper } from './FloatingMenuWrapper';
import { Editor } from '@tiptap/core';

type EditorToolkitProps = {
  editor: Editor;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
};

export const EditorToolkit: React.FC<EditorToolkitProps> = ({
  editor,
  undo,
  redo,
  canUndo,
  canRedo,
  isReadOnly,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const activeStates = useEditorActive(editor);

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

      <FloatingMenuWrapper
        editor={editor}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isReadOnly={isReadOnly}
      />

      {!isDragging && (
        <BubbleMenuWrapper editor={editor} activeStates={activeStates} isReadOnly={isReadOnly} />
      )}
    </>
  );
};
