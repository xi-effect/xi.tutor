import { nanoid } from 'nanoid';
import { Editor, TLAssetId, TLShapeId } from 'tldraw';
import { toast } from 'sonner';
import { myAssetStore } from './imageStore';

const DECODE_ERROR_MESSAGE =
  'Не удалось прочитать изображение. Возможные причины: повреждённый файл, неподдерживаемый формат в этом браузере или вставка из буфера обмена (попробуйте вставить картинку по ссылке через кнопку «Изображение»).';

export type InsertImagePlacement = {
  /** Позиция и размер на доске (в координатах страницы). Если не задано — по центру вьюпорта с натуральными размерами. */
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Вставка изображения с мгновенным preview и последующей загрузкой
 * @param placement — опционально: позиция (x, y) и размер (w, h) на доске
 */
export async function insertImage(
  editor: Editor,
  file: File,
  token: string,
  placement?: InsertImagePlacement,
) {
  if (!file.size) {
    toast.error('Файл пустой', { description: 'Выберите изображение с ненулевым размером.' });
    return;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    const isDecodeError =
      err instanceof Error &&
      (err.name === 'EncodingError' || err.message.includes('cannot be decoded'));
    const message = isDecodeError
      ? DECODE_ERROR_MESSAGE
      : err instanceof Error
        ? err.message
        : 'Неизвестная ошибка';
    toast.error('Ошибка при открытии изображения', {
      description: message,
      duration: 5000,
    });
    throw err; // по-прежнему пробрасываем для логирования в Bugsink, но пользователь уже видит понятное сообщение
  }

  const { width: w, height: h } = bitmap;
  bitmap.close();

  // 2️ Создаём shape + asset с временным data URL
  const tempAssetId = `asset:${nanoid()}` as TLAssetId;
  const shapeId = `shape:${nanoid()}` as TLShapeId;

  const fileAsDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const position = placement
    ? { x: placement.x, y: placement.y }
    : (() => {
        const center = editor.getViewportPageBounds().center;
        return { x: center.x - w / 2, y: center.y - h / 2 };
      })();
  const shapeW = placement ? placement.w : w;
  const shapeH = placement ? placement.h : h;

  editor.createAssets([
    {
      id: tempAssetId,
      type: 'image',
      typeName: 'asset',
      props: {
        src: fileAsDataUrl, // локальный preview
        w,
        h,
        mimeType: file.type,
        name: file.name,
        isAnimated: false,
      },
      meta: {},
    },
  ]);

  editor.createShapes([
    {
      id: shapeId,
      type: 'image',
      x: position.x,
      y: position.y,
      props: {
        w: shapeW,
        h: shapeH,
        assetId: tempAssetId,
      },
    },
  ]);

  (async () => {
    try {
      const uploadAsset = {
        id: tempAssetId,
        type: 'image' as const,
        typeName: 'asset' as const,
        props: {
          src: '',
          w,
          h,
          mimeType: file.type,
          name: file.name,
          isAnimated: false,
        },
        meta: {},
      };

      const { src } = await myAssetStore(token).upload(uploadAsset, file);

      // Обновляем asset.src на настоящий URL после загрузки
      editor.updateAssets([
        {
          id: tempAssetId,
          type: 'image',
          typeName: 'asset',
          props: {
            src, // реальный URL с сервера
            w,
            h,
            mimeType: file.type,
            name: file.name,
            isAnimated: false,
          },
          meta: {},
        },
      ]);
    } catch (err) {
      console.error('Image upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить изображение';
      toast.error('Ошибка загрузки изображения', {
        description: errorMessage,
        duration: 5000,
      });
      editor.deleteShapes([shapeId]);
      editor.deleteAssets([tempAssetId]);
    }
  })();
}
