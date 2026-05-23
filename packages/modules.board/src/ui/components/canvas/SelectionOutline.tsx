import { track, useEditor } from '@ibodr/draw';
import { useYjsContext } from '../../../providers/YjsProvider';

/** Конвертирует page-point в координаты внутри .dr-container */
function pagePointToContainerLocal(
  editor: ReturnType<typeof useEditor>,
  point: { x: number; y: number },
) {
  const screen = editor.pageToScreen(point);
  const rect = editor.getContainer().getBoundingClientRect();
  return { x: screen.x - rect.left, y: screen.y - rect.top };
}

function getRotatedPageCorners(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const corners = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];

  if (!rotation) return corners;

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return corners.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  });
}

/**
 * DOM-fallback рамки выделения.
 * Canvas overlay (@ibodr/draw) не всегда перерисовывается при смене selection —
 * меню (SelectionMenu) видно, а штрихи на .dr-canvas-overlays остаются пустыми.
 */
export const SelectionOutline = track(function SelectionOutline() {
  const editor = useEditor();
  const { isReadonly } = useYjsContext();

  const selectedIds = editor.getSelectedShapeIds();
  const isSelect = editor.isIn('select');
  const isBrushing = editor.isIn('select.brushing');
  const pageBounds = editor.getSelectionRotatedPageBounds();

  if (isReadonly || !selectedIds.length || !isSelect || isBrushing || !pageBounds) return null;

  const container = editor.getContainer();
  const containerRect = container.getBoundingClientRect();
  if (containerRect.width <= 0 || containerRect.height <= 0) return null;

  const isLocked = editor.getSelectedShapes().every((s) => s.isLocked);
  const strokeColor = isLocked ? '#b4b5bc' : 'var(--dr-color-selection-stroke, hsl(214, 84%, 56%))';

  const rotation = editor.getSelectionRotation();

  const selectionCorners = getRotatedPageCorners(
    pageBounds.x,
    pageBounds.y,
    pageBounds.width,
    pageBounds.height,
    rotation,
  );
  const selectionPoints = selectionCorners
    .map((p) => pagePointToContainerLocal(editor, p))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  const shapeOutlines = selectedIds.flatMap((id) => {
    const shape = editor.getShape(id);
    if (!shape || shape.isLocked) return [];
    const bounds = editor.getShapePageBounds(id);
    if (!bounds) return [];

    const shapeRotation = editor.getShapePageTransform(id)?.rotation() ?? 0;
    const corners = getRotatedPageCorners(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      shapeRotation,
    );
    const points = corners
      .map((p) => pagePointToContainerLocal(editor, p))
      .map((p) => `${p.x},${p.y}`)
      .join(' ');

    return [{ id, points }];
  });

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 overflow-visible"
      width={containerRect.width}
      height={containerRect.height}
      aria-hidden
    >
      {shapeOutlines.map(({ id, points }) => (
        <polygon
          key={id}
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <polygon
        points={selectionPoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
});
