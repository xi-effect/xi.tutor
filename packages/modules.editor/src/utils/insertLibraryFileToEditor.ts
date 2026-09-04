import type { Editor } from '@tiptap/core';
import {
  getLibraryFileRequest,
  isFileNameTooLong,
  MAX_FILENAME_LENGTH,
  type LibraryFile,
} from 'common.services';
import { getLibraryFileDisplayName } from 'pages.materials';
import { toast } from 'sonner';
import i18n from 'i18next';
import type { ActiveBlockT } from '../types';
import { insertEditorAsset } from './insertEditorAsset';

const EXT_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  csv: 'text/csv',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
};

function guessMimeType(file: LibraryFile, blob: Blob): string {
  if (blob.type && blob.type !== 'application/octet-stream') {
    return blob.type;
  }
  const ext = file.extension.replace(/^\./, '').toLowerCase();
  return EXT_MIME[ext] ?? 'application/octet-stream';
}

export async function insertLibraryFileToEditor(
  editor: Editor,
  libraryFile: LibraryFile,
  token: string,
  activeBlock?: ActiveBlockT,
): Promise<void> {
  const displayName = getLibraryFileDisplayName(libraryFile);

  if (isFileNameTooLong(displayName)) {
    toast.error(i18n.t('upload.fileNameTooLong', { ns: 'editor' }), {
      description: i18n.t('upload.fileNameTooLongDesc', {
        ns: 'editor',
        max: MAX_FILENAME_LENGTH,
      }),
    });
    return;
  }

  const result = await getLibraryFileRequest(libraryFile.id);
  if (result.status !== 200 || !result.data) {
    toast.error(i18n.t('toast.cloudInsertFailed', { ns: 'editor' }));
    return;
  }

  const mime = guessMimeType(libraryFile, result.data);
  const file = new File([result.data], displayName, {
    type: mime,
    lastModified: Date.now(),
  });

  await insertEditorAsset(editor, file, token, activeBlock);
}
