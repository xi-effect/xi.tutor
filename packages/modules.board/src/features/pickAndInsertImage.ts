import { nanoid } from 'nanoid';
import { Editor, TLAssetId, TLShapeId } from 'tldraw';
import { myAssetStore } from './imageStore';
import webpfy from 'webpfy';

/**
 * Вставка изображения с мгновенным preview и последующей загрузкой
 */
export async function insertImage(editor: Editor, file: File, token: string) {
  // 1️ Получаем размеры изображения
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;

  // 2️ Создаём shape + asset с временным data URL
  const tempAssetId = `asset:${nanoid()}` as TLAssetId;
  const shapeId = `shape:${nanoid()}` as TLShapeId;

  const fileAsDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const viewportCenter = editor.getViewportPageBounds().center;

  editor.createAssets([
    {
      id: tempAssetId,
      type: 'image',
      typeName: 'asset',
      props: {
        src: fileAsDataUrl, // локальный preview
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
      x: viewportCenter.x - w / 2,
      y: viewportCenter.y - h / 2,
      props: {
        w,
        h,
        assetId: tempAssetId,
      },
    },
  ]);

  (async () => {
    try {
      let fileToUpload = file;
      let mimeType = file.type;

      if (!file.type.includes('webp')) {
        try {
          const { webpBlob, fileName } = await webpfy({
            image: file,
            quality: 90,
          });
          fileToUpload = new File([webpBlob], fileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          mimeType = 'image/webp';
        } catch (error) {
          console.warn('Не удалось конвертировать в WebP, используем оригинальный файл:', error);
        }
      }

      const uploadAsset = {
        id: tempAssetId,
        type: 'image' as const,
        typeName: 'asset' as const,
        props: {
          src: '',
          w,
          h,
          mimeType,
          name: fileToUpload.name,
          isAnimated: false,
        },
        meta: {},
      };

      const { src } = await myAssetStore(token).upload(uploadAsset, fileToUpload);

      // Обновляем asset.src на настоящий URL после загрузки
      editor.updateAssets([
        {
          id: tempAssetId,
          type: 'image',
          typeName: 'asset',
          props: {
            src, // реальный URL с сервера
            w,
            h,
            mimeType,
            name: fileToUpload.name,
            isAnimated: false,
          },
          meta: {},
        },
      ]);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  })();
}
