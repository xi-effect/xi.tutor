import { Editor } from '@ibodr/draw';
import { fileTypeFromBuffer } from 'file-type';
import { insertAudio, insertPdf, insertPresentation } from '../features';
import { insertFile } from '../features/pickAndInsertFile';
import { isFileNameTooLong, MAX_FILENAME_LENGTH, type RetryRequest } from 'common.services';
import { insertImage } from '../features/pickAndInsertImage';
import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_FILE_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  getFileExtension,
  isPdfMime,
} from '../constants/mimeTypes';
import { toast } from 'sonner';
import i18n from 'i18next';

export type AssetType = 'img' | 'pdf' | 'file' | 'audio' | 'presentation';

const EXT_TO_ASSET_TYPE: Record<string, AssetType> = {
  pdf: 'pdf',
  pptx: 'presentation',
  jpg: 'img',
  jpeg: 'img',
  jpx: 'img',
  png: 'img',
  gif: 'img',
  webp: 'img',
  tiff: 'img',
  tif: 'img',
  bmp: 'img',
  ico: 'img',
  avif: 'img',
  mp3: 'audio',
  ogg: 'audio',
  wav: 'audio',
  m4a: 'audio',
  doc: 'file',
  docx: 'file',
  xls: 'file',
  xlsx: 'file',
  ppt: 'file',
  txt: 'file',
  csv: 'file',
  mp4: 'file',
  webm: 'file',
  mov: 'file',
  avi: 'file',
  odp: 'file',
  ods: 'file',
  odt: 'file',
};

const DETECT_BUFFER_LENGTH = 4100;

export function checkAssetType(asset: File): AssetType | null {
  if (ALLOWED_IMAGE_MIME_TYPES.has(asset.type)) return 'img';
  if (ALLOWED_AUDIO_MIME_TYPES.has(asset.type)) return 'audio';
  if (isPdfMime(asset.type) || getFileExtension(asset.name) === 'pdf') return 'pdf';
  if (asset.name.toLowerCase().endsWith('.pptx')) return 'presentation';
  if (ALLOWED_FILE_MIME_TYPES.has(asset.type)) return 'file';

  // Android/Huawei/Яндекс часто отдают пустой type или application/octet-stream
  const ext = getFileExtension(asset.name);
  if (ext && EXT_TO_ASSET_TYPE[ext]) return EXT_TO_ASSET_TYPE[ext];

  return null;
}

async function sniffAssetType(file: File): Promise<AssetType | null> {
  try {
    const buffer = await file.slice(0, DETECT_BUFFER_LENGTH).arrayBuffer();
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected) return null;
    if (isPdfMime(detected.mime)) return 'pdf';
    if (ALLOWED_IMAGE_MIME_TYPES.has(detected.mime)) return 'img';
    if (ALLOWED_AUDIO_MIME_TYPES.has(detected.mime)) return 'audio';
    if (ALLOWED_FILE_MIME_TYPES.has(detected.mime)) {
      return detected.mime.includes('presentationml.presentation') ? 'presentation' : 'file';
    }
    return null;
  } catch {
    return null;
  }
}

export async function insertAsset(
  editor: Editor,
  file: File,
  token: string,
  addToQueue: (request: Omit<RetryRequest, 'id' | 'timestamp'>) => void,
) {
  if (isFileNameTooLong(file.name)) {
    toast.error(i18n.t('toast.fileNameTooLong', { ns: 'board' }), {
      description: i18n.t('toast.fileNameTooLongDesc', {
        ns: 'board',
        max: MAX_FILENAME_LENGTH,
      }),
      duration: 5000,
    });
    return;
  }

  const type = checkAssetType(file) ?? (await sniffAssetType(file));
  switch (type) {
    case 'audio':
      await insertAudio(editor, file, token);
      break;
    case 'file':
      await insertFile(editor, file, token, addToQueue);
      break;
    case 'img':
      await insertImage(editor, file, token);
      break;
    case 'pdf':
      await insertPdf(editor, file, token);
      break;
    case 'presentation':
      await insertPresentation(editor, file, token);
      break;
    default:
      toast.error(i18n.t('toast.unsupportedFileFormat', { ns: 'board' }), {
        description: i18n.t('toast.fileCannotUpload', { ns: 'board', name: file.name }),
        duration: 5000,
      });
      break;
  }
}
