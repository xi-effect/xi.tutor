import webpfy from 'webpfy';

/**
 * Проверяет, поддерживает ли браузер WebP в Canvas API
 */
function supportsWebPInCanvas(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  try {
    // Пробуем создать WebP blob
    const dataURL = canvas.toDataURL('image/webp');
    return dataURL.indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Конвертирует изображение в WebP используя Canvas API
 */
async function convertToWebpWithCanvas(file: File, quality: number = 0.9): Promise<File> {
  console.log('[convertToWebpWithCanvas] Начало конвертации через Canvas:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    quality,
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    const startTime = performance.now();

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      console.log('[convertToWebpWithCanvas] Изображение загружено:', {
        loadTime: `${loadTime.toFixed(2)}ms`,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[convertToWebpWithCanvas] Не удалось получить контекст Canvas');
        reject(new Error('Не удалось получить контекст Canvas'));
        return;
      }

      // Рисуем изображение на canvas
      ctx.drawImage(img, 0, 0);
      console.log('[convertToWebpWithCanvas] Изображение отрисовано на Canvas, размеры:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });

      // Конвертируем в WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Не удалось конвертировать изображение в WebP через Canvas'));
            return;
          }

          // Проверяем, что blob действительно WebP
          if (blob.type !== 'image/webp') {
            console.warn(
              `Canvas вернул ${blob.type} вместо image/webp. Это может быть проблема Safari.`,
            );
            reject(new Error('Canvas не поддерживает WebP в этом браузере'));
            return;
          }

          // Убеждаемся, что имя файла заканчивается на .webp
          const baseName = file.name.replace(/\.[^/.]+$/, '') || 'image';
          const webpFileName = `${baseName}.webp`;

          const webpFile = new File([blob], webpFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          const totalTime = performance.now() - startTime;
          console.log('[convertToWebpWithCanvas] ✅ Canvas создал WebP файл:', {
            type: webpFile.type,
            size: webpFile.size,
            name: webpFile.name,
            blobType: blob.type,
            blobSize: blob.size,
            totalTime: `${totalTime.toFixed(2)}ms`,
            compressionRatio: `${((1 - webpFile.size / file.size) * 100).toFixed(1)}%`,
          });

          resolve(webpFile);
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = (error) => {
      console.error('[convertToWebpWithCanvas] ❌ Ошибка загрузки изображения:', {
        error,
        fileName: file.name,
        fileType: file.type,
      });
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
  console.log('[convertToWebp] Начало конвертации:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    lastModified: new Date(file.lastModified).toISOString(),
  });

  if (file.type.includes('webp')) {
    console.log('[convertToWebp] Файл уже в формате WebP, пропускаем конвертацию');
    return { file, mimeType: file.type };
  }

  // Проверяем поддержку WebP в Canvas
  const canvasSupportsWebP = supportsWebPInCanvas();
  console.log('[convertToWebp] Проверка поддержки WebP:', {
    canvasSupportsWebP,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
  });

  // В Safari часто проблемы с Canvas WebP, поэтому пробуем сначала webpfy
  // Если webpfy не сработает, пробуем Canvas
  if (!canvasSupportsWebP) {
    console.log('[convertToWebp] Canvas не поддерживает WebP, используем webpfy');
    console.log('[convertToWebp] Вызов webpfy с параметрами:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      quality: 90,
    });
    try {
      const startTime = performance.now();
      const { webpBlob, fileName } = await webpfy({
        image: file,
        quality: 90,
      });
      const endTime = performance.now();
      console.log('[convertToWebp] webpfy завершился успешно:', {
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        webpBlobType: webpBlob.type,
        webpBlobSize: webpBlob.size,
        fileName,
      });

      // Убеждаемся, что имя файла заканчивается на .webp
      const webpFileName = fileName.endsWith('.webp')
        ? fileName
        : fileName.replace(/\.[^/.]+$/, '') + '.webp';

      const webpFile = new File([webpBlob], webpFileName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });

      // Проверяем, что файл действительно WebP
      if (webpFile.type !== 'image/webp') {
        throw new Error('webpfy вернул файл не в формате WebP');
      }

      console.log('[convertToWebp] ✅ Успешно конвертировано через webpfy:', {
        type: webpFile.type,
        size: webpFile.size,
        name: webpFile.name,
        compressionRatio: `${((1 - webpFile.size / file.size) * 100).toFixed(1)}%`,
      });
      return { file: webpFile, mimeType: 'image/webp' };
    } catch (webpfyError) {
      console.warn('[convertToWebp] ❌ webpfy не сработал, пробуем Canvas:', {
        error: webpfyError,
        errorMessage: webpfyError instanceof Error ? webpfyError.message : String(webpfyError),
        errorStack: webpfyError instanceof Error ? webpfyError.stack : undefined,
      });
      // Fallback на Canvas, даже если поддержка не определена
      try {
        console.log('[convertToWebp] Пробуем Canvas как fallback');
        const webpFile = await convertToWebpWithCanvas(file, 0.9);
        console.log('[convertToWebp] ✅ Успешно конвертировано через Canvas (fallback):', {
          type: webpFile.type,
          size: webpFile.size,
          name: webpFile.name,
        });
        return { file: webpFile, mimeType: 'image/webp' };
      } catch (canvasError) {
        console.error('[convertToWebp] ❌ Оба метода не сработали:', {
          webpfyError: {
            message: webpfyError instanceof Error ? webpfyError.message : String(webpfyError),
            stack: webpfyError instanceof Error ? webpfyError.stack : undefined,
          },
          canvasError: {
            message: canvasError instanceof Error ? canvasError.message : String(canvasError),
            stack: canvasError instanceof Error ? canvasError.stack : undefined,
          },
        });
        throw new Error(
          'Не удалось конвертировать изображение в WebP. Пожалуйста, попробуйте другое изображение или обновите браузер.',
        );
      }
    }
  }

  // Если Canvas поддерживает WebP, пробуем сначала его
  console.log('[convertToWebp] Canvas поддерживает WebP, пробуем сначала его');
  try {
    const startTime = performance.now();
    const webpFile = await convertToWebpWithCanvas(file, 0.9);
    const endTime = performance.now();
    console.log('[convertToWebp] ✅ Успешно конвертировано через Canvas:', {
      type: webpFile.type,
      size: webpFile.size,
      name: webpFile.name,
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      compressionRatio: `${((1 - webpFile.size / file.size) * 100).toFixed(1)}%`,
    });
    return { file: webpFile, mimeType: 'image/webp' };
  } catch (canvasError) {
    console.warn('[convertToWebp] ❌ Canvas API не сработал, пробуем webpfy:', {
      error: canvasError,
      errorMessage: canvasError instanceof Error ? canvasError.message : String(canvasError),
      errorStack: canvasError instanceof Error ? canvasError.stack : undefined,
    });

    // Fallback на webpfy
    console.log('[convertToWebp] Пробуем webpfy как fallback');
    try {
      const startTime = performance.now();
      const { webpBlob, fileName } = await webpfy({
        image: file,
        quality: 90,
      });
      const endTime = performance.now();
      console.log('[convertToWebp] webpfy (fallback) завершился успешно:', {
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        webpBlobType: webpBlob.type,
        webpBlobSize: webpBlob.size,
        fileName,
      });

      // Убеждаемся, что имя файла заканчивается на .webp
      const webpFileName = fileName.endsWith('.webp')
        ? fileName
        : fileName.replace(/\.[^/.]+$/, '') + '.webp';

      const webpFile = new File([webpBlob], webpFileName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });

      if (webpFile.type !== 'image/webp') {
        throw new Error('webpfy вернул файл не в формате WebP');
      }

      console.log('[convertToWebp] ✅ Успешно конвертировано через webpfy (fallback):', {
        type: webpFile.type,
        size: webpFile.size,
        name: webpFile.name,
        compressionRatio: `${((1 - webpFile.size / file.size) * 100).toFixed(1)}%`,
      });
      return { file: webpFile, mimeType: 'image/webp' };
    } catch (webpfyError) {
      console.error('[convertToWebp] ❌ Не удалось конвертировать в WebP ни одним методом:', {
        canvasError: {
          message: canvasError instanceof Error ? canvasError.message : String(canvasError),
          stack: canvasError instanceof Error ? canvasError.stack : undefined,
        },
        webpfyError: {
          message: webpfyError instanceof Error ? webpfyError.message : String(webpfyError),
          stack: webpfyError instanceof Error ? webpfyError.stack : undefined,
        },
      });
      throw new Error(
        'Не удалось конвертировать изображение в WebP. Пожалуйста, попробуйте другое изображение или обновите браузер.',
      );
    }
  }
}
