import { nanoid } from 'nanoid';
import { Editor, TLAssetId, TLShapeId } from 'tldraw';
import { myAssetStore } from './imageStore';
import webpfy from 'webpfy';

export async function insertImage(editor: Editor, file: File) {
  // 1. узнаём размеры и оптимизируем их
  const bitmap = await createImageBitmap(file);
  let { width: w, height: h } = bitmap;

  // Ограничиваем максимальный размер изображения для производительности
  const MAX_SIZE = 1920; // Максимальная ширина или высота
  if (w > MAX_SIZE || h > MAX_SIZE) {
    const scale = Math.min(MAX_SIZE / w, MAX_SIZE / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
    console.log(`Изображение масштабировано до ${w}x${h} для оптимизации производительности`);
  }

  // 2. конвертируем в WebP если это не WebP уже
  let fileToUpload = file;
  let mimeType = file.type;

  if (!file.type.includes('webp')) {
    try {
      console.log(`Конвертируем изображение ${file.name} (${file.type}) в WebP...`);

      // Оптимизируем настройки WebP для лучшей производительности
      const { webpBlob, fileName } = await webpfy({
        image: file,
        quality: 0.9, // Снижаем качество для меньшего размера файла
      });

      // Создаем новый File объект из WebP Blob
      fileToUpload = new File([webpBlob], fileName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });
      mimeType = 'image/webp';

      const compressionRatio = (((file.size - webpBlob.size) / file.size) * 100).toFixed(1);
      console.log(
        `Изображение успешно конвертировано в WebP. Размер: ${file.size} -> ${webpBlob.size} байт (сжатие: ${compressionRatio}%)`,
      );
    } catch (error) {
      console.warn('Не удалось конвертировать в WebP, используем оригинальный файл:', error);
    }
  } else {
    console.log('Изображение уже в формате WebP, пропускаем конвертацию');
  }

  // 3. грузим на сервер → получаем URL
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
        mimeType: mimeType,
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
