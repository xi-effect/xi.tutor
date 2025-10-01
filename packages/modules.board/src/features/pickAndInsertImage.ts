import { nanoid } from 'nanoid';
import { Editor, TLAssetId, TLShapeId } from 'tldraw';
import { myAssetStore } from './imageStore';
import webpfy from 'webpfy';

export async function insertImage(editor: Editor, file: File) {
  // 1. узнаём размеры
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;

  // 2. конвертируем в WebP если это не WebP уже
  let fileToUpload = file;
  let mimeType = file.type;

  if (!file.type.includes('webp')) {
    try {
      console.log(`Конвертируем изображение ${file.name} (${file.type}) в WebP...`);
      const { webpBlob, fileName } = await webpfy({ image: file });

      // Создаем новый File объект из WebP Blob
      fileToUpload = new File([webpBlob], fileName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });
      mimeType = 'image/webp';

      console.log(
        `Изображение успешно конвертировано в WebP. Размер: ${file.size} -> ${webpBlob.size} байт`,
      );
    } catch (error) {
      console.warn('Не удалось конвертировать в WebP, используем оригинальный файл:', error);
    }
  } else {
    console.log('Изображение уже в формате WebP, пропускаем конвертацию');
  }

  // 3. грузим на сервер → получаем URL
  const src = await myAssetStore.upload(null, fileToUpload);

  // 4. добавляем asset + shape
  const assetId = `asset:${nanoid()}` as TLAssetId;
  console.log('Создаем asset с ID:', assetId);

  editor.createAssets([
    {
      id: assetId,
      type: 'image',
      typeName: 'asset',
      props: {
        src,
        mimeType: mimeType,
        w,
        h,
        name: fileToUpload.name,
        isAnimated: false,
      },
      meta: {},
    },
  ]);

  const shapeId = `shape:${nanoid()}` as TLShapeId;
  // console.log('Создаем shape с ID:', shapeId);

  // Получаем центр viewport для позиционирования изображения
  const viewportCenter = editor.getViewportPageBounds().center;

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

  console.log('Изображение успешно добавлено на доску!');
}
