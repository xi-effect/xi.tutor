export type PageBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export function boxSize(box: PageBox) {
  return {
    w: Math.max(0, box.maxX - box.minX),
    h: Math.max(0, box.maxY - box.minY),
  };
}

export function unionBox(a: PageBox, b: PageBox): PageBox {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

/** Добавляет поля вокруг содержимого, чтобы фигуры не прилипали к краю карты. */
export function padBox(box: PageBox, ratio: number): PageBox {
  const { w, h } = boxSize(box);
  const padX = Math.max(w * ratio, 1);
  const padY = Math.max(h * ratio, 1);
  return {
    minX: box.minX - padX,
    minY: box.minY - padY,
    maxX: box.maxX + padX,
    maxY: box.maxY + padY,
  };
}

/**
 * Вписывает прямоугольник в пропорции канвы миникарты, не обрезая содержимое.
 * `aspect` — ширина канвы, делённая на высоту.
 */
export function fitBoxToAspect(content: PageBox, aspect: number): PageBox {
  const { w, h } = boxSize(content);
  const safeW = Math.max(w, 1);
  const safeH = Math.max(h, 1);
  const safeAspect = aspect > 0 ? aspect : 1;
  let targetW = safeW;
  let targetH = targetW / safeAspect;
  if (targetH < safeH) {
    targetH = safeH;
    targetW = targetH * safeAspect;
  }
  const centerX = content.minX + safeW / 2;
  const centerY = content.minY + safeH / 2;
  return {
    minX: centerX - targetW / 2,
    minY: centerY - targetH / 2,
    maxX: centerX + targetW / 2,
    maxY: centerY + targetH / 2,
  };
}

export function clientToPage(
  clientX: number,
  clientY: number,
  canvas: { left: number; top: number; width: number; height: number },
  page: PageBox,
) {
  const { w, h } = boxSize(page);
  const width = canvas.width || 1;
  const height = canvas.height || 1;
  return {
    x: ((clientX - canvas.left) / width) * w + page.minX,
    y: ((clientY - canvas.top) / height) * h + page.minY,
  };
}

export function containsPoint(box: PageBox, x: number, y: number) {
  return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
}

/** Растягивает короткую сторону, чтобы тонкая линия оставалась видимой на карте. */
export function visibleMark(
  shape: { x: number; y: number; w: number; h: number },
  minSize: number,
) {
  const w = Math.max(shape.w, minSize);
  const h = Math.max(shape.h, minSize);
  return {
    x: shape.x + shape.w / 2 - w / 2,
    y: shape.y + shape.h / 2 - h / 2,
    w,
    h,
  };
}
