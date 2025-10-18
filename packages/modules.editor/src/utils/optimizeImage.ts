import webpfy from 'webpfy';

export type OptimizeOptions = {
  quality?: number;
};

export const optimizeImage = async (file: File, options: OptimizeOptions = {}): Promise<File> => {
  const { quality = 90 } = options;

  if (!file.type.startsWith('image/')) {
    console.log('Файл не является изображением, возвращаем как есть');
    return file;
  }

  let fileToUpload = file;

  try {
    if (!fileToUpload.type.includes('webp')) {
      const { webpBlob, fileName } = await webpfy({
        image: fileToUpload,
        quality,
      });

      const webpFile = new File([webpBlob], fileName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });

      const compressionRatio = (
        ((fileToUpload.size - webpBlob.size) / fileToUpload.size) *
        100
      ).toFixed(1);

      console.log(
        `Изображение конвертировано в WebP с высоким качеством. Размер: ${file.size} -> ${webpBlob.size} байт (сжатие: ${compressionRatio}%)`,
      );

      fileToUpload = webpFile;
    } else {
      console.log('Изображение уже в WebP, конвертация не требуется');
    }
  } catch (err) {
    console.warn('Ошибка при оптимизации изображения, возвращаем оригинал:', err);
    fileToUpload = file;
  }

  return fileToUpload;
};
