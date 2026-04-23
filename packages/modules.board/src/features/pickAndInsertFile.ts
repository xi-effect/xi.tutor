import { Editor, TLShapeId } from 'tldraw';
import { toast } from 'sonner';
import { uploadFileRequest } from 'common.services';

import { nanoid } from 'nanoid';
import { ALLOWED_FILE_MIME_TYPES, FileShape } from '../shapes/file';
import { FILE_SHAPE_HEIGHT, FILE_SHAPE_WIDTH } from '../shapes/file/FileShape';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_FILE_SHAPES = 20;
export const FILE_ACCEPT = Array.from(ALLOWED_FILE_MIME_TYPES).join(',');

export async function insertFile(editor: Editor, file: File, token: string) {
  if (!ALLOWED_FILE_MIME_TYPES.has(file.type)) {
    toast.error('Неподдерживаемый формат', {
      description: 'Выберите файл (doc, xls, ppt и др.).',
      duration: 5000,
    });
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    toast.error('Файл слишком большой', {
      description: `Размер файла не должен превышать 5 MiB (сейчас ${(file.size / 1024 / 1024).toFixed(2)} MiB).`,
      duration: 5000,
    });
    return;
  }

  const existingFileCount = editor.getCurrentPageShapes().filter((s) => s.type === 'file').length;

  if (existingFileCount >= MAX_FILE_SHAPES) {
    toast.error('Лимит файлов', {
      description: `На доске может быть не более ${MAX_FILE_SHAPES} файлов.`,
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

  // Upload in background
  (async () => {
    try {
      const fileId = await uploadFileRequest({ file, token });
      console.log('[insertFile] Upload successful, fileId:', fileId);

      editor.updateShape<FileShape>({
        id: shapeId,
        type: 'file',
        props: {
          src: fileId,
          status: 'uploaded',
        },
      });
    } catch (err) {
      console.error('[insertFile] Upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить файл';
      toast.error('Ошибка загрузки файла', { description: msg, duration: 5000 });
      editor.deleteShapes([shapeId]);
    }
  })();
}
