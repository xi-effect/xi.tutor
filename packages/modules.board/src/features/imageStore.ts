import { uploadImageRequest, uploadFileRequest } from 'common.services';
import { DrAsset } from '@ibodr/draw';
import { toast } from 'sonner';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { registerToken } from '../utils/tokenRegistry';
import { checkAssetType } from '../utils/uploadAsset';
import { ALLOWED_IMAGE_MIME_TYPES } from '../constants/mimeTypes';

export type DrAssetContextT = {
  screenScale: number;
  steppedScreenScale: number;
  dpr: number;
  networkEffectiveType: string | null;
  shouldResolveToOriginal: boolean;
};

export type MediaResponseT = {
  creator_user_id: string;
  id: string;
  kind: string;
  name: string;
};

export type DrAssetStoreT = {
  upload(
    asset: DrAsset,
    file: File,
    abortSignal?: AbortSignal,
  ): Promise<{ src: string; meta?: Record<string, unknown> }>;
  resolve?(asset: DrAsset, ctx: DrAssetContextT): Promise<string | null> | string | null;
};

const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MiB
const MAX_IMAGE_SIDE = 4096; // макс. сторона в пикселях

/** Узнать размеры изображения (без тяжёлых операций) */
async function probeImage(file: File): Promise<{ w: number; h: number; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'eager';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Не удалось декодировать изображение: ${file.name}`));
    };
    img.src = objectUrl;
  });
  return { w: img.naturalWidth, h: img.naturalHeight, objectUrl };
}

/** POST через сервисные функции запросов (без хуков) */
async function postUpload(file: File, token: string) {
  const isImage = file.type.startsWith('image/');

  return isImage
    ? await uploadImageRequest({ file, token })
    : await uploadFileRequest({ file, token });
}

/**
 * Asset store для @ibodr/draw: upload возвращает storage file id (не URL).
 * Контракт персиста — utils/storedFileSrc.ts; URL собирается в resolve().
 */
export const myAssetStore = (token: string) => {
  registerToken(token);

  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async upload(_asset: DrAsset, file: File, _abortSignal?: AbortSignal) {
      const assetType = checkAssetType(file) || 'file';

      if (!file.type.startsWith('image/')) {
        const fileId = await postUpload(file, token);
        return {
          src: fileId,
          meta: {
            customType: assetType,
            fileName: file.name,
            fileSize: file.size,
          },
        };
      }

      // Проверка формата (бэкенд принимает только эти типы)
      if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
        const message = `Неподдерживаемый формат изображения (${file.type}). Допустимы: JPEG, PNG, WebP, GIF, TIFF, BMP, ICO, AVIF, JPX.`;
        toast.error('Не удалось загрузить изображение', { description: message, duration: 5000 });
        throw new Error(message);
      }

      // Проверка размера по оригиналу (макс. 1 MiB)
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const message = `Размер изображения не должен превышать 1 MiB (сейчас ${(file.size / 1024 / 1024).toFixed(2)} MiB).`;
        toast.error('Не удалось загрузить изображение', { description: message, duration: 5000 });
        throw new Error(message);
      }

      // Проверка сторон (макс. 4096×4096)
      let objectUrl: string | null = null;
      try {
        const { w, h, objectUrl: url } = await probeImage(file);
        objectUrl = url;
        if (w > MAX_IMAGE_SIDE || h > MAX_IMAGE_SIDE) {
          const message = `Размер изображения не должен превышать ${MAX_IMAGE_SIDE}×${MAX_IMAGE_SIDE}px (сейчас ${w}×${h}px).`;
          toast.error('Не удалось загрузить изображение', { description: message, duration: 5000 });
          throw new Error(message);
        }
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }

      // Контракт персиста: только id — см. utils/storedFileSrc.ts
      const fileId = await postUpload(file, token);
      return {
        src: fileId,
        meta: {
          customType: assetType,
          fileName: file.name,
          fileSize: file.size,
        },
      };
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async resolve(asset: DrAsset, _ctx: DrAssetContextT) {
      const src = asset.props.src;

      if (!src) return src;

      try {
        return await resolveAssetUrl(src, token);
      } catch (error) {
        // ВАЖНО: возвращаем именно `src`, а не null. Внутри tldraw `useImageOrVideoAsset`
        // есть guard `if (previousUrl.current === url) return`, из-за которого при `url === null`
        // флаг `didAlreadyResolve` не выставляется, и встроенный 500мс debounce между
        // ресолвами не активируется. Каждое движение камеры / culling-тик / ресайз shape тогда
        // дёргает ресолв заново, что генерирует шторм 403-запросов (negative cache успевает
        // истечь через 30 с — и всё начинается снова). Отдавая src, мы получаем максимум
        // один лишний <img src> запрос на shape, после чего CustomImageShape ловит onError
        // и показывает placeholder; повторных axios-запросов не будет из-за negative cache.
        console.error('[myAssetStore.resolve] Ошибка при загрузке изображения:', error);
        return src;
      }
    },
  };
};
