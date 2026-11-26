export type DragPoint = { x: number; y: number };

export type DraggedBox = { x: number; y: number; w: number; h: number };

/** Прямоугольник от точки нажатия. При lockAspect обе стороны равны большей из них. */
export function draggedBox(start: DragPoint, current: DragPoint, lockAspect: boolean): DraggedBox {
  let width = Math.abs(current.x - start.x);
  let height = Math.abs(current.y - start.y);

  if (lockAspect) {
    const side = Math.max(width, height);
    width = side;
    height = side;
  }

  return {
    x: current.x >= start.x ? start.x : start.x - width,
    y: current.y >= start.y ? start.y : start.y - height,
    w: width,
    h: height,
  };
}
