import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from './ImageNodeView';

export const CustomImage = Image.extend({
  selectable: true,
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      annotations: {
        default: [],
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute('data-annotations') || '[]');
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.annotations?.length) return {};
          return { 'data-annotations': JSON.stringify(attributes.annotations) };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView, {
      stopEvent: ({ event }) => {
        // drag/drop всегда отдаём ProseMirror
        if (event.type.startsWith('drag') || event.type === 'drop') return false;
        // клики по тулбару/кнопкам не должны выделять ноду
        return !!(event.target as HTMLElement)?.closest?.('[data-editor-ignore]');
      },
    });
  },
});
