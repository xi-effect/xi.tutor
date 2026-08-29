import { createImage } from './createImage';
import { AVATAR_MAX_SIZE, fitImageSize } from './fitImageSize';

export async function resizeImageFile(
  file: File,
  maxSize: number = AVATAR_MAX_SIZE,
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await createImage(objectUrl);
    const { width, height } = fitImageSize(image.width, image.height, maxSize);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2d context is not available');
    }

    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Failed to encode resized image');
    }

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
