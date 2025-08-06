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

const WORKER_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/`;
const UPLOAD_URL = '/api/protected/storage-service/files/attachments/';

export const myAssetStore: TLAssetStoreT = {
  async upload(asset: TLAsset | null, file: File) {
    console.log('upload', asset, file);
    const formData = new FormData();
    formData.append('attachment', file);

    try {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: 'POST',
        url: `${env.VITE_SERVER_URL_BACKEND}${UPLOAD_URL}`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status !== 201) {
        throw new Error(`File upload failed: ${response.status}`);
      }

      const url = `${WORKER_URL}${response.data.id}/`;
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  resolve(asset) {
    return asset.props.src;
  },
};
