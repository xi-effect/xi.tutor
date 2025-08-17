import { Editor } from '@tiptap/core';
import { Move } from '@xipkg/icons';
import DragHandle from '@tiptap/extension-drag-handle-react';

export const DragHandleWrapper = ({
  editor,
  onDragStart,
  onDragEnd,
}: {
  editor: Editor;
  onDragStart: () => void;
  onDragEnd: () => void;
}) => {
  return (
    <DragHandle editor={editor}>
      <div
        className="cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
        onDragEnd={(e) => {
          e.preventDefault();
          onDragEnd();
        }}
      >
        <Move size="sm" className="cursor-pointer" />
      </div>
    </DragHandle>
  );
};
