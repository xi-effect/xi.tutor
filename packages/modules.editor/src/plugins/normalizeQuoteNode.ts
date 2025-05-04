import { Editor, Transforms, Path, Element } from 'slate';

export const normalizeQuoteNode = (editor: Editor, node: Element, path: Path) => {
  // Make sure quote has exactly two children: text and author
  if (node.children.length !== 2) {
    if (node.children.length < 2) {
      // If there's only one child or empty, add missing children
      if (node.children.length === 0 || node.children[0].type !== 'quoteText') {
        Transforms.insertNodes(
          editor,
          { type: 'quoteText', children: [{ text: '' }] },
          { at: [...path, 0] },
        );
      }

      if (node.children.length <= 1) {
        Transforms.insertNodes(
          editor,
          { type: 'quoteAuthor', children: [{ text: '' }] },
          { at: [...path, node.children.length] },
        );
      }
    } else {
      // If there are more than 2 children, remove the extras
      for (let i = node.children.length - 1; i >= 2; i--) {
        Transforms.removeNodes(editor, { at: [...path, i] });
      }
    }
  }
};
