import type { DrShapeId, Editor } from '@ibodr/draw';

/** Блок «Добро пожаловать» на демонстрационной доске. */
export const DEMO_BOARD_GUIDE_SHAPE_IDS = [
  'shape:kDo0o5bDzKUV83aEpdlC3',
  'shape:im4Pi75pgyOMDBMOieqje',
  'shape:zfs5uQL_IyvvD7dSDIMe4',
  'shape:ZEJgyBno7tdI2a-EfGNvU',
  'shape:lwal0XvOLE_5jEdpoK5mg',
  'shape:z_HgL1hW0ZDweyFFjir3o',
  'shape:YWpNrf4EMhggKonReHZFv',
  'shape:G3x27-N9NZDqqwKkJUUOA',
  'shape:PwXE-ve4qNwVC1au11b_D',
  'shape:QjMMSg6YJuWkNzub5Dhkf',
  'shape:omtKopiY7j3erwFarpo6L',
  'shape:W-FMSubASZNj-5wOqWbv8',
  'shape:okdacN_lnH-4-pMlPrZDP',
] as const;

export const DEMO_BOARD_GUIDE_ZOOM = 0.45;

export type GuideCamera = { x: number; y: number; z: number };

export const cameraCenteredOnBounds = (
  bounds: { x: number; y: number; w: number; h: number },
  viewport: { w: number; h: number },
  zoom: number,
): GuideCamera => ({
  // Та же формула, что у editor.zoomToBounds: центр bounds в центре экрана.
  x: -bounds.x + (viewport.w - bounds.w * zoom) / 2 / zoom,
  y: -bounds.y + (viewport.h - bounds.h * zoom) / 2 / zoom,
  z: zoom,
});

const MIN_GUIDE_VIEWPORT = 320;

/** Ставит камеру по центру приветственного блока демодоски. */
export const focusDemoBoardGuide = (editor: Editor): boolean => {
  const viewport = editor.getViewportScreenBounds();
  if (viewport.width < MIN_GUIDE_VIEWPORT || viewport.height < MIN_GUIDE_VIEWPORT) return false;

  const ids = DEMO_BOARD_GUIDE_SHAPE_IDS.filter((id) =>
    editor.getShape(id as DrShapeId),
  ) as DrShapeId[];
  if (!ids.length) return false;

  let bounds = editor.getShapePageBounds(ids[0]);
  if (!bounds) return false;
  for (let index = 1; index < ids.length; index += 1) {
    const next = editor.getShapePageBounds(ids[index]);
    if (next) bounds = bounds.union(next);
  }

  editor.setCamera(
    cameraCenteredOnBounds(
      bounds,
      { w: viewport.width, h: viewport.height },
      DEMO_BOARD_GUIDE_ZOOM,
    ),
  );
  return true;
};
