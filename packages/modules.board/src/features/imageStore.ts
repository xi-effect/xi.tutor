import { uploadImageRequest, uploadFileRequest } from 'common.services';
import { getFileUrl } from 'common.api';
import { TLAsset } from 'tldraw';
import { toast } from 'sonner';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { registerToken, getRegisteredTokens } from '../utils/tokenRegistry';

export type TLAssetContextT = {
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

export type TLAssetStoreT = {
  upload(
    asset: TLAsset,
    file: File,
    abortSignal?: AbortSignal,
  ): Promise<{ src: string; meta?: Record<string, unknown> }>;
  resolve?(asset: TLAsset, ctx: TLAssetContextT): Promise<string | null> | string | null;
};

// Форматы, которые принимает бэкенд POST .../file-kinds/image/files/ (конвертирует в webp сам)
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpx',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/bmp',
  'image/x-icon',
  'image/avif',
]);

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

/** Основной store — упрощенная версия */
export const myAssetStore = (token: string) => {
  registerToken(token);

  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async upload(_asset: TLAsset, file: File, _abortSignal?: AbortSignal) {
      if (!file.type.startsWith('image/')) {
        const fileId = await postUpload(file, token);
        return { src: fileId };
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

      const fileId = await postUpload(file, token);
      const src = getFileUrl(fileId);
      return { src };
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async resolve(asset: TLAsset, _ctx: TLAssetContextT) {
      const src = asset.props.src;
      if (!src) return src;

      try {
        return await resolveAssetUrl(src, token);
      } catch (primaryError) {
        // Cross-board fallback 1: use sourceToken from clipboard meta
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sourceToken = (asset.meta as Record<string, any>)?.sourceToken as string | undefined;
        if (sourceToken && sourceToken !== token) {
          try {
            return await resolveAssetUrl(src, sourceToken);
          } catch {
            /* continue to registry fallback */
          }
        }

        // Cross-board fallback 2: try all known tokens from the registry
        for (const altToken of getRegisteredTokens()) {
          if (altToken === token || altToken === sourceToken) continue;
          try {
            return await resolveAssetUrl(src, altToken);
          } catch {
            continue;
          }
        }

        console.error('[myAssetStore.resolve] Ошибка при загрузке изображения:', primaryError);
        return src;
      }
    },
  };
};
