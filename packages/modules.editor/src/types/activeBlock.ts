import { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from 'prosemirror-model';

export type ActiveBlockT = {
  editor: Editor;
  node: ProseMirrorNode | null;
  pos: number;
};
