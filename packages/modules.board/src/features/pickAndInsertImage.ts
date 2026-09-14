import { prepareContentUpload } from 'common.services';
import { nanoid } from 'nanoid';
import { Editor, DrAssetId, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import { myAssetStore } from './imageStore';
import { resolveShapeCoordinates } from '../utils';
import { waitForResolvedAssetUrl } from '../utils/resolveAssetUrl';
import { getBoardUploadErrorToast } from '../utils/boardUploadError';
import { assertBoardUploadAllowed } from '../utils/planUploadLimit';
import { getMaxImageBytes } from 'common.subscription';
import { beginFileUploadAttempt, rejectFileUploadFromError } from 'common.utils';
import i18n from 'i18next';

export type InsertImagePlacement = {
  /** Позиция и размер на доске (в координатах страницы). Если не задано — по центру вьюпорта с натуральными размерами. */
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Вставка изображения с мгновенным preview вне store и последующей загрузкой
 * @param placement — опционально: позиция (x, y) и размер (w, h) на доске
 */
export async function insertImage(
  editor: Editor,
  file: File,
  token: string,
  placement?: InsertImagePlacement,
) {
  // Клон: временный <input> могут убрать из DOM до чтения File (Safari / первый выбор).
  file = prepareContentUpload(
    new File([file], file.name, { type: file.type, lastModified: file.lastModified }),
  ).file;

  if (!file.size) {
    toast.error(i18n.t('toast.fileEmpty', { ns: 'board' }), {
      description: i18n.t('toast.fileEmptyDesc', { ns: 'board' }),
    });
    beginFileUploadAttempt('board', file).reject('unknown');
    return;
  }

  const attempt = beginFileUploadAttempt('board', file);

  if (!assertBoardUploadAllowed(file, 'image', attempt)) {
    throw new Error(i18n.t('toast.fileTooLarge', { ns: 'board' }));
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    attempt.reject('upload_error');
    toast.error(i18n.t('toast.imageOpenError', { ns: 'board' }), {
      description: i18n.t('toast.imageReadFailed', { ns: 'board' }),
      duration: 8000,
    });
    throw err;
  }

  const { width: w, height: h } = bitmap;
  bitmap.close();

  const tempAssetId = `asset:${nanoid()}` as DrAssetId;
  const shapeId = `shape:${nanoid()}` as DrShapeId;

  const position = placement
    ? { x: placement.x, y: placement.y }
    : resolveShapeCoordinates(editor, w, h);
  const shapeW = placement ? placement.w : w;
  const shapeH = placement ? placement.h : h;

  editor.createTemporaryAssetPreview(tempAssetId, file);
  editor.createAssets([
    {
      id: tempAssetId,
      type: 'image',
      typeName: 'asset',
      props: {
        src: '',
        w,
        h,
        mimeType: file.type,
        name: file.name,
        isAnimated: false,
      },
      meta: {},
    },
  ]);

  editor.createShapes([
    {
      id: shapeId,
      type: 'image',
      x: position.x,
      y: position.y,
      props: {
        w: shapeW,
        h: shapeH,
        assetId: tempAssetId,
      },
    },
  ]);

  editor.setSelectedShapes([shapeId]);
  Promise.resolve().then(() => {
    editor.zoomToSelection({ animation: { duration: 200 } });
  });

  (async () => {
    try {
      const uploadAsset = {
        id: tempAssetId,
        type: 'image' as const,
        typeName: 'asset' as const,
        props: {
          src: '',
          w,
          h,
          mimeType: file.type,
          name: file.name,
          isAnimated: false,
        },
        meta: {},
      };

      const { src } = await myAssetStore(token).upload(uploadAsset, file);
      await waitForResolvedAssetUrl(src, token);

      if (!editor.getAsset(tempAssetId) || !editor.getShape(shapeId)) {
        if (editor.getAsset(tempAssetId)) editor.deleteAssets([tempAssetId]);
        return;
      }

      // Контракт персиста: только storage file id — см. utils/storedFileSrc.ts
      editor.updateAssets([
        {
          id: tempAssetId,
          type: 'image',
          typeName: 'asset',
          props: {
            src,
            w,
            h,
            mimeType: file.type,
            name: file.name,
            isAnimated: false,
          },
          meta: {},
        },
      ]);
      attempt.succeed();
    } catch (err) {
      console.error('Image upload failed:', err);
      rejectFileUploadFromError(attempt, err, {
        fileSize: file.size,
        maxBytes: getMaxImageBytes(),
      });
      const { title, description } = getBoardUploadErrorToast(err, file, getMaxImageBytes(), {
        sizeDescKey: 'toast.imageSizeDesc',
        failedTitleKey: 'toast.imageUploadError',
        failedDescKey: 'toast.imageUploadFailed',
      });
      toast.error(title, {
        description,
        duration: 5000,
      });
      editor.deleteShapes([shapeId]);
      editor.deleteAssets([tempAssetId]);
    }
  })();
}
