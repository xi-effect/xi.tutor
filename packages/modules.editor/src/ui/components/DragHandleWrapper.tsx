import { Editor } from '@tiptap/core';
import { Move } from '@xipkg/icons';
import DragHandle from '@tiptap/extension-drag-handle-react';

export const DragHandleWrapper = ({ editor }: { editor: Editor }) => {
  return (
    <DragHandle editor={editor}>
      <div className="cursor-grab active:cursor-grabbing">
        <Move size="sm" className="cursor-pointer" />
      </div>
    </DragHandle>
  );
};
