import { Editor } from '@tiptap/core';
import { fileTypeFromBuffer } from 'file-type';
import { toast } from 'sonner';
import i18n from 'i18next';
import { isFileNameTooLong, MAX_FILENAME_LENGTH, cloneDroppedFile } from 'common.services';
import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_FILE_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  checkEditorMediaType,
  isPdfMime,
  type EditorMediaType,
} from '../const/media';
import { ActiveBlockT } from '../types';
import {
  insertAudioFile,
  insertFileBlock,
  insertImageFile,
  insertPdfFile,
  insertPresentationFile,
} from './insertMedia';

const DETECT_BUFFER_LENGTH = 4100;

async function sniffEditorMediaType(file: File): Promise<EditorMediaType | null> {
  try {
    const buffer = await file.slice(0, DETECT_BUFFER_LENGTH).arrayBuffer();
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected) return null;
    if (isPdfMime(detected.mime)) return 'pdf';
    if (ALLOWED_IMAGE_MIME_TYPES.has(detected.mime) || detected.mime.startsWith('image/')) {
      return 'image';
    }
    if (ALLOWED_AUDIO_MIME_TYPES.has(detected.mime) || detected.mime.startsWith('audio/')) {
      return 'audio';
    }
    if (ALLOWED_FILE_MIME_TYPES.has(detected.mime)) {
      return detected.mime.includes('presentationml.presentation') ? 'presentation' : 'file';
    }
    return null;
  } catch {
    return null;
  }
}

export async function insertEditorAsset(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
) {
  file = cloneDroppedFile(file);

  if (isFileNameTooLong(file.name)) {
    toast.error(i18n.t('upload.fileNameTooLong', { ns: 'editor' }), {
      description: i18n.t('upload.fileNameTooLongDesc', {
        ns: 'editor',
        max: MAX_FILENAME_LENGTH,
      }),
    });
    return false;
  }

  const type = checkEditorMediaType(file) ?? (await sniffEditorMediaType(file));

  try {
    switch (type) {
      case 'image':
        return insertImageFile(editor, file, token, activeBlock);
      case 'audio':
        return insertAudioFile(editor, file, token, activeBlock);
      case 'pdf':
        return insertPdfFile(editor, file, token, activeBlock);
      case 'presentation':
        return insertPresentationFile(editor, file, token, activeBlock);
      case 'file':
        return insertFileBlock(editor, file, token, activeBlock);
      default:
        toast.error(i18n.t('toast.unsupportedFileFormat', { ns: 'editor' }), {
          description: i18n.t('toast.fileCannotUpload', { ns: 'editor', name: file.name }),
        });
        return false;
    }
  } catch (err) {
    console.error(err);
    toast.error(i18n.t('toast.uploadFailed', { ns: 'editor' }));
    return false;
  }
}
