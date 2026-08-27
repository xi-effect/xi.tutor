import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PresentationNodeView } from './PresentationNodeView';

export const PresentationNode = Node.create({
  name: 'presentation',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      fileName: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="presentation"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'presentation' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PresentationNodeView);
  },
});
