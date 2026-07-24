import { nanoid } from 'nanoid';
import { Editor, DrAssetId, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import { myAssetStore } from './imageStore';
import { resolveShapeCoordinates } from '../utils';
import i18n from 'i18next';

const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MiB

const getDecodeErrorMessage = () => i18n.t('toast.imageReadFailed', { ns: 'board' });

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
    toast.error(i18n.t('toast.fileEmpty', { ns: 'board' }), {
      description: i18n.t('toast.fileEmptyDesc', { ns: 'board' }),
    });
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const message = i18n.t('toast.imageSizeDesc', {
      ns: 'board',
      size: (file.size / 1024 / 1024).toFixed(2),
    });
    toast.error(i18n.t('toast.imageUploadFailed', { ns: 'board' }), {
      description: message,
      duration: 5000,
    });
    throw new Error(message);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    const isDecodeError =
      err instanceof Error &&
      (err.name === 'EncodingError' || err.message.includes('cannot be decoded'));
    const message = isDecodeError
      ? getDecodeErrorMessage()
      : err instanceof Error
        ? err.message
        : i18n.t('toast.unknownError', { ns: 'board' });
    toast.error(i18n.t('toast.imageOpenError', { ns: 'board' }), {
      description: message,
      duration: 5000,
    });
    throw err; // по-прежнему пробрасываем для логирования в Bugsink, но пользователь уже видит понятное сообщение
  }

  const { width: w, height: h } = bitmap;
  bitmap.close();

  // 2️ Создаём shape + asset с временным data URL
  const tempAssetId = `asset:${nanoid()}` as DrAssetId;
  const shapeId = `shape:${nanoid()}` as DrShapeId;

  const fileAsDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const position = placement
    ? { x: placement.x, y: placement.y }
    : resolveShapeCoordinates(editor, w, h);
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

  editor.setSelectedShapes([shapeId]);
  Promise.resolve().then(() => {
    editor.zoomToSelection({ animation: { duration: 200 } });
  });

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

      // Контракт персиста: только storage file id — см. utils/storedFileSrc.ts
      editor.updateAssets([
        {
          id: tempAssetId,
          type: 'image',
          typeName: 'asset',
          props: {
            src,
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
      const errorMessage =
        err instanceof Error ? err.message : i18n.t('toast.imageUploadFailed', { ns: 'board' });
      toast.error(i18n.t('toast.imageUploadError', { ns: 'board' }), {
        description: errorMessage,
        duration: 5000,
      });
      editor.deleteShapes([shapeId]);
      editor.deleteAssets([tempAssetId]);
    }
  })();
}
