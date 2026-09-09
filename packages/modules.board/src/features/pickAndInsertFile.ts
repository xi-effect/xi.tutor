import { Editor, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import {
  deleteFileFromDB,
  saveFileToDB,
  uploadFileIdRequest,
  type RetryRequest,
} from 'common.services';
import { nanoid } from 'nanoid';
import { FileShape } from '../shapes/file';
import { FILE_SHAPE_HEIGHT, FILE_SHAPE_WIDTH } from '../shapes/file/FileShape';
import { ALLOWED_FILE_MIME_TYPES } from '../constants/mimeTypes';
import { resolveShapeCoordinates } from '../utils';
import {
  getBoardUploadErrorToast,
  isNonRetryableBoardUploadError,
} from '../utils/boardUploadError';
import { tryStartUpload } from 'common.subscription';
import { getMaxFileBytes } from 'common.subscription';
import { getPlanSizeLimitMessage } from '../utils/planUploadLimit';
import {
  beginFileUploadAttempt,
  rejectFileUploadFromError,
  rejectFileUploadFromEvaluation,
  trackBoardObjectsLimitReached,
  trackUploadEvaluationLimit,
} from 'common.utils';
import i18n from 'i18next';

const MAX_FILE_SHAPES = 20;
export const FILE_ACCEPT = Array.from(ALLOWED_FILE_MIME_TYPES).join(',');

export async function insertFile(
  editor: Editor,
  file: File,
  token: string,
  addToQueue: (request: Omit<RetryRequest, 'id' | 'timestamp'>) => void,
) {
  const attempt = beginFileUploadAttempt('board', file);
  const validationError = validateFile(editor, file, attempt);

  if (validationError) {
    if (validationError.title) {
      toast.error(validationError.title, {
        description: validationError.description,
        duration: 5000,
      });
    }
    return;
  }

  const shapeId = `shape:${nanoid()}` as DrShapeId;
  const coordinates = resolveShapeCoordinates(editor, FILE_SHAPE_WIDTH, FILE_SHAPE_HEIGHT);

  editor.createShapes<FileShape>([
    {
      id: shapeId,
      type: 'file',
      x: coordinates.x,
      y: coordinates.y,
      props: {
        src: '',
        fileName: file.name,
        w: FILE_SHAPE_WIDTH,
        h: FILE_SHAPE_HEIGHT,
        fileSize: file.size,
        status: 'loading',
      },
    },
  ]);

  editor.setSelectedShapes([shapeId]);
  Promise.resolve().then(() => {
    editor.zoomToSelection({ animation: { duration: 200 } });
  });

  await saveFileToDB(shapeId, { file, token });

  try {
    if (!editor.getShape(shapeId)) {
      attempt.reject('unknown');
      return;
    }

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        status: 'loading',
      },
    });

    const fileId = await uploadFileIdRequest({ file, token });

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        src: fileId,
        status: 'uploaded',
      },
    });

    attempt.succeed();
    toast.success(i18n.t('toast.fileUploadSuccess', { ns: 'board' }), { duration: 5000 });
  } catch (err) {
    rejectFileUploadFromError(attempt, err);
    if (!editor.getShape(shapeId)) return;
    const isOffline = !navigator.onLine;

    if (!isOffline && isNonRetryableBoardUploadError(err, file, getMaxFileBytes())) {
      editor.deleteShapes([shapeId]);
      void deleteFileFromDB(shapeId);
      const { title, description } = getBoardUploadErrorToast(err, file, getMaxFileBytes(), {
        sizeDescKey: 'toast.fileSizeDesc',
        failedTitleKey: 'toast.fileUploadError',
        failedDescKey: 'toast.fileUploadFailed',
      });
      toast.error(title, { description, duration: 5000 });
      return;
    }

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        status: isOffline ? 'offline' : 'error',
      },
    });

    addToQueue({
      shapeId,
      retryCount: 0,
      maxRetries: 5,
      token,
    });

    console.error('[insertFile] Upload failed:', err);

    const { title, description } = isOffline
      ? {
          title: i18n.t('toast.fileUploadError', { ns: 'board' }),
          description: i18n.t('toast.offlineUpload', { ns: 'board' }),
        }
      : getBoardUploadErrorToast(err, file, getMaxFileBytes(), {
          sizeDescKey: 'toast.fileSizeDesc',
          failedTitleKey: 'toast.fileUploadError',
          failedDescKey: 'toast.fileUploadFailed',
        });
    toast.error(title, {
      description,
      duration: 5000,
    });
  }
}

function validateFile(
  editor: Editor,
  file: File,
  attempt: ReturnType<typeof beginFileUploadAttempt>,
) {
  if (!ALLOWED_FILE_MIME_TYPES.has(file.type)) {
    attempt.reject('unsupported_type');
    return {
      title: i18n.t('toast.unsupportedFormat', { ns: 'board' }),
      description: i18n.t('toast.fileFormatDesc', { ns: 'board' }),
    };
  }

  const evaluation = tryStartUpload(file, 'other');
  if (!evaluation.ok) {
    trackUploadEvaluationLimit(evaluation, file, 'board');
    rejectFileUploadFromEvaluation(attempt, evaluation);
    if (evaluation.reason === 'storage') {
      return { title: '', description: '' };
    }
    return {
      title: i18n.t('toast.fileTooLarge', { ns: 'board' }),
      description: getPlanSizeLimitMessage('other'),
    };
  }

  const count = editor.getCurrentPageShapes().filter((s) => s.type === 'file').length;

  if (count >= MAX_FILE_SHAPES) {
    trackBoardObjectsLimitReached('file');
    attempt.reject('unknown');
    return {
      title: i18n.t('toast.fileLimitTitle', { ns: 'board' }),
      description: i18n.t('toast.fileLimitDesc', { ns: 'board', max: MAX_FILE_SHAPES }),
    };
  }

  return null;
}
