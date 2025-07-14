import { toast } from 'sonner';
import Resizer from 'react-image-file-resizer';
import { getCroppedImg } from '../utils';
import { CropArea } from './useCrop';

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
  communityId,
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

      const pathAddress = communityId
        ? `/api/protected/community-service/communities/${communityId}/avatar/`
        : '/api/users/current/avatar/';
      const currentService = communityId ? 'backend' : 'auth';

      console.log('pathAddress', pathAddress, currentService);

      const formData = new FormData();
      formData.append('avatar', resizedImage);

      const response = await fetch(
        `https://api.xieffect.ru/api/protected/user-service/users/current/avatar/`,
        {
          method: 'PUT',
          body: formData,
        },
      );

      if (response.status === 204) {
        toast('Аватарка успешно загружена. В ближайшее время она отобразится на сайте');
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
