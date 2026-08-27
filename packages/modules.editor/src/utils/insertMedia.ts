import { Editor } from '@tiptap/core';
import { toast } from 'sonner';
import i18n from 'i18next';
import {
  isFileNameTooLong,
  MAX_FILENAME_LENGTH,
  uploadAudioRequest,
  uploadDocumentRequest,
  uploadFileRequest,
} from 'common.services';
import {
  ALLOWED_AUDIO_MIME_TYPES,
  getFileExtension,
  isPdfFile,
  isPresentationFile,
  MAX_AUDIO_BLOCKS,
  MAX_MEDIA_SIZE_BYTES,
  MAX_PDF_BLOCKS,
  MAX_PRESENTATION_BLOCKS,
  withPdfMimeType,
} from '../const/media';
import { checkAudioMagicBytes } from './checkAudioMagicBytes';
import { countNodes } from './countNodes';
import { getAudioDuration } from './getAudioDuration';
import { insertAtomBlock } from './insertAtomBlock';
import { ActiveBlockT } from '../types';
import { DEFAULT_AUDIO_ATTRS } from '../extensions/audio/audioTypes';
import { pdfjsLib } from './pdfjsSetup';

function t(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, { ns: 'editor', ...options });
}

function sizeMiB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

async function getPdfPageCount(file: File): Promise<number> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const pdfDoc = await pdfjsLib.getDocument(objectUrl).promise;
    const pages = pdfDoc.numPages;
    await pdfDoc.destroy();
    return pages || 1;
  } catch {
    return 1;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function insertAudioFile(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
) {
  const ext = getFileExtension(file.name);
  const looksLikeAudio =
    ALLOWED_AUDIO_MIME_TYPES.has(file.type) ||
    (ext !== null && ['mp3', 'ogg', 'wav', 'm4a'].includes(ext));

  if (!looksLikeAudio) {
    toast.error(t('toast.unsupportedFormat'), { description: t('toast.audioFormatDesc') });
    return false;
  }

  if (!(await checkAudioMagicBytes(file))) {
    toast.error(t('toast.audioInvalidFormat'), { description: t('toast.audioInvalidFormatDesc') });
    return false;
  }

  if (isFileNameTooLong(file.name)) {
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    toast.error(t('toast.fileTooLarge'), {
      description: t('toast.audioSizeDesc', { size: sizeMiB(file.size) }),
    });
    return false;
  }

  if (countNodes(editor, 'audio') >= MAX_AUDIO_BLOCKS) {
    toast.error(t('toast.audioLimitTitle'), {
      description: t('toast.audioLimitDesc', { max: MAX_AUDIO_BLOCKS }),
    });
    return false;
  }

  const duration = await getAudioDuration(file);
  const src = await uploadAudioRequest({ file, token });

  return insertAtomBlock(
    editor,
    {
      type: 'audio',
      attrs: {
        src,
        fileName: file.name,
        fileSize: file.size,
        duration,
        ...DEFAULT_AUDIO_ATTRS,
      },
    },
    activeBlock,
  );
}

export async function insertPdfFile(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
) {
  if (!isPdfFile(file)) {
    toast.error(t('toast.unsupportedFormat'), { description: t('toast.pdfFormatDesc') });
    return false;
  }

  file = withPdfMimeType(file);

  if (isFileNameTooLong(file.name)) {
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    toast.error(t('toast.fileTooLarge'), {
      description: t('toast.pdfSizeDesc', { size: sizeMiB(file.size) }),
    });
    return false;
  }

  if (countNodes(editor, 'pdf') >= MAX_PDF_BLOCKS) {
    toast.error(t('toast.pdfLimitTitle'), {
      description: t('toast.pdfLimitDesc', { max: MAX_PDF_BLOCKS }),
    });
    return false;
  }

  const totalPages = await getPdfPageCount(file);
  const src = await uploadDocumentRequest({ file, token });

  return insertAtomBlock(
    editor,
    {
      type: 'pdf',
      attrs: { src, fileName: file.name, totalPages },
    },
    activeBlock,
  );
}

export async function insertPresentationFile(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
) {
  if (!isPresentationFile(file)) {
    toast.error(t('toast.unsupportedFormat'), { description: t('toast.presentationFormatDesc') });
    return false;
  }

  if (isFileNameTooLong(file.name)) {
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    toast.error(t('toast.fileTooLarge'), {
      description: t('toast.presentationSizeDesc', { size: sizeMiB(file.size) }),
    });
    return false;
  }

  if (countNodes(editor, 'presentation') >= MAX_PRESENTATION_BLOCKS) {
    toast.error(t('toast.presentationLimitTitle'), {
      description: t('toast.presentationLimitDesc', { max: MAX_PRESENTATION_BLOCKS }),
    });
    return false;
  }

  const src = await uploadFileRequest({ file, token });

  return insertAtomBlock(
    editor,
    {
      type: 'presentation',
      attrs: { src, fileName: file.name },
    },
    activeBlock,
  );
}
