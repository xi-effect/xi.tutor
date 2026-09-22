import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ActivityNodeView } from './ActivityNodeView';

export const ActivityNode = Node.create({
  name: 'activity',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      kind: { default: 'gap-text' },
      title: { default: '' },
      definition: { default: '' },
      attempt: { default: '' },
      checkStatus: { default: 'idle' },
      studentAccess: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="activity"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'activity' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ActivityNodeView);
  },
});
