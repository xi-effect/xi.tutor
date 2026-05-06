import { Editor, TLShapeId } from 'tldraw';
import { toast } from 'sonner';
import { uploadFileRequest } from 'common.services';

import { nanoid } from 'nanoid';
import { ALLOWED_FILE_MIME_TYPES, FileShape } from '../shapes/file';
import { FILE_SHAPE_HEIGHT, FILE_SHAPE_WIDTH } from '../shapes/file/FileShape';
import { useRetryQueue } from 'common.utils';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_FILE_SHAPES = 20;
export const FILE_ACCEPT = Array.from(ALLOWED_FILE_MIME_TYPES).join(',');

export async function insertFile(
  editor: Editor,
  file: File,
  token: string,
  retryQueue: ReturnType<typeof useRetryQueue>,
) {
  const validationError = validateFile(editor, file);

  if (validationError) {
    toast.error(validationError.title, {
      description: validationError.description,
      duration: 5000,
    });
    return;
  }

  const shapeId = `shape:${nanoid()}` as TLShapeId;
  const viewportCenter = editor.getViewportPageBounds().center;

  editor.createShapes<FileShape>([
    {
      id: shapeId,
      type: 'file',
      x: viewportCenter.x - FILE_SHAPE_WIDTH / 2,
      y: viewportCenter.y - FILE_SHAPE_HEIGHT / 2,
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

  const uploadAndUpdate = async () => {
    const fileId = await uploadFileRequest({ file, token });

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        src: fileId,
        status: 'uploaded',
      },
    });
  };

  try {
    if (!editor.getShape(shapeId)) return; // если shape уже удалён

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        status: 'loading',
      },
    });

    if (!retryQueue.isOnline) {
      editor.updateShape<FileShape>({
        id: shapeId,
        type: 'file',
        props: {
          status: 'offline',
        },
      });
      throw new Error('Отсутствует подключение, файл будет загружен при восстановлении соединения');
    }

    const fileId = await uploadFileRequest({ file, token });

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        src: fileId,
        status: 'uploaded',
      },
    });

    toast.success('Файл успешно загружен', { duration: 5000 });
  } catch (err) {
    if (!editor.getShape(shapeId)) return;

    const isOffline = !retryQueue.isOnline;

    editor.updateShape<FileShape>({
      id: shapeId,
      type: 'file',
      props: {
        status: isOffline ? 'offline' : 'error',
      },
    });

    retryQueue.addToQueue({
      fn: uploadAndUpdate,
      retryCount: 0,
      maxRetries: 5,
    });

    console.error('[insertFile] Upload failed:', err);

    const msg =
      err instanceof Error
        ? err.message
        : isOffline
          ? 'Нет интернета. Загрузка возобновится автоматически'
          : 'Не удалось загрузить файл';
    toast.error('Ошибка загрузки файла', { description: msg, duration: 5000 });
  }
}

function validateFile(editor: Editor, file: File) {
  if (!ALLOWED_FILE_MIME_TYPES.has(file.type)) {
    return {
      title: 'Неподдерживаемый формат',
      description: 'Выберите другой файл с одним из следующих расширений: doc, xls, ppt, pdf',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      title: 'Файл слишком большой',
      description: `Размер файла не должен превышать 5 MiB (сейчас ${(file.size / 1024 / 1024).toFixed(2)} MiB).`,
    };
  }

  const count = editor.getCurrentPageShapes().filter((s) => s.type === 'file').length;

  if (count >= MAX_FILE_SHAPES) {
    return {
      title: 'Лимит файлов',
      description: `На доске может быть не более ${MAX_FILE_SHAPES} файлов.`,
    };
  }

  return null;
}
