import { createImage } from './createImage';
import type { CropArea } from '../hooks/useCrop';

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  flip = { horizontal: false, vertical: false },
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.translate(image.width / 2, image.height / 2);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return null;
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Бэкенд принимает PNG и сам конвертирует в webp; кроп важен — бэкенд делает 128×128 квадрат
  return new Promise((resolve) => {
    croppedCanvas.toBlob((file) => {
      resolve(file);
    }, 'image/png');
  });
}
