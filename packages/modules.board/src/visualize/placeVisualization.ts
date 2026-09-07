import { Box, type DrShapeId, type Editor } from '@ibodr/draw';

const PLACEMENT_GAP = 16;

const COLLISION_GAP = 16;

export function getSourcePlacementPagePoint(
  editor: Editor,
  sourceShapeId: DrShapeId,
): { x: number; y: number } | null {
  const bounds = editor.getShapePageBounds(sourceShapeId);
  if (!bounds) return null;
  return { x: bounds.maxX + PLACEMENT_GAP, y: bounds.minY };
}

export function findFreePagePoint(
  editor: Editor,
  start: { x: number; y: number },
  width: number,
  height: number,
  ignoreIds: Iterable<DrShapeId>,
): { x: number; y: number } {
  const ignored = new Set(ignoreIds);
  const existingBounds = editor
    .getCurrentPageShapes()
    .filter((shape) => !ignored.has(shape.id))
    .map((shape) => editor.getShapePageBounds(shape.id))
    .filter((bounds): bounds is Box => bounds !== undefined);

  const point = { x: start.x, y: start.y };
  const box = new Box(point.x, point.y, width, height);

  let guard = 0;
  while (existingBounds.some((bound) => box.collides(bound)) && guard < 24) {
    point.x += width / 2 + COLLISION_GAP;
    box.x = point.x;
    guard += 1;
  }

  return point;
}
