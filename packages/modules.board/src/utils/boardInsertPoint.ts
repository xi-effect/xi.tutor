export type BoardPoint = { x: number; y: number };

let rememberedInsertPoint: BoardPoint | null = null;

/** Последний щелчок по пустой области. Живёт только в этой вкладке. */
export function rememberBoardInsertPoint(point: BoardPoint) {
  rememberedInsertPoint = { x: point.x, y: point.y };
}

export function getRememberedInsertPoint(): BoardPoint | null {
  if (!rememberedInsertPoint) return null;
  return { x: rememberedInsertPoint.x, y: rememberedInsertPoint.y };
}
