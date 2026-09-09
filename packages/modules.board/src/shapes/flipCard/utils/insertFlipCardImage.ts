import { Editor, DrAssetId } from '@ibodr/draw';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { myAssetStore } from '../../../features/imageStore';
import i18n from 'i18next';
import { assertBoardUploadAllowed } from '../../../utils/planUploadLimit';
import { beginFileUploadAttempt, rejectFileUploadFromError } from 'common.utils';

export async function insertFlipCardImage(
  editor: Editor,
  file: File,
  token: string,
  onAssetIdReady: (assetId: DrAssetId) => void,
) {
  if (!file.size) {
    toast.error(i18n.t('toast.fileEmpty', { ns: 'board' }));
    beginFileUploadAttempt('board', file).reject('unknown');
    return;
  }

  const attempt = beginFileUploadAttempt('board', file);

  if (!assertBoardUploadAllowed(file, 'image', attempt)) {
    return;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    attempt.reject('upload_error');
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
    attempt.succeed();
  } catch (err) {
    console.error('Flip card image upload failed:', err);
    rejectFileUploadFromError(attempt, err);
    toast.error(i18n.t('toast.imageUploadError', { ns: 'board' }));
    editor.deleteAssets([tempAssetId]);
  } finally {
    setTimeout(() => URL.revokeObjectURL(previewUrl), 0);
  }
}
