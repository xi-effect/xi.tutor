import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PdfNodeView } from './PdfNodeView';

export const PdfNode = Node.create({
  name: 'pdf',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      fileName: { default: '' },
      totalPages: { default: 1 },
      annotations: { default: {} }, // Record<pageNumber, StrokeT[]>
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pdf"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'pdf' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfNodeView);
  },
});
