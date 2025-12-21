import webpfy from 'webpfy';

/**
 * Конвертирует изображение в WebP используя Canvas API (работает в Safari)
 * с fallback на webpfy библиотеку
 */
async function convertToWebpWithCanvas(file: File, quality: number = 0.9): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Не удалось получить контекст Canvas'));
        return;
      }

      // Рисуем изображение на canvas
      ctx.drawImage(img, 0, 0);

      // Конвертируем в WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Не удалось конвертировать изображение в WebP'));
            return;
          }

          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Не удалось загрузить изображение'));
    };

    img.src = objectUrl;
  });
}

export async function convertToWebp(file: File): Promise<{
  file: File;
  mimeType: string;
}> {
  if (file.type.includes('webp')) {
    return { file, mimeType: file.type };
  }

  // Пробуем сначала Canvas API (работает в Safari)
  try {
    const webpFile = await convertToWebpWithCanvas(file, 0.9);
    return { file: webpFile, mimeType: 'image/webp' };
  } catch (canvasError) {
    console.warn('Canvas API не сработал, пробуем webpfy:', canvasError);

    // Fallback на webpfy
    try {
      const { webpBlob, fileName } = await webpfy({
        image: file,
        quality: 90,
      });

      const webpFile = new File([webpBlob], fileName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });

      return { file: webpFile, mimeType: 'image/webp' };
    } catch (webpfyError) {
      // Если оба метода не сработали, выбрасываем ошибку
      // вместо возврата оригинального файла, чтобы бэкенд не получил неверный формат
      console.error('Не удалось конвертировать в WebP ни одним методом:', {
        canvasError,
        webpfyError,
      });
      throw new Error(
        'Не удалось конвертировать изображение в WebP. Пожалуйста, попробуйте другое изображение.',
      );
    }
  }
}
