import { toast } from 'sonner';
import Resizer from 'react-image-file-resizer';
import { getCroppedImg } from '../utils';
import { CropArea } from './useCrop';
import { env } from 'common.env';
import { getAxiosInstance } from 'common.config';

type ImageProcessingProps = {
  withLoadingToServer?: boolean;
  onOpenChange: (value: boolean) => void;
  setDate?: (value: Date) => void;
  onBase64Return?: (resizedImageBase: string, form: FormData) => void;
  communityId?: number | undefined;
};

export const useImageProcessing = ({
  withLoadingToServer = true,
  onOpenChange,
  setDate,
  onBase64Return,
}: ImageProcessingProps) => {
  const resizeFile = (file: File, type: 'blob' | 'base64') =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        256,
        256,
        'WEBP',
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        type,
      );
    });

  const processCroppedImage = async (file: File, croppedAreaPixels: CropArea | null) => {
    try {
      if (!croppedAreaPixels) return null;

      const croppedImage = (await getCroppedImg(file, croppedAreaPixels)) as Blob;
      const f = new File([croppedImage], 'avatar.webp');
      const resizedImage = (await resizeFile(f, 'blob')) as Blob;
      const resizedImageBase = (await resizeFile(f, 'base64')) as string;

      const form = new FormData();
      form.append('avatar', resizedImage, 'avatar.webp');

      if (!withLoadingToServer && onBase64Return) {
        return onBase64Return(resizedImageBase, form);
      }

      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance({
        method: 'PUT',
        url: `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/avatar/`,
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 204) {
        toast('Аватарка успешно загружена');
        onOpenChange(false);
        if (setDate) setDate(new Date());
      }
    } catch (e) {
      console.error(e);
    }

    return null;
  };

  return {
    processCroppedImage,
  };
};
