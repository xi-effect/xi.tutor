import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useEditor } from '@ibodr/draw';
import { CommentRegionBox } from './CommentRegionBox';
import { MIN_REGION_SIZE } from './commentQueries';

/** Меньшее смещение указателя (px экрана) трактуется как обычный точечный комментарий. */
const REGION_DRAG_THRESHOLD = 8;

type CommentPlacementLayerProps = {
  /** Одиночный клик — точечный комментарий в этой точке страницы. */
  onPoint: (pagePoint: { x: number; y: number }) => void;
  /** Протянули рамку — комментарий к области: `pinPagePoint` это правый нижний угол выделения. */
  onRegion: (pinPagePoint: { x: number; y: number }, size: { w: number; h: number }) => void;
};

/**
 * Слой захвата ввода в режиме «поставить комментарий» (поверх канваса, `InFrontOfTheCanvas`).
 * Работает как DOM-оверлей, а не как инструмент редактора, — чтобы функционал был доступен
 * в readonly-режиме доски и не конфликтовал с undo-историей и переключением инструментов.
 */
export const CommentPlacementLayer = ({ onPoint, onRegion }: CommentPlacementLayerProps) => {
  const editor = useEditor();
  const [drag, setDrag] = useState<{ sx: number; sy: number; cx: number; cy: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Контейнер не меняется в течение жеста — меряем один раз на pointerdown, а не на каждый
  // re-render (пересчитывается на каждый pointermove через setDrag).
  const dragContainerRectRef = useRef<DOMRect | null>(null);

  // Прерываем незавершённый жест, если слой размонтировали (например, по Escape).
  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
    },
    [],
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const start = { sx: e.clientX, sy: e.clientY };
    setDrag({ sx: start.sx, sy: start.sy, cx: start.sx, cy: start.sy });
    dragContainerRectRef.current = editor.getContainer().getBoundingClientRect();

    const ac = new AbortController();
    abortRef.current = ac;

    const finish = () => {
      ac.abort();
      abortRef.current = null;
      dragContainerRectRef.current = null;
      setDrag(null);
    };

    window.addEventListener(
      'pointermove',
      (moveEvent: PointerEvent) => {
        setDrag({ sx: start.sx, sy: start.sy, cx: moveEvent.clientX, cy: moveEvent.clientY });
      },
      { signal: ac.signal },
    );

    window.addEventListener(
      'pointerup',
      (upEvent: PointerEvent) => {
        finish();

        const startPage = editor.screenToPage({ x: start.sx, y: start.sy });
        const moved = Math.hypot(upEvent.clientX - start.sx, upEvent.clientY - start.sy);

        if (moved < REGION_DRAG_THRESHOLD) {
          onPoint({ x: startPage.x, y: startPage.y });
          return;
        }

        const endPage = editor.screenToPage({ x: upEvent.clientX, y: upEvent.clientY });
        const w = Math.abs(endPage.x - startPage.x);
        const h = Math.abs(endPage.y - startPage.y);

        // Область коммитим, только когда обе стороны уже не меньше минимума — тогда рамка-превью
        // совпадает с результатом (без клампа и скачка на отпускании). Иначе — точечный комментарий.
        if (w < MIN_REGION_SIZE || h < MIN_REGION_SIZE) {
          onPoint({ x: startPage.x, y: startPage.y });
          return;
        }

        onRegion(
          { x: Math.max(startPage.x, endPage.x), y: Math.max(startPage.y, endPage.y) },
          { w, h },
        );
      },
      { signal: ac.signal },
    );

    // Браузер может забрать жест себе (скролл на тач-устройствах) — тогда приходит
    // pointercancel вместо pointerup: просто снимаем слушатели, ничего не создаём.
    window.addEventListener('pointercancel', () => finish(), { signal: ac.signal });
  };

  const preview = drag
    ? (() => {
        const rect = dragContainerRectRef.current ?? editor.getContainer().getBoundingClientRect();
        return {
          left: Math.min(drag.sx, drag.cx) - rect.left,
          top: Math.min(drag.sy, drag.cy) - rect.top,
          width: Math.abs(drag.cx - drag.sx),
          height: Math.abs(drag.cy - drag.sy),
        };
      })()
    : null;

  return (
    <>
      <div
        className="pointer-events-auto absolute inset-0 z-40 cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
      />
      {preview && (
        <CommentRegionBox
          left={preview.left}
          top={preview.top}
          width={preview.width}
          height={preview.height}
        />
      )}
    </>
  );
};
