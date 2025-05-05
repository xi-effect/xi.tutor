/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from 'nanoid';
import { Descendant } from 'slate';
import {
  CustomElement,
  ParagraphElement,
  ImageBlockElement,
  VideoBlockElement,
  FileBlockElement,
  QuoteElement,
  TipElement,
  CodeElement,
} from '../types';

type CreateNodeProps = {
  type: string;
  children?: Descendant[];
  [key: string]: any;
};

export const createNode = (props: CreateNodeProps): CustomElement => {
  const { type, children = [{ text: '' }], ...rest } = props;

  switch (type) {
    case 'paragraph':
      return { type, children, id: nanoid(6), ...rest } as ParagraphElement;
    case 'imageBlock':
      return { type, children, id: nanoid(6), ...rest } as ImageBlockElement;
    case 'videoBlock':
      return { type, children, id: nanoid(6), ...rest } as VideoBlockElement;
    case 'fileBlock':
      return { type, children, id: nanoid(6), ...rest } as FileBlockElement;
    case 'quote':
      return {
        type,
        id: nanoid(6),
        children: [
          { type: 'quoteText', children: [{ text: '' }], id: nanoid(6) },
          { type: 'quoteAuthor', children: [{ text: '' }], id: nanoid(6) },
        ],
        ...rest,
      } as QuoteElement;
    case 'tip':
      return { type, children, id: nanoid(6), ...rest } as TipElement;
    case 'code':
      return { type, language: 'typescript', children, id: nanoid(6), ...rest } as CodeElement;
    default:
      return { type, children, id: nanoid(6), ...rest } as CustomElement;
  }
};
