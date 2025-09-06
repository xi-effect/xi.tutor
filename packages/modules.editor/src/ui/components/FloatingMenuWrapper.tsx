import React from 'react';
import { FloatingMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';

type FloatingMenuToolkitProps = {
  editor: Editor;
};

export const FloatingMenuWrapper: React.FC<FloatingMenuToolkitProps> = ({ editor }) => {
  return <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>;
};
