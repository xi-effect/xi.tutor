import { Editor } from '@ibodr/draw';
import { insertAudio, insertPdf } from '../features';
import { insertFile } from '../features/pickAndInsertFile';
import { RetryRequest } from 'common.services';
import { insertImage } from '../features/pickAndInsertImage';
import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_FILE_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
} from '../constants/mimeTypes';
import { toast } from 'sonner';

export type AssetType = 'img' | 'pdf' | 'file' | 'audio';

export function checkAssetType(asset: File): AssetType | null {
  if (ALLOWED_IMAGE_MIME_TYPES.has(asset.type)) return 'img';
  if (ALLOWED_AUDIO_MIME_TYPES.has(asset.type)) return 'audio';
  if (asset.type === 'application/pdf') return 'pdf';
  if (ALLOWED_FILE_MIME_TYPES.has(asset.type)) return 'file';

  return null;
}

export function insertAsset(
  editor: Editor,
  file: File,
  token: string,
  addToQueue: (request: Omit<RetryRequest, 'id' | 'timestamp'>) => void,
) {
  const type = checkAssetType(file);
  switch (type) {
    case 'audio':
      insertAudio(editor, file, token);
      break;
    case 'file':
      insertFile(editor, file, token, addToQueue);
      break;
    case 'img':
      insertImage(editor, file, token);
      break;
    case 'pdf':
      insertPdf(editor, file, token);
      break;
    default:
      toast.error('Неподдерживаемый формат файла', {
        description: `Файл «${file.name}» нельзя загрузить на доску.`,
        duration: 5000,
      });
      break;
  }
}
