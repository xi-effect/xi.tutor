import type { CropArea } from './useCrop';

export type ProcessCroppedImageDeps = {
  file: string;
  croppedAreaPixels: CropArea | null;
  withLoadingToServer?: boolean;
  onOpenChange: (value: boolean) => void;
  setDate?: (value: Date) => void;
  onBase64Return?: (resizedImageBase: string, form: FormData) => void;
  getCroppedImg: (imageSrc: string, pixelCrop: CropArea) => Promise<Blob | null>;
  resizeFile: (file: File) => Promise<Blob>;
  blobToDataUrl: (blob: Blob) => Promise<string>;
  uploadAvatar: (form: FormData) => Promise<{ status: number }>;
  onSuccess: () => void;
  onError: (error: unknown) => void;
};

export async function runProcessCroppedImage({
  file,
  croppedAreaPixels,
  withLoadingToServer = true,
  onOpenChange,
  setDate,
  onBase64Return,
  getCroppedImg,
  resizeFile,
  blobToDataUrl,
  uploadAvatar,
  onSuccess,
  onError,
}: ProcessCroppedImageDeps): Promise<unknown> {
  try {
    if (!croppedAreaPixels) return null;

    const croppedImage = await getCroppedImg(file, croppedAreaPixels);
    if (!croppedImage) {
      throw new Error('Failed to crop image');
    }

    const croppedFile = new File([croppedImage], 'avatar.png', { type: 'image/png' });
    const resizedImage = await resizeFile(croppedFile);

    const form = new FormData();
    form.append('avatar', resizedImage, 'avatar.png');

    if (!withLoadingToServer && onBase64Return) {
      const resizedImageBase = await blobToDataUrl(resizedImage);
      return onBase64Return(resizedImageBase, form);
    }

    const response = await uploadAvatar(form);

    if (response.status === 204) {
      onSuccess();
      onOpenChange(false);
      setDate?.(new Date());
    }
  } catch (error) {
    onError(error);
  }

  return null;
}
