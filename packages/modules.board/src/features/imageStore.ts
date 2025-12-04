import { uploadImageRequest, uploadFileRequest } from 'common.services';
import { getAxiosInstance } from 'common.config';
import { TLAsset } from 'tldraw';
import { toast } from 'sonner';
import { convertToWebp } from '../utils';

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

export type UploadOptions = {
  maxSide?: number; // лимит по стороне (px)
  maxMegapixels?: number; // лимит по общему числу пикселей (MP)
  quality?: number; // качество WebP 0..1
};

export type TLAssetStoreT = {
  upload(
    asset: TLAsset,
    file: File,
    abortSignal?: AbortSignal,
  ): Promise<{ src: string; meta?: Record<string, unknown> }>;
  resolve?(asset: TLAsset, ctx: TLAssetContextT): Promise<string | null> | string | null;
};

// Загрузка будет выполняться через filesApiConfig (UploadImage / UploadAttachment)

const DEFAULT_OPTIONS: UploadOptions = {
  maxSide: 4096, // лимит по стороне
  maxMegapixels: 8.0, // лимит мегапикселей
  quality: 100, // качество
};

// Кеш blob URL для уже загруженных изображений (по исходному src)
const blobUrlCache = new Map<string, string>();

/** Узнать исходные размеры (без тяжелых операций) */
async function probeImage(
  file: File,
): Promise<{ w: number; h: number; objectUrl: string; img: HTMLImageElement }> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'eager';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`The source image cannot be decoded: ${file.name}`));
    };
    img.src = objectUrl;
  });
  return { w: img.naturalWidth, h: img.naturalHeight, objectUrl, img };
}

// Удалены все функции обработки изображений - теперь только простая загрузка

/** POST через сервисные функции запросов (без хуков) */
async function postUpload(file: File, token: string) {
  const isImage = file.type.startsWith('image/');
  if (isImage) {
    return await uploadImageRequest({ file, token });
  }
  return await uploadFileRequest({ file, token });
}

/** Основной store — упрощенная версия */
export const myAssetStore = (token: string) => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async upload(_asset: TLAsset, file: File, _abortSignal?: AbortSignal) {
      const opts = { ...DEFAULT_OPTIONS };

      // Не изображение — просто загрузка
      if (!file.type.startsWith('image/')) {
        const urlUploaded = await postUpload(file, token);
        return { src: urlUploaded };
      }

      const { file: imageToUpload } = await convertToWebp(file);

      let objectUrl: string | null = null;

      try {
        // 1) Проверяем размеры изображения
        const { w: srcW, h: srcH, objectUrl: url } = await probeImage(imageToUpload);
        objectUrl = url;

        // 2) Проверяем лимиты
        const exceedsSideLimit = srcW > opts.maxSide! || srcH > opts.maxSide!;
        const exceedsMegaPixelLimit = (srcW * srcH) / 1_000_000 > opts.maxMegapixels!;

        if (exceedsSideLimit || exceedsMegaPixelLimit) {
          const message = `Изображение слишком большое (${srcW}×${srcH}px). Максимальный размер: ${opts.maxSide}×${opts.maxSide}px или ${opts.maxMegapixels}MP`;
          toast.error('Не удалось загрузить изображение', {
            description: message,
            duration: 5000,
          });
          throw new Error(message);
        }

        // 3) Простая загрузка без обработки
        const urlUploaded = await postUpload(imageToUpload, token);
        return { src: urlUploaded };
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async resolve(asset: TLAsset, _ctx: TLAssetContextT) {
      const src = asset.props.src;

      // Если нет src или токена — возвращаем как есть
      if (!src || !token) {
        return src;
      }

      // Пропускаем data: и blob: URL — они уже пригодны к отображению
      if (src.startsWith('data:') || src.startsWith('blob:')) {
        return src;
      }

      // Проверяем кеш
      const cached = blobUrlCache.get(src);
      if (cached) {
        return cached;
      }

      try {
        // Загружаем изображение с заголовком токена через axios
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst.get(src, {
          responseType: 'blob',
          headers: {
            'x-storage-token': token,
          },
        });

        if (response.status !== 200) {
          return src;
        }

        // Создаем blob URL из загруженного изображения
        const blob = response.data;
        const blobUrl = URL.createObjectURL(blob);

        // Сохраняем в кеш
        blobUrlCache.set(src, blobUrl);

        return blobUrl;
      } catch (error) {
        console.error('[myAssetStore.resolve] Ошибка при загрузке изображения:', error);
        // На любой ошибке возвращаем исходный src
        return src;
      }
    },
  };
};
