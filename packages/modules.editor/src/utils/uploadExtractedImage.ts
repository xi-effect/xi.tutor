import { tryStartUpload } from 'common.subscription';
import { optimizeImage } from './optimizeImage';
import { toastEditorUploadRejected } from './insertMedia';

type UploadImage = (params: { file: File; token: string }) => Promise<string>;

/**
 * Загружает страницу PDF или слайд как картинку; при отказе возвращает null.
 * Ошибку запроса показывает сама мутация useUploadImage.
 */
export async function uploadExtractedImage(
  file: File,
  token: string,
  uploadImage: UploadImage,
): Promise<string | null> {
  try {
    const optimized = await optimizeImage(file);
    const evaluation = tryStartUpload(optimized, 'image');
    if (!evaluation.ok) {
      toastEditorUploadRejected(evaluation, 'image');
      return null;
    }
    return await uploadImage({ file: optimized, token });
  } catch (err) {
    console.error('[uploadExtractedImage]', err);
    return null;
  }
}
