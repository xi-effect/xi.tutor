import { getAxiosInstance } from 'common.config';
import { env } from 'common.env';
import { TLAsset } from 'tldraw';
import { toast } from 'sonner';

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
  upload(asset: TLAsset | null, file: File, options?: UploadOptions): Promise<string>;
  resolve?(asset: TLAsset, ctx: TLAssetContextT): Promise<string | null> | string | null;
};

const UPLOAD_URL = '/api/protected/storage-service/access-groups/public/file-kinds/image/files/';
const WORKER_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/`;

const DEFAULT_OPTIONS: UploadOptions = {
  maxSide: 4096, // лимит по стороне
  maxMegapixels: 8.0, // лимит мегапикселей
  quality: 100, // качество
};

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

/** POST на бэкенд */
async function postUpload(file: File) {
  const axiosInst = await getAxiosInstance();
  const fullUrl = `${env.VITE_SERVER_URL_BACKEND}${UPLOAD_URL}`;
  const formData = new FormData();
  formData.append('upload', file);
  const response = await axiosInst({
    method: 'POST',
    url: fullUrl,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (response.status !== 201) throw new Error(`File upload failed: ${response.status}`);
  return `${WORKER_URL}${response.data.id}/`;
}

/** Основной store — упрощенная версия */
export const myAssetStore: TLAssetStoreT = {
  async upload(_asset: TLAsset | null, file: File, options: UploadOptions = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    console.log('Загружаем файл:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      options: opts,
    });

    // Не изображение — просто загрузка
    if (!file.type.startsWith('image/')) {
      return await postUpload(file);
    }

    let objectUrl: string | null = null;

    try {
      // 1) Проверяем размеры изображения
      const { w: srcW, h: srcH, objectUrl: url } = await probeImage(file);
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
      console.log(`Загружаем изображение без обработки: ${srcW}×${srcH}px`);
      const urlUploaded = await postUpload(file);
      console.log('Файл загружен:', urlUploaded);
      return urlUploaded;
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  },

  resolve(asset) {
    // Без LQIP — просто возвращаем текущий src
    return asset.props.src;
  },
};
