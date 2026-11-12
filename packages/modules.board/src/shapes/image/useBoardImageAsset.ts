import {
  useEditor,
  useValue,
  type DrAssetId,
  type DrShapeId,
  type DrImageAsset,
} from '@ibodr/draw';
import { useYjsContext } from '../../providers/YjsContext';
import { staticImagePixels } from '../../utils/displayImage';
import { displayPixelSize } from '../../utils/rasterBudget';
import { useBoardImageUrl } from '../../utils/useBoardImageUrl';

export function useBoardImageAsset({
  shapeId,
  assetId,
  width,
}: {
  shapeId: DrShapeId;
  assetId: DrAssetId | null;
  width: number;
}) {
  const editor = useEditor();
  const { token } = useYjsContext();
  const asset = useValue(
    'board image asset',
    () => (assetId ? (editor.getAsset<DrImageAsset>(assetId) ?? null) : null),
    [editor, assetId],
  );
  const preview = useValue(
    'board image preview',
    () => (assetId ? editor.getTemporaryAssetPreview(assetId) : null),
    [editor, assetId],
  );
  const moving = useValue('board image camera moving', () => editor.getCameraState() === 'moving', [
    editor,
  ]);
  const culled = useValue('board image culled', () => editor.getCulledShapes().has(shapeId), [
    editor,
    shapeId,
  ]);
  const pixels = asset ? staticImagePixels(asset) : null;
  const assetWidth = pixels?.w ?? 0,
    assetHeight = pixels?.h ?? 0;
  const maxEdge = useValue(
    'board image target resolution',
    () => {
      if (!assetWidth || !assetHeight) return null;
      const scale = (editor.getEfficientZoomLevel() * width) / assetWidth;
      const stepped = scale > 0 ? 2 ** Math.ceil(Math.log2(scale)) : 1;
      const target = displayPixelSize(
        assetWidth,
        assetHeight,
        stepped,
        editor.getInstanceState().devicePixelRatio,
      );
      return target ? Math.max(target.width, target.height) : null;
    },
    [editor, width, assetWidth, assetHeight],
  );
  const src = asset?.props.src || preview || '';
  const url = useBoardImageUrl({
    src,
    token: token ?? '',
    maxEdge,
    hint: pixels ?? undefined,
    moving,
    enabled: !culled,
  });
  return { asset, url };
}
