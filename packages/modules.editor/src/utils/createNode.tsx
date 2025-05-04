/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from 'nanoid';
import { Element } from 'slate';

export const createNode = (props: Partial<Element> & { type: string }): any => {
  const { type, children = [{ text: '' }], ...rest } = props;

  switch (type) {
    case 'paragraph':
      return { type, children, id: nanoid(6), ...rest };
    case 'imageBlock':
      return { type, children, id: nanoid(6), ...rest };
    case 'videoBlock':
      return { type, children, id: nanoid(6), ...rest };
    case 'fileBlock':
      return { type, children, id: nanoid(6), ...rest };
    case 'quote':
      return {
        type,
        id: nanoid(6),
        children: [
          { type: 'quoteText', children: [{ text: '' }] },
          { type: 'quoteAuthor', children: [{ text: '' }] },
        ],
        ...rest,
      };
    case 'tip':
      return { type, children, id: nanoid(6), ...rest };
    case 'code':
      return { type, language: 'typescript', children, id: nanoid(6), ...rest };
    default:
      return { type, children, id: nanoid(6), ...rest };
  }
};
