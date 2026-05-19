import { useEffect, useState } from 'react';
import { getAxiosInstance } from 'common.config';
import { filesApiConfig, FilesQueryKey } from 'common.services';

// Кеш blob URL для уже загруженных изображений (по исходному src)
const blobUrlCache = new Map<string, string>();

export const useProtectedImage = (src: string, storageToken: string) => {
  const [imageSrc, setImageSrc] = useState<string>(src);

  useEffect(() => {
    const loadImageWithToken = async () => {
      // Если нет src или токена — используем исходный src
      if (!src || !storageToken) {
        setImageSrc(src);
        return;
      }

      // Пропускаем data: и blob: URL — они уже пригодны к отображению
      if (
        src.startsWith('data:') ||
        src.startsWith('blob:') ||
        src.startsWith('https') ||
        src.startsWith('http')
      ) {
        setImageSrc(src);
        return;
      }

      // Проверяем кеш
      const { getUrl } = filesApiConfig[FilesQueryKey.GetFile];
      const srcUrl = getUrl(src);
      const cached = blobUrlCache.get(srcUrl);
      if (cached) {
        setImageSrc(cached);
        return;
      }

      try {
        // Загружаем изображение с заголовком токена через axios
        const { getUrl } = filesApiConfig[FilesQueryKey.GetFile];
        const srcUrl = getUrl(src);

        const axiosInst = await getAxiosInstance();
        const response = await axiosInst.get(srcUrl, {
          responseType: 'blob',
          headers: {
            'x-storage-token': storageToken,
          },
        });

        if (response.status !== 200) {
          setImageSrc(src);
          return;
        }

        // Создаем blob URL из загруженного изображения
        const blob = response.data;
        const blobUrl = URL.createObjectURL(blob);

        // Сохраняем в кеш
        blobUrlCache.set(srcUrl, blobUrl);

        setImageSrc(blobUrl);
      } catch (error) {
        console.error('[ImageNodeView] Ошибка при загрузке изображения:', error);
        // На любой ошибке используем исходный src
        setImageSrc(src);
      }
    };

    loadImageWithToken();
  }, [src, storageToken]);

  return imageSrc;
};
