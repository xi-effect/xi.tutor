import { Editor } from '@tiptap/core';
import { Move, Close, Plus } from '@xipkg/icons';

import DragHandle from '@tiptap/extension-drag-handle-react';
import { Button } from '@xipkg/button';
import { BlockMenu } from './BlockMenu';
import { useState } from 'react';
import { ActiveBlockT } from '../../types';

type DragHandleWrapperPropsT = {
  editor: Editor;
  onDragStart?: () => void;
  onDragEnd: () => void;
  isReadOnly?: boolean;
};

export const DragHandleWrapper = ({
  editor,
  onDragStart,
  onDragEnd,
  isReadOnly,
}: DragHandleWrapperPropsT) => {
  const [activeBlock, setActiveBlock] = useState<ActiveBlockT>();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNodeChange = (data: ActiveBlockT) => {
    if (menuOpen) return;
    if (editor.isActive('image')) return;

    setActiveBlock(data);
  };

  return (
    <DragHandle
      editor={editor}
      className="drag-handle"
      computePositionConfig={{
        placement: 'left-start',
        strategy: 'absolute',
      }}
      onElementDragStart={onDragStart}
      onElementDragEnd={onDragEnd}
      nested
      onNodeChange={handleNodeChange}
    >
      <div className="mr-1 flex items-center gap-2">
        <BlockMenu
          editor={editor}
          isReadOnly={isReadOnly}
          open={menuOpen}
          setOpen={setMenuOpen}
          activeBlock={activeBlock}
        >
          <Button
            className="hover:bg-gray-5 active:bg-gray-5 group h-5 w-5 rounded p-0"
            variant="none"
          >
            {menuOpen ? (
              <Close size="sm" className="fill-gray-80 size-6" />
            ) : (
              <Plus size="sm" className="fill-gray-80 size-6" />
            )}
          </Button>
        </BlockMenu>

        <Button
          className="hover:bg-gray-5 active:bg-gray-5 group h-5 w-5 cursor-grab rounded p-0 active:cursor-grabbing"
          variant="none"
          title="Перетащить блок"
        >
          <Move size="sm" className="fill-gray-80 size-6" />
        </Button>
      </div>
    </DragHandle>
  );
};
