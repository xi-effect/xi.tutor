import {
  CustomElement,
  UploadedFile,
  ImageBlockElement,
  VideoBlockElement,
  FileBlockElement,
  ParagraphElement,
} from '../types';
import { nanoid } from 'nanoid';

type FileType = 'image' | 'video' | 'file';

/**
 * Создает новый узел в зависимости от типа файла
 */
export const createDefaultNode = (type: FileType, file: UploadedFile): CustomElement => {
  switch (type) {
    case 'image':
      return {
        type: 'imageBlock',
        id: nanoid(6),
        url: file.id,
        fileName: file.name,
        children: [{ text: '' }],
      } as ImageBlockElement;
    case 'video':
      return {
        type: 'videoBlock',
        id: nanoid(6),
        url: file.url,
        fileName: file.name,
        children: [{ text: '' }],
      } as VideoBlockElement;
    case 'file':
      return {
        type: 'fileBlock',
        id: nanoid(6),
        url: file.id,
        fileName: file.name,
        size: file.size || 0,
        children: [{ text: '' }],
      } as FileBlockElement;
    default:
      return {
        type: 'paragraph',
        id: nanoid(6),
        children: [{ text: '' }],
      } as ParagraphElement;
  }
};
