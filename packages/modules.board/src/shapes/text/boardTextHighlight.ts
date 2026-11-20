import Highlight from '@tiptap/extension-highlight';
import { renderHighlightHTML } from './highlightStyle';

/**
 * Заменяет стандартный highlight: у метки появляются цвет палитры и прозрачность.
 * Старые метки без атрибутов остаются жёлтыми за счёт CSS редактора.
 */
export const BoardTextHighlight = Highlight.extend({
  priority: 1100,
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-color'),
        renderHTML: (attributes: { color?: string | null; opacity?: string | number | null }) =>
          renderHighlightHTML(attributes),
      },
      opacity: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-opacity'),
        renderHTML: () => ({}),
      },
    };
  },
});
