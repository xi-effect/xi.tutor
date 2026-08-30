import type { AnnotationStroke } from 'common.platform';

/**
 * The video is rendered with `object-fit: contain`, so it only occupies part of
 * its element when aspect ratios differ. Strokes must land inside that box, not
 * inside the letterboxed element.
 */
export type ContainBox = { left: number; top: number; width: number; height: number };

export function containBox(
  elementWidth: number,
  elementHeight: number,
  videoWidth: number,
  videoHeight: number,
): ContainBox {
  if (videoWidth <= 0 || videoHeight <= 0) {
    return { left: 0, top: 0, width: elementWidth, height: elementHeight };
  }
  const scale = Math.min(elementWidth / videoWidth, elementHeight / videoHeight);
  const width = videoWidth * scale;
  const height = videoHeight * scale;
  return {
    left: (elementWidth - width) / 2,
    top: (elementHeight - height) / 2,
    width,
    height,
  };
}

function applyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  stroke: AnnotationStroke,
  box: ContainBox,
): void {
  const lineWidth = Math.max(1, stroke.width * box.height);
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.globalAlpha = 1;
  } else if (stroke.tool === 'highlighter') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = 0.35;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = 1;
  }
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  strokes: AnnotationStroke[],
  box: ContainBox,
  dpr: number,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.scale(dpr, dpr);

  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    applyStrokeStyle(ctx, stroke, box);

    const toX = (x: number) => box.left + x * box.width;
    const toY = (y: number) => box.top + y * box.height;

    ctx.beginPath();
    const [firstX, firstY] = stroke.points[0];
    ctx.moveTo(toX(firstX), toY(firstY));

    if (stroke.points.length === 1) {
      ctx.lineTo(toX(firstX) + 0.01, toY(firstY));
    } else {
      for (let i = 1; i < stroke.points.length; i += 1) {
        const [prevX, prevY] = stroke.points[i - 1];
        const [pointX, pointY] = stroke.points[i];
        const midX = (toX(prevX) + toX(pointX)) / 2;
        const midY = (toY(prevY) + toY(pointY)) / 2;
        ctx.quadraticCurveTo(toX(prevX), toY(prevY), midX, midY);
      }
      const [lastX, lastY] = stroke.points[stroke.points.length - 1];
      ctx.lineTo(toX(lastX), toY(lastY));
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
