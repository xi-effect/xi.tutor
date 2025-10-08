import { nanoid } from 'nanoid';
import { Editor, TLAssetId, TLShapeId } from 'tldraw';
import { myAssetStore } from './imageStore';
import webpfy from 'webpfy';

export async function insertImage(editor: Editor, file: File) {
  // 1. Узнаём размеры без изменения
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;

  console.log(`Исходные размеры изображения: ${w}x${h}px`);

  // 2. Конвертируем в WebP с высоким качеством
  let fileToUpload = file;
  let mimeType = file.type;

  if (!file.type.includes('webp')) {
    try {
      console.log(
        `Конвертируем изображение ${file.name} (${file.type}) в WebP с высоким качеством...`,
      );

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

      const compressionRatio = (((file.size - webpBlob.size) / file.size) * 100).toFixed(1);
      console.log(
        `Изображение конвертировано в WebP с высоким качеством. Размер: ${file.size} -> ${webpBlob.size} байт (сжатие: ${compressionRatio}%)`,
      );
    } catch (error) {
      console.warn('Не удалось конвертировать в WebP, используем оригинальный файл:', error);
    }
  } else {
    console.log('Изображение уже в формате WebP');
  }

  // 3. Загружаем файл (с валидацией размера в imageStore.ts)
  const src = await myAssetStore.upload(null, fileToUpload);

  // 4. добавляем asset + shape в одной транзакции для лучшей производительности
  const assetId = `asset:${nanoid()}` as TLAssetId;
  const shapeId = `shape:${nanoid()}` as TLShapeId;

  console.log('Создаем asset и shape в одной транзакции...');

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
