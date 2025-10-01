/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAxiosInstance } from 'common.config';
import { env } from 'common.env';
import { TLAsset } from 'tldraw';

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
  maxSide: 3072, // безопасный лимит по стороне
  maxMegapixels: 4.0, // ~4MP
  quality: 0.85,
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

/** Рассчитать целевой размер с лимитами по стороне и по мегапикселям */
function computeTargetSize(w: number, h: number, { maxSide, maxMegapixels }: UploadOptions) {
  let scale = 1;

  // агрессивно обезвреживаем экстремалы (8k+/16k)
  const isExtreme = w > 8192 || h > 8192 || w * h > 50_000_000;

  if (maxSide) {
    scale = Math.min(scale, Math.min(maxSide / w, maxSide / h, 1));
  }
  if (maxMegapixels) {
    const mp = (w * h) / 1_000_000;
    if (mp > maxMegapixels) {
      scale = Math.min(scale, Math.sqrt(maxMegapixels / mp));
    }
  }
  if (isExtreme) {
    // гарантированно уходим от потенциальных лимитов GPU-текстур
    scale = Math.min(scale, Math.min(4096 / w, 4096 / h, 0.25));
  }

  const tw = Math.max(1, Math.floor(w * scale));
  const th = Math.max(1, Math.floor(h * scale));

  console.log(
    `Scale: ${w}x${h} → ${tw}x${th} (scale=${scale.toFixed(3)})${isExtreme ? ' [extreme]' : ''}`,
  );
  return { tw, th };
}

/** Уменьшение прямо на этапе декодинга */
async function downscaleViaCreateImageBitmap(
  fileOrImg: File | ImageBitmapSource,
  targetW: number,
  targetH: number,
): Promise<ImageBitmap> {
  return await createImageBitmap(
    fileOrImg as any,
    {
      resizeWidth: targetW,
      resizeHeight: targetH,
      resizeQuality: 'high',
    } as any,
  );
}

/** Фоллбэк с качественным ресайзом: pica (динамический импорт) */
async function downscaleViaPica(
  imgEl: HTMLImageElement,
  targetW: number,
  targetH: number,
): Promise<HTMLCanvasElement> {
  const { default: pica } = await import('pica');
  const src = document.createElement('canvas');
  src.width = imgEl.naturalWidth;
  src.height = imgEl.naturalHeight;
  src.getContext('2d')!.drawImage(imgEl, 0, 0);

  const dst = document.createElement('canvas');
  dst.width = targetW;
  dst.height = targetH;

  await pica({ features: ['js', 'wasm', 'ww'] }).resize(src, dst, {
    quality: 3,
  });

  return dst;
}

/** Canvas → WebP blob */
async function canvasToWebP(canvas: HTMLCanvasElement | OffscreenCanvas, quality: number) {
  if ('convertToBlob' in canvas) {
    return await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/webp', quality });
  }
  return await new Promise<Blob>((resolve, reject) =>
    (canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob returned null'))),
      'image/webp',
      quality,
    ),
  );
}

/** Уменьшенный decode → отрисовка → WebP; фоллбэк на pica при необходимости */
async function resizeAndWebpSmart(
  file: File,
  imgEl: HTMLImageElement,
  targetW: number,
  targetH: number,
  quality: number,
): Promise<{ blob: Blob; w: number; h: number }> {
  // Путь A: createImageBitmap с resize (минимум памяти и лагов)
  try {
    const bitmap = await downscaleViaCreateImageBitmap(file, targetW, targetH);
    const useOffscreen = 'OffscreenCanvas' in globalThis;
    const canvas = useOffscreen
      ? new OffscreenCanvas(targetW, targetH)
      : Object.assign(document.createElement('canvas'), { width: targetW, height: targetH });
    const ctx = (canvas as any).getContext('2d', {
      alpha: false,
      desynchronized: true,
    }) as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await canvasToWebP(canvas, quality);
    return { blob, w: targetW, h: targetH };
  } catch (e) {
    console.warn('createImageBitmap(resize*) недоступен/упал, используем pica:', e);
  }

  // Путь B: pica (качественно и быстро, можно в воркере)
  const dst = await downscaleViaPica(imgEl, targetW, targetH);
  const blob = await canvasToWebP(dst, quality);
  return { blob, w: targetW, h: targetH };
}

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

/** Основной store — без LQIP */
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
      // 1) Узнаём исходные размеры
      const { w: srcW, h: srcH, objectUrl: url, img } = await probeImage(file);
      objectUrl = url;

      // 2) Целевой размер с ограничениями
      const { tw, th } = computeTargetSize(srcW, srcH, opts);

      // 3) Нужно ли оптимизировать?
      const isLarge = srcW > 3000 || srcH > 3000 || srcW * srcH > 5_000_000;
      const needsOptimization =
        isLarge || tw !== srcW || th !== srcH || !file.type.includes('webp');

      let fileToUpload = file;

      if (needsOptimization) {
        console.log(`Оптимизация: ${srcW}x${srcH} → ${tw}x${th}`);
        const q = isLarge ? Math.min(opts.quality!, 0.78) : opts.quality!;
        const { blob } = await resizeAndWebpSmart(file, img, tw, th, q);
        fileToUpload = new File([blob], `${file.name.replace(/\.\w+$/, '')}.webp`, {
          type: 'image/webp',
          lastModified: Date.now(),
        });
        const compression = (((file.size - blob.size) / file.size) * 100).toFixed(1);
        console.log(`Сжато: ${file.size} → ${blob.size} байт (−${compression}%)`);
      } else {
        console.log('Изображение уже приемлемое — без обработки');
      }

      // 4) Загрузка
      const urlUploaded = await postUpload(fileToUpload);
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
