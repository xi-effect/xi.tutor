import type { Editor } from '@ibodr/draw';
import type { LibraryFile } from 'common.api';
import {
  getLibraryFileRequest,
  type RetryRequest,
  isFileNameTooLong,
  MAX_FILENAME_LENGTH,
} from 'common.services';
import { getLibraryFileDisplayName } from 'pages.materials';
import { toast } from 'sonner';
import i18n from 'i18next';
import { insertAsset } from './uploadAsset';

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
};

function guessMimeType(file: LibraryFile, blob: Blob): string {
  if (blob.type && blob.type !== 'application/octet-stream') {
    return blob.type;
  }
  const ext = file.extension.replace(/^\./, '').toLowerCase();
  return EXT_MIME[ext] ?? 'application/octet-stream';
}

/**
 * Скачивает файл из библиотеки репетитора и вставляет на доску через общий insertAsset.
 */
export async function insertLibraryFileToBoard(
  editor: Editor,
  libraryFile: LibraryFile,
  token: string,
  addToQueue: (request: Omit<RetryRequest, 'id' | 'timestamp'>) => void,
): Promise<void> {
  const displayName = getLibraryFileDisplayName(libraryFile);

  if (isFileNameTooLong(displayName)) {
    toast.error(i18n.t('toast.fileNameTooLong', { ns: 'board' }), {
      description: i18n.t('toast.fileNameTooLongDesc', {
        ns: 'board',
        max: MAX_FILENAME_LENGTH,
      }),
      duration: 5000,
    });
    return;
  }

  const result = await getLibraryFileRequest(libraryFile.id);
  if (result.status !== 200 || !result.data) {
    toast.error(i18n.t('navbar.cloudInsertFailed', { ns: 'board' }), { duration: 5000 });
    return;
  }

  const mime = guessMimeType(libraryFile, result.data);
  const file = new File([result.data], displayName, {
    type: mime,
    lastModified: Date.now(),
  });

  await insertAsset(editor, file, token, addToQueue);
}
