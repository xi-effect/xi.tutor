import { nanoid } from 'nanoid';
import { Editor, TLAssetId, TLShapeId } from 'tldraw';
import { myAssetStore } from './imageStore';

export async function insertImage(editor: Editor, file: File) {
  // 1. узнаём размеры
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;

  // 2. грузим на сервер → получаем URL
  const src = await myAssetStore.upload(null, file);

  // 3. добавляем asset + shape
  const assetId = nanoid();
  editor.createAssets([
    {
      id: assetId as TLAssetId,
      type: 'image',
      typeName: 'asset',
      props: {
        src,
        mimeType: file.type,
        w,
        h,
        name: file.name,
        isAnimated: false,
      },
      meta: {},
    },
  ]);

  const shapeId = nanoid();
  editor.createShapes([
    {
      id: shapeId as TLShapeId,
      type: 'image',
      x: 0,
      y: 0,
      props: {
        w,
        h,
        assetId,
      },
    },
  ]);
}
