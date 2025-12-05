import webpfy from 'webpfy';

export async function convertToWebp(file: File): Promise<{
  file: File;
  mimeType: string;
}> {
  if (file.type.includes('webp')) {
    return { file, mimeType: file.type };
  }

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
  } catch (error) {
    console.warn('Не удалось конвертировать в WebP, возвращаем оригинальный файл', error);
    return { file, mimeType: file.type };
  }
}
