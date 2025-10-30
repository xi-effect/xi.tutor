import { nanoid } from 'nanoid';
import { Editor, TLAssetId, TLShapeId } from 'tldraw';
import { myAssetStore } from './imageStore';
import webpfy from 'webpfy';

export async function insertImage(editor: Editor, file: File, token: string) {
  // 1. Узнаём размеры без изменения
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;

  // 2. Конвертируем в WebP с высоким качеством
  let fileToUpload = file;
  let mimeType = file.type;

  if (!file.type.includes('webp')) {
    try {
      // Высокое качество WebP для сохранения деталей
      const { webpBlob, fileName } = await webpfy({
        image: file,
        quality: 90, // Высокое качество для сохранения текста
      });

      // Создаем новый File объект из WebP Blob
      fileToUpload = new File([webpBlob], fileName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });
      mimeType = 'image/webp';
    } catch (error) {
      console.warn('Не удалось конвертировать в WebP, используем оригинальный файл:', error);
    }
  }

  // 3. Загружаем файл (с валидацией размера в imageStore.ts)
  // Создаем временный asset для загрузки
  const tempAssetId = `asset:${nanoid()}` as TLAssetId;
  const tempAsset = {
    id: tempAssetId,
    type: 'image' as const,
    typeName: 'asset' as const,
    props: {
      src: '',
      w: w,
      h: h,
      mimeType: mimeType,
      name: fileToUpload.name,
      isAnimated: false,
    },
    meta: {},
  };
  const { src } = await myAssetStore(token).upload(tempAsset, fileToUpload);

  // 4. добавляем asset + shape в одной транзакции для лучшей производительности
  const assetId = `asset:${nanoid()}` as TLAssetId;
  const shapeId = `shape:${nanoid()}` as TLShapeId;

  // Получаем центр viewport для позиционирования изображения
  const viewportCenter = editor.getViewportPageBounds().center;

  // Создаем asset и shape в одной транзакции
  editor.createAssets([
    {
      id: assetId,
      type: 'image',
      typeName: 'asset',
      props: {
        src,
        mimeType: mimeType, // используем конвертированный тип
        w,
        h,
        name: fileToUpload.name,
        isAnimated: false,
      },
      meta: {},
    },
  ]);

  // Создаем shape
  editor.createShapes([
    {
      id: shapeId as TLShapeId,
      type: 'image',
      x: viewportCenter.x - w / 2,
      y: viewportCenter.y - h / 2,
      props: {
        w,
        h,
        assetId,
      },
    },
  ]);
}
