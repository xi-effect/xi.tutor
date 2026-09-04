import { Editor, DrAssetId } from '@ibodr/draw';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { myAssetStore } from '../../../features/imageStore';
import i18n from 'i18next';

const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

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
