import { Box, Editor } from '@ibodr/draw';

const GAP = 12;
const SEARCH_RINGS = 4;

export type PlacementBounds = { x: number; y: number; w: number; h: number };
export type PlacementPoint = { x: number; y: number };

function intersects(a: PlacementBounds, b: PlacementBounds) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function expand(bounds: PlacementBounds, gap: number): PlacementBounds {
  return {
    x: bounds.x - gap,
    y: bounds.y - gap,
    w: bounds.w + gap * 2,
    h: bounds.h + gap * 2,
  };
}

export function isPointInsideViewport(point: PlacementPoint, viewport: PlacementBounds) {
  return (
    point.x >= viewport.x &&
    point.x <= viewport.x + viewport.w &&
    point.y >= viewport.y &&
    point.y <= viewport.y + viewport.h
  );
}

export function placementAtPoint(
  point: PlacementPoint,
  width: number,
  height: number,
): PlacementPoint {
  return { x: point.x - width / 2, y: point.y - height / 2 };
}

/** Уменьшает только слишком большие изображения, чтобы они помещались в видимую область. */
export function fitDisplaySize(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  fraction = 0.8,
) {
  if (width <= 0 || height <= 0) return { w: 1, h: 1 };
  if (viewportWidth <= 0 || viewportHeight <= 0) return { w: width, h: height };
  const scale = Math.min(
    1,
    (viewportWidth * fraction) / width,
    (viewportHeight * fraction) / height,
  );
  return { w: Math.max(1, width * scale), h: Math.max(1, height * scale) };
}

function centerInside(viewport: PlacementBounds, box: PlacementBounds) {
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  return isPointInsideViewport({ x: centerX, y: centerY }, viewport);
}

/**
 * Ищет свободное место внутри видимой области.
 * Если свободного места нет, возвращает центр: перекрытие допустимо, уход за экран — нет.
 */
export function findOpenPlacement(
  viewport: PlacementBounds,
  shapeWidth: number,
  shapeHeight: number,
  obstacles: PlacementBounds[],
): PlacementPoint {
  const center = {
    x: viewport.x + (viewport.w - shapeWidth) / 2,
    y: viewport.y + (viewport.h - shapeHeight) / 2,
  };
  const stepX = Math.max(24, Math.min(shapeWidth * 0.5, 160));
  const stepY = Math.max(24, Math.min(shapeHeight * 0.5, 160));
  const candidates: PlacementPoint[] = [center];

  for (let ring = 1; ring <= SEARCH_RINGS; ring += 1) {
    for (let ix = -ring; ix <= ring; ix += 1) {
      for (let iy = -ring; iy <= ring; iy += 1) {
        if (Math.max(Math.abs(ix), Math.abs(iy)) !== ring) continue;
        candidates.push({ x: center.x + ix * stepX, y: center.y + iy * stepY });
      }
    }
  }

  const findFree = (gap: number) => {
    for (const candidate of candidates) {
      const box = { x: candidate.x, y: candidate.y, w: shapeWidth, h: shapeHeight };
      if (!centerInside(viewport, box)) continue;
      const blocked = obstacles.some((obstacle) => intersects(box, expand(obstacle, gap)));
      if (!blocked) return candidate;
    }
    return null;
  };

  return findFree(GAP) ?? findFree(0) ?? center;
}

export const resolveShapeCoordinates = (
  editor: Editor,
  shapeWidth: number,
  shapeHeight: number,
) => {
  const viewport = editor.getViewportPageBounds();
  const obstacles = editor
    .getCurrentPageShapes()
    .map((shape) => editor.getShapePageBounds(shape.id))
    .filter((bounds): bounds is Box => bounds !== undefined)
    .map((bounds) => ({ x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h }));

  return findOpenPlacement(
    { x: viewport.x, y: viewport.y, w: viewport.w, h: viewport.h },
    shapeWidth,
    shapeHeight,
    obstacles,
  );
};
