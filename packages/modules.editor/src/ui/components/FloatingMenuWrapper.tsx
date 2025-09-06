import React from 'react';
import { FloatingMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';
import { BubbleButton } from './BubbleMenuWrapper/BubbleButton';

type FloatingMenuToolkitProps = {
  editor: Editor;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
};

export const FloatingMenuWrapper: React.FC<FloatingMenuToolkitProps> = ({
  editor,
  undo,
  redo,
  canUndo,
  canRedo,
  isReadOnly,
}) => {
  const handleSafeUndo = () => {
    if (!isReadOnly && canUndo) {
      editor.chain().focus();
      undo();
    }
  };

  const handleSafeRedo = () => {
    if (!isReadOnly && canRedo) {
      editor.chain().focus();
      redo();
    }
  };

  return (
    <FloatingMenu editor={editor}>
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-md">
        <span className={!canUndo || isReadOnly ? 'pointer-events-none opacity-50' : ''}>
          <BubbleButton isActive={false} onClick={handleSafeUndo} ariaLabel="Отменить">
            ⇤
          </BubbleButton>
        </span>
        <span className={!canRedo || isReadOnly ? 'pointer-events-none opacity-50' : ''}>
          <BubbleButton isActive={false} onClick={handleSafeRedo} ariaLabel="Повторить">
            ⇥
          </BubbleButton>
        </span>
      </div>
    </FloatingMenu>
  );
};
