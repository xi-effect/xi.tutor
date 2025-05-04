import { CustomElement, UploadedFile } from '@xipkg/slatetypes';
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
      };
    case 'video':
      return {
        type: 'videoBlock',
        id: nanoid(6),
        url: file.url,
        fileName: file.name,
        children: [{ text: '' }],
      };
    case 'file':
      return {
        type: 'fileBlock',
        id: nanoid(6),
        url: file.id,
        fileName: file.name,
        size: file.size || 0,
        children: [{ text: '' }],
      };
    default:
      return {
        type: 'paragraph',
        id: nanoid(6),
        children: [{ text: '' }],
      };
  }
};
