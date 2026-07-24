import { Editor, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import { uploadFileRequest } from 'common.services';
import { nanoid } from 'nanoid';
import { FileShape } from '../shapes/file';
import { FILE_SHAPE_HEIGHT, FILE_SHAPE_WIDTH } from '../shapes/file/FileShape';
import { saveFileToDB } from 'common.services';
import { type RetryRequest } from 'common.services';
import { ALLOWED_FILE_MIME_TYPES } from '../constants/mimeTypes';
import { resolveShapeCoordinates } from '../utils';
import i18n from 'i18next';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_FILE_SHAPES = 20;
export const FILE_ACCEPT = Array.from(ALLOWED_FILE_MIME_TYPES).join(',');

export async function insertFile(
  editor: Editor,
  file: File,
  token: string,
  addToQueue: (request: Omit<RetryRequest, 'id' | 'timestamp'>) => void,
) {
  const validationError = validateFile(editor, file);

  if (validationError) {
    toast.error(validationError.title, {
      description: validationError.description,
      duration: 5000,
    });
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
    if (!editor.getShape(shapeId)) return; // если shape уже удалён

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        status: 'loading',
      },
    });

    const fileId = await uploadFileRequest({ file, token });

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        src: fileId,
        status: 'uploaded',
      },
    });

    toast.success(i18n.t('toast.fileUploadSuccess', { ns: 'board' }), { duration: 5000 });
  } catch (err) {
    if (!editor.getShape(shapeId)) return;
    const isOffline = !navigator.onLine;

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

    const msg = isOffline
      ? i18n.t('toast.offlineUpload', { ns: 'board' })
      : err instanceof Error
        ? err.message
        : i18n.t('toast.fileUploadFailed', { ns: 'board' });
    toast.error(i18n.t('toast.fileUploadError', { ns: 'board' }), {
      description: msg,
      duration: 5000,
    });
  }
}

function validateFile(editor: Editor, file: File) {
  if (!ALLOWED_FILE_MIME_TYPES.has(file.type)) {
    return {
      title: i18n.t('toast.unsupportedFormat', { ns: 'board' }),
      description: i18n.t('toast.fileFormatDesc', { ns: 'board' }),
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      title: i18n.t('toast.fileTooLarge', { ns: 'board' }),
      description: i18n.t('toast.fileSizeDesc', {
        ns: 'board',
        size: (file.size / 1024 / 1024).toFixed(2),
      }),
    };
  }

  const count = editor.getCurrentPageShapes().filter((s) => s.type === 'file').length;

  if (count >= MAX_FILE_SHAPES) {
    return {
      title: i18n.t('toast.fileLimitTitle', { ns: 'board' }),
      description: i18n.t('toast.fileLimitDesc', { ns: 'board', max: MAX_FILE_SHAPES }),
    };
  }

  return null;
}
