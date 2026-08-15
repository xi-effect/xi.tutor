import { Editor, DrAssetId } from '@ibodr/draw';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { myAssetStore } from '../../features/imageStore'; // тот же путь, что у insertImage.ts
import i18n from 'i18next';

const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

/**
 * Загружает картинку через тот же asset store, что и insertImage,
 * но НЕ создаёт отдельный shape — только asset-запись, id которой
 * кладётся в проп конкретной стороны flip-card карточки.
 */
export async function insertFlipCardImage(
  editor: Editor,
  file: File,
  token: string,
  onAssetIdReady: (assetId: DrAssetId) => void,
) {
  if (!file.size) {
    toast.error(i18n.t('toast.fileEmpty', { ns: 'board' }));
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    toast.error(i18n.t('toast.imageUploadFailed', { ns: 'board' }), {
      description: i18n.t('toast.imageSizeDesc', {
        ns: 'board',
        size: (file.size / 1024 / 1024).toFixed(2),
      }),
      duration: 5000,
    });
    return;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    toast.error(i18n.t('toast.imageOpenError', { ns: 'board' }));
    throw err;
  }
  const { width: w, height: h } = bitmap;
  bitmap.close();

  const tempAssetId = `asset:${nanoid()}` as DrAssetId;
  const previewUrl = URL.createObjectURL(file);

  editor.createAssets([
    {
      id: tempAssetId,
      type: 'image',
      typeName: 'asset',
      props: {
        src: previewUrl,
        w,
        h,
        mimeType: file.type,
        name: file.name,
        isAnimated: false,
      },
      meta: {},
    },
  ]);

  // Сразу отдаём id preview-ассета — карточка покажет blob-превью немедленно,
  // так же как это делает insertImage для обычных image-шейпов.
  onAssetIdReady(tempAssetId);

  try {
    const uploadAsset = {
      id: tempAssetId,
      type: 'image' as const,
      typeName: 'asset' as const,
      props: { src: '', w, h, mimeType: file.type, name: file.name, isAnimated: false },
      meta: {},
    };

    const { src } = await myAssetStore(token).upload(uploadAsset, file);

    editor.updateAssets([
      {
        id: tempAssetId,
        type: 'image',
        typeName: 'asset',
        props: { src, w, h, mimeType: file.type, name: file.name, isAnimated: false },
        meta: {},
      },
    ]);
  } catch (err) {
    console.error('Flip card image upload failed:', err);
    toast.error(i18n.t('toast.imageUploadError', { ns: 'board' }));
    editor.deleteAssets([tempAssetId]);
  } finally {
    setTimeout(() => URL.revokeObjectURL(previewUrl), 0);
  }
}
