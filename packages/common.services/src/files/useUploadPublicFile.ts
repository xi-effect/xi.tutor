import { useMutation } from '@tanstack/react-query';
import { uploadPublicImage } from './uploadPublicFiles';
import { handleError } from '../..';
import { toast } from 'sonner';

export const useUploadPublicFile = () => {
  return useMutation({
    mutationFn: uploadPublicImage,
    onSuccess: () => toast('Файл успешно загружен'),
    onError: (err) => handleError(err, 'files'),
  });
};
