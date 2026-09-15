import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { blobToDataUrl, getCroppedImg, resizeImageFile } from '../utils';
import { CropArea } from './useCrop';
import { env } from 'common.env';
import { getAxiosInstance } from 'common.config';
import { runProcessCroppedImage } from './processCroppedImage';

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
  const { t } = useTranslation('avatarEditor');

  // Бэкенд PUT .../users/current/avatar/ принимает любые форматы и сам делает 128×128 и webp
  const processCroppedImage = async (file: string, croppedAreaPixels: CropArea | null) =>
    runProcessCroppedImage({
      file,
      croppedAreaPixels,
      withLoadingToServer,
      onOpenChange,
      setDate,
      onBase64Return,
      getCroppedImg,
      resizeFile: (imageFile) => resizeImageFile(imageFile),
      blobToDataUrl,
      uploadAvatar: async (form) => {
        const axiosInstance = await getAxiosInstance();
        return axiosInstance({
          method: 'PUT',
          url: `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/avatar/`,
          data: form,
          headers: {},
        });
      },
      onSuccess: () => {
        toast(t('toastSuccess'));
      },
      onError: (error) => {
        console.error(error);
        toast.error(t('toastError'));
      },
    });

  return {
    processCroppedImage,
  };
};
