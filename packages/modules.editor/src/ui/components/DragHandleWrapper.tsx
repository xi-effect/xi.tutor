import { Editor } from '@tiptap/core';
import { Move, Close, Plus } from '@xipkg/icons';

import DragHandle from '@tiptap/extension-drag-handle-react';
import { Button } from '@xipkg/button';
import { BlockMenu } from './BlockMenu';

export const DragHandleWrapper = ({
  editor,
  onDragStart,
  onDragEnd,
}: {
  editor: Editor;
  onDragStart: () => void;
  onDragEnd: () => void;
  isReadOnly?: boolean;
}) => {
  return (
    <DragHandle
      editor={editor}
      computePositionConfig={{ placement: 'left-start', strategy: 'absolute' }}
      onElementDragStart={onDragStart}
      onElementDragEnd={onDragEnd}
      nested
    >
      <div className="mr-1 flex items-center gap-2">
        <BlockMenu>
          {({ open }) => (
            <Button
              className="hover:bg-gray-5 active:bg-gray-5 group h-5 w-5 rounded p-0"
              variant="none"
            >
              {open ? (
                <Close size="sm" className="size-6" />
              ) : (
                <Plus size="sm" className="size-6" />
              )}
            </Button>
          )}
        </BlockMenu>

        <Button
          className="hover:bg-gray-5 active:bg-gray-5 group h-5 w-5 cursor-grab rounded p-0 active:cursor-grabbing"
          variant="none"
          title="Перетащить блок"
        >
          <Move size="sm" className="size-6" />
        </Button>
      </div>
    </DragHandle>
  );
};
