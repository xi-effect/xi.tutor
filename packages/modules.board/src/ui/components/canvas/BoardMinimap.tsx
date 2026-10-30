import { useEditor, useQuickReactor, type DrShapeId } from '@ibodr/draw';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { boardPanelClass } from '../../boardTheme';
import {
  clientToPage,
  containsPoint,
  fitBoxToAspect,
  padBox,
  unionBox,
  visibleMark,
  type PageBox,
} from './minimapGeometry';

const SHAPE_FILL = '#8EB6F2';
const SELECTED_FILL = '#4C86E0';

type ShapeMark = {
  id: DrShapeId;
  x: number;
  y: number;
  w: number;
  h: number;
  selected: boolean;
};

type DragState = {
  frame: PageBox;
  offsetX: number;
  offsetY: number;
};

function toBox(box: { minX: number; minY: number; maxX: number; maxY: number }): PageBox {
  return { minX: box.minX, minY: box.minY, maxX: box.maxX, maxY: box.maxY };
}

export const BoardMinimap = () => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<PageBox | null>(null);
  const viewportRef = useRef<PageBox | null>(null);
  const marksRef = useRef<ShapeMark[]>([]);

  const rebuildMarks = () => {
    const selectedIds = new Set(editor.getSelectedShapeIds());
    const marks: ShapeMark[] = [];
    for (const id of editor.getCurrentPageShapeIds()) {
      const bounds = editor.getShapePageBounds(id);
      if (!bounds || (bounds.w <= 0 && bounds.h <= 0)) continue;
      marks.push({
        id,
        x: bounds.x,
        y: bounds.y,
        w: bounds.w,
        h: bounds.h,
        selected: selectedIds.has(id),
      });
    }
    marksRef.current = marks;
  };

  const paint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport = editor.getViewportPageBounds();
    const pageBounds = editor.getCurrentPageBounds();
    const viewportBox = toBox(viewport);
    viewportRef.current = viewportBox;

    const selectedIds = new Set(editor.getSelectedShapeIds());
    for (const mark of marksRef.current) mark.selected = selectedIds.has(mark.id);

    const content = pageBounds
      ? unionBox(padBox(toBox(pageBounds), 0.08), viewportBox)
      : padBox(viewportBox, 0.45);
    // Во время драга держим уже вписанный кадр. Иначе каждый кадр заново
    // вписываем содержимое доски, а не предыдущий fitted-прямоугольник.
    const pageFrame = dragRef.current?.frame ?? content;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const fitted = fitBoxToAspect(pageFrame, rect.width / rect.height);
    frameRef.current = fitted;
    if (dragRef.current) dragRef.current.frame = fitted;

    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(rect.width * dpr);
    const pixelHeight = Math.round(rect.height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = rect.width / Math.max(fitted.maxX - fitted.minX, 1);
    const minMark = 2.5 / scale;
    ctx.setTransform(
      dpr * scale,
      0,
      0,
      dpr * scale,
      -fitted.minX * dpr * scale,
      -fitted.minY * dpr * scale,
    );
    ctx.clearRect(fitted.minX, fitted.minY, fitted.maxX - fitted.minX, fitted.maxY - fitted.minY);

    const paintMarks = (selected: boolean) => {
      ctx.beginPath();
      for (const shape of marksRef.current) {
        if (shape.selected !== selected) continue;
        const mark = visibleMark(shape, minMark);
        ctx.rect(mark.x, mark.y, mark.w, mark.h);
      }
      ctx.fill();
    };
    ctx.fillStyle = SHAPE_FILL;
    paintMarks(false);
    ctx.fillStyle = SELECTED_FILL;
    paintMarks(true);

    ctx.beginPath();
    ctx.rect(
      viewport.minX,
      viewport.minY,
      viewport.maxX - viewport.minX,
      viewport.maxY - viewport.minY,
    );
    ctx.strokeStyle = getComputedStyle(canvas).color || '#111111';
    ctx.lineWidth = 1.75 / scale;
    ctx.stroke();
  };

  const paintRef = useRef(paint);
  paintRef.current = paint;

  useEffect(() => {
    rebuildMarks();
    paintRef.current();
    return editor.store.listen(
      () => {
        rebuildMarks();
        paintRef.current();
      },
      { scope: 'document' },
    );
    // Метки зависят только от документа. Камера перерисовывает уже готовый список.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useQuickReactor(
    'board minimap',
    () => {
      editor.getViewportPageBounds();
      editor.getSelectedShapeIds();
      editor.getCurrentPageBounds();
      paintRef.current();
    },
    [editor],
  );

  const moveCamera = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const drag = dragRef.current;
    const pageFrame = frameRef.current;
    if (!canvas || !drag || !pageFrame) return;
    const rect = canvas.getBoundingClientRect();
    const fitted = fitBoxToAspect(pageFrame, rect.width / Math.max(rect.height, 1));
    const point = clientToPage(clientX, clientY, rect, fitted);
    editor.centerOnPoint({ x: point.x + drag.offsetX, y: point.y + drag.offsetY });
  };

  return (
    <div className={`${boardPanelClass} pointer-events-auto p-1`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={t('minimap.label')}
        className="text-text-primary block h-[168px] w-[min(280px,calc(100vw-2rem))] cursor-grab touch-none rounded-lg active:cursor-grabbing"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const canvas = canvasRef.current;
          const pageFrame = frameRef.current;
          const viewportBox = viewportRef.current;
          if (!canvas || !pageFrame || !viewportBox) return;
          event.stopPropagation();
          editor.markEventAsHandled(event);
          canvas.setPointerCapture(event.pointerId);

          const rect = canvas.getBoundingClientRect();
          const fitted = fitBoxToAspect(pageFrame, rect.width / Math.max(rect.height, 1));
          const point = clientToPage(event.clientX, event.clientY, rect, fitted);
          const inside = containsPoint(viewportBox, point.x, point.y);
          const centerX = (viewportBox.minX + viewportBox.maxX) / 2;
          const centerY = (viewportBox.minY + viewportBox.maxY) / 2;
          dragRef.current = {
            frame: fitted,
            offsetX: inside ? centerX - point.x : 0,
            offsetY: inside ? centerY - point.y : 0,
          };
          frameRef.current = fitted;
          if (!inside) {
            editor.centerOnPoint(point, { animation: { duration: 120 } });
          }
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          event.stopPropagation();
          moveCamera(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (!dragRef.current) return;
          dragRef.current = null;
          if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
            canvasRef.current.releasePointerCapture(event.pointerId);
          }
          paintRef.current();
        }}
      />
    </div>
  );
};
