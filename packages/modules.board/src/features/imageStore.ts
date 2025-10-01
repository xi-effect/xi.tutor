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

export type TLAssetStoreT = {
  upload(asset: TLAsset | null, file: File): Promise<string>;
  resolve?(asset: TLAsset, ctx: TLAssetContextT): Promise<string | null> | string | null;
};

const UPLOAD_URL = '/api/protected/storage-service/access-groups/public/file-kinds/image/files/';
const WORKER_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/`;

export const myAssetStore: TLAssetStoreT = {
  async upload(_asset: TLAsset | null, file: File) {
    // console.log('Загружаем файл:', {
    //   name: file.name,
    //   type: file.type,
    //   size: file.size,
    //   lastModified: file.lastModified
    // });

    const formData = new FormData();
    formData.append('upload', file);

    // console.log('FormData содержимое:');
    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    try {
      const axiosInst = await getAxiosInstance();
      const fullUrl = `${env.VITE_SERVER_URL_BACKEND}${UPLOAD_URL}`;
      // console.log('Отправляем запрос на:', fullUrl);

      const response = await axiosInst({
        method: 'POST',
        url: fullUrl,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // console.log('Ответ сервера:', {
      //   status: response.status,
      //   data: response.data
      // });

      if (response.status !== 201) {
        throw new Error(`File upload failed: ${response.status}`);
      }

      const url = `${WORKER_URL}${response.data.id}/`;
      // console.log('Файл успешно загружен, URL:', url);
      return url;
    } catch (error: unknown) {
      console.error('Ошибка загрузки файла:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; statusText: string; data: unknown };
        };
        console.error('Детали ошибки:', {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
        });
      }
      throw error;
    }
  },

  resolve(asset) {
    return asset.props.src;
  },
};
