import { Editor } from '@tiptap/core';
import { toast } from 'sonner';
import i18n from 'i18next';
import { isFileNameTooLong, MAX_FILENAME_LENGTH, uploadFileIdRequest } from 'common.services';
import {
  ALLOWED_AUDIO_MIME_TYPES,
  getFileExtension,
  isGenericFile,
  isPdfFile,
  isPresentationFile,
  MAX_AUDIO_BLOCKS,
  MAX_FILE_BLOCKS,
  MAX_PDF_BLOCKS,
  MAX_PRESENTATION_BLOCKS,
  withPdfMimeType,
} from '../const/media';
import { optimizeImage } from './optimizeImage';
import { checkAudioMagicBytes } from './checkAudioMagicBytes';
import { countNodes } from './countNodes';
import { getAudioDuration } from './getAudioDuration';
import { insertAtomBlock } from './insertAtomBlock';
import { tryStartUpload, getMaxFileBytes, getMaxImageBytes } from 'common.subscription';
import {
  beginFileUploadAttempt,
  rejectFileUploadFromError,
  rejectFileUploadFromEvaluation,
  trackFileSizeLimitFromUploadError,
  trackProductLimitReached,
  trackUploadEvaluationLimit,
  type FileUploadAttempt,
  type ProductLimitObjectKind,
} from 'common.services';
import { ActiveBlockT } from '../types';
import { DEFAULT_AUDIO_ATTRS } from '../extensions/audio/audioTypes';
import { pdfjsLib } from './pdfjsSetup';

function t(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, { ns: 'editor', ...options });
}

function assertEditorUpload(
  file: File,
  kind: 'image' | 'other',
  attempt: FileUploadAttempt,
): boolean {
  const result = tryStartUpload(file, kind);
  if (result.ok) return true;
  trackUploadEvaluationLimit(result, file, 'other');
  rejectFileUploadFromEvaluation(attempt, result);
  if (result.reason === 'size') {
    toast.error(t('toast.fileTooLarge'), {
      description: i18n.t('limits.fileTooLarge', {
        ns: 'subscription',
        plan: i18n.t(`plans.${result.planId}`, { ns: 'subscription' }),
        kind: i18n.t(kind === 'image' ? 'limits.fileKindImage' : 'limits.fileKindOther', {
          ns: 'subscription',
        }),
        size: `${Math.round(result.maxBytes / (1024 * 1024))} МБ`,
      }),
    });
  }
  return false;
}

function trackEditorObjectLimit(objectKind: ProductLimitObjectKind) {
  trackProductLimitReached({
    limit_type: 'other',
    source: 'other',
    object_kind: objectKind,
    blocked_on: 'client',
  });
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

export async function insertImageFile(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
  attempt: FileUploadAttempt = beginFileUploadAttempt('other', file),
) {
  file = new File([file], file.name, { type: file.type, lastModified: file.lastModified });

  if (isFileNameTooLong(file.name)) {
    attempt.reject('unknown');
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (!assertEditorUpload(file, 'image', attempt)) {
    return false;
  }

  try {
    const optimized = await optimizeImage(file);
    const src = await uploadFileIdRequest({ file: optimized, token });
    attempt.succeed();
    return insertAtomBlock(
      editor,
      {
        type: 'image',
        attrs: { src, alt: file.name },
      },
      activeBlock,
    );
  } catch (err) {
    console.error(err);
    rejectFileUploadFromError(attempt, err, {
      fileSize: file.size,
      maxBytes: getMaxImageBytes(),
    });
    trackFileSizeLimitFromUploadError(err, file, 'other');
    toast.error(t('toast.imageUploadError'));
    return false;
  }
}

export async function insertAudioFile(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
  attempt: FileUploadAttempt = beginFileUploadAttempt('other', file),
) {
  const ext = getFileExtension(file.name);
  const looksLikeAudio =
    ALLOWED_AUDIO_MIME_TYPES.has(file.type) ||
    (ext !== null && ['mp3', 'ogg', 'wav', 'm4a'].includes(ext));

  if (!looksLikeAudio) {
    attempt.reject('unsupported_type');
    toast.error(t('toast.unsupportedFormat'), { description: t('toast.audioFormatDesc') });
    return false;
  }

  if (!(await checkAudioMagicBytes(file))) {
    attempt.reject('unsupported_type');
    toast.error(t('toast.audioInvalidFormat'), { description: t('toast.audioInvalidFormatDesc') });
    return false;
  }

  if (isFileNameTooLong(file.name)) {
    attempt.reject('unknown');
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (!assertEditorUpload(file, 'other', attempt)) {
    return false;
  }

  if (countNodes(editor, 'audio') >= MAX_AUDIO_BLOCKS) {
    trackEditorObjectLimit('audio');
    attempt.reject('unknown');
    toast.error(t('toast.audioLimitTitle'), {
      description: t('toast.audioLimitDesc', { max: MAX_AUDIO_BLOCKS }),
    });
    return false;
  }

  try {
    const duration = await getAudioDuration(file);
    const src = await uploadFileIdRequest({ file, token });
    attempt.succeed();
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
  } catch (err) {
    rejectFileUploadFromError(attempt, err, {
      fileSize: file.size,
      maxBytes: getMaxFileBytes(),
    });
    trackFileSizeLimitFromUploadError(err, file, 'other');
    throw err;
  }
}

export async function insertPdfFile(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
  attempt: FileUploadAttempt = beginFileUploadAttempt('other', file),
) {
  if (!isPdfFile(file)) {
    attempt.reject('unsupported_type');
    toast.error(t('toast.unsupportedFormat'), { description: t('toast.pdfFormatDesc') });
    return false;
  }

  file = withPdfMimeType(file);

  if (isFileNameTooLong(file.name)) {
    attempt.reject('unknown');
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (!assertEditorUpload(file, 'other', attempt)) {
    return false;
  }

  if (countNodes(editor, 'pdf') >= MAX_PDF_BLOCKS) {
    trackEditorObjectLimit('pdf');
    attempt.reject('unknown');
    toast.error(t('toast.pdfLimitTitle'), {
      description: t('toast.pdfLimitDesc', { max: MAX_PDF_BLOCKS }),
    });
    return false;
  }

  try {
    const totalPages = await getPdfPageCount(file);
    const src = await uploadFileIdRequest({ file, token });
    attempt.succeed();
    return insertAtomBlock(
      editor,
      {
        type: 'pdf',
        attrs: { src, fileName: file.name, totalPages },
      },
      activeBlock,
    );
  } catch (err) {
    rejectFileUploadFromError(attempt, err, {
      fileSize: file.size,
      maxBytes: getMaxFileBytes(),
    });
    trackFileSizeLimitFromUploadError(err, file, 'other');
    throw err;
  }
}

export async function insertPresentationFile(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
  attempt: FileUploadAttempt = beginFileUploadAttempt('other', file),
) {
  if (!isPresentationFile(file)) {
    attempt.reject('unsupported_type');
    toast.error(t('toast.unsupportedFormat'), { description: t('toast.presentationFormatDesc') });
    return false;
  }

  if (isFileNameTooLong(file.name)) {
    attempt.reject('unknown');
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (!assertEditorUpload(file, 'other', attempt)) {
    return false;
  }

  if (countNodes(editor, 'presentation') >= MAX_PRESENTATION_BLOCKS) {
    trackEditorObjectLimit('presentation');
    attempt.reject('unknown');
    toast.error(t('toast.presentationLimitTitle'), {
      description: t('toast.presentationLimitDesc', { max: MAX_PRESENTATION_BLOCKS }),
    });
    return false;
  }

  try {
    const src = await uploadFileIdRequest({ file, token });
    attempt.succeed();
    return insertAtomBlock(
      editor,
      {
        type: 'presentation',
        attrs: { src, fileName: file.name },
      },
      activeBlock,
    );
  } catch (err) {
    rejectFileUploadFromError(attempt, err, {
      fileSize: file.size,
      maxBytes: getMaxFileBytes(),
    });
    trackFileSizeLimitFromUploadError(err, file, 'other');
    throw err;
  }
}

export async function insertFileBlock(
  editor: Editor,
  file: File,
  token: string,
  activeBlock?: ActiveBlockT,
  attempt: FileUploadAttempt = beginFileUploadAttempt('other', file),
) {
  file = new File([file], file.name, { type: file.type, lastModified: file.lastModified });

  if (!isGenericFile(file)) {
    attempt.reject('unsupported_type');
    toast.error(t('toast.unsupportedFormat'), { description: t('toast.fileFormatDesc') });
    return false;
  }

  if (isFileNameTooLong(file.name)) {
    attempt.reject('unknown');
    toast.error(t('upload.fileNameTooLong'), {
      description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    return false;
  }

  if (!assertEditorUpload(file, 'other', attempt)) {
    return false;
  }

  if (countNodes(editor, 'file') >= MAX_FILE_BLOCKS) {
    trackEditorObjectLimit('file');
    attempt.reject('unknown');
    toast.error(t('toast.fileLimitTitle'), {
      description: t('toast.fileLimitDesc', { max: MAX_FILE_BLOCKS }),
    });
    return false;
  }

  try {
    const src = await uploadFileIdRequest({ file, token });
    attempt.succeed();
    return insertAtomBlock(
      editor,
      {
        type: 'file',
        attrs: { src, fileName: file.name, fileSize: file.size },
      },
      activeBlock,
    );
  } catch (err) {
    rejectFileUploadFromError(attempt, err, {
      fileSize: file.size,
      maxBytes: getMaxFileBytes(),
    });
    trackFileSizeLimitFromUploadError(err, file, 'other');
    throw err;
  }
}
