import { ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { CodeBlockNodeView } from './CodeBlockNodeView';

const lowlight = createLowlight(common);

export const CustomCodeNode = CodeBlockLowlight.configure({
  lowlight,
  enableTabIndentation: true,
  defaultLanguage: 'plaintext',
}).extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },
});
