import { displayPixelSize } from './rasterBudget';
import { isMemoryConstrainedDevice, maxDecodePixels } from './deviceBudget';

/**
 * Сколько пикселей картинок одновременно держим в полной резкости на iPhone/iPad.
 * 40 Мп ≈ 160 МБ RGBA: вместе с остальной доской это ниже порога, за которым iOS
 * убивает вкладку. Что не влезло, остаётся на экране уменьшенной копией, а не серой карточкой.
 */
export const IMAGE_BUDGET_PIXELS_CONSTRAINED = 40_000_000;

export type ImageBudgetStatus = 'none' | 'granted' | 'denied';

/** Полный размер не влез в бюджет: картинка остаётся, но не резче этого края. */
export const IMAGE_LOW_QUALITY_EDGE = 2048;
export const IMAGE_LOW_QUALITY_PIXELS = IMAGE_LOW_QUALITY_EDGE * IMAGE_LOW_QUALITY_EDGE;

export type ImageQuality = 'full' | 'low';

export type ImageBudget = {
  /** `false` — бюджет не ограничивает (десктоп), всё показываем сразу. */
  readonly enabled: boolean;
  request(id: string, cost: number, forced?: boolean): ImageBudgetStatus;
  /**
   * Полная резкость, пока хватает места. Иначе уменьшенная копия.
   * Картинку это не прячет: оба варианта её показывают.
   */
  requestQuality(id: string, fullCost: number, lowCost: number): ImageQuality;
  release(id: string): void;
  status(id: string): ImageBudgetStatus;
  /** `low`, пока для id ещё не было `requestQuality`. */
  quality(id: string): ImageQuality;
  subscribe(listener: () => void): () => void;
};

/**
 * Очередь «кто первый встал, того и места». Освободившийся бюджет сразу достаётся
 * ждущим по порядку, поэтому при панорамировании картинки появляются по мере освобождения.
 * `forced` (выбранная фигура) проходит вне бюджета: пользователь явно хочет её увидеть.
 */
export function createImageBudget(limit: number): ImageBudget {
  const enabled = Number.isFinite(limit);
  const granted = new Map<string, number>();
  const waiting = new Map<string, number>();
  const qualityOf = new Map<string, ImageQuality>();
  const fullCostOf = new Map<string, number>();
  const listeners = new Set<() => void>();
  let used = 0;

  const notify = () => listeners.forEach((listener) => listener());

  const grant = (id: string, cost: number) => {
    waiting.delete(id);
    granted.set(id, cost);
    used += cost;
  };

  return {
    enabled,
    request(id, cost, forced = false) {
      const safeCost = Math.max(0, cost);
      const current = granted.get(id);
      if (current !== undefined) {
        // Уже показываем: рост стоимости (зум) места не отнимает, только учитывается.
        used += safeCost - current;
        granted.set(id, safeCost);
        return 'granted';
      }
      if (!enabled || forced || used + safeCost <= limit) {
        grant(id, safeCost);
        notify();
        return 'granted';
      }
      const wasWaiting = waiting.has(id);
      waiting.set(id, safeCost);
      if (!wasWaiting) notify();
      return 'denied';
    },
    requestQuality(id, fullCost, lowCost) {
      const full = Math.max(0, fullCost);
      const low = Math.max(0, Math.min(lowCost, full > 0 ? full : lowCost));
      const previous = granted.get(id);
      const usedWithout = previous === undefined ? used : Math.max(0, used - previous);
      // Неизвестный размер не зажимаем: оценивать ещё нечего.
      const wantFull = !enabled || full === 0 || usedWithout + full <= limit;
      const nextCost = wantFull ? full : low;
      const next: ImageQuality = wantFull ? 'full' : 'low';
      const prevQuality = qualityOf.get(id);
      fullCostOf.set(id, full);
      waiting.delete(id);
      granted.set(id, nextCost);
      qualityOf.set(id, next);
      used = usedWithout + nextCost;
      if (previous !== nextCost || prevQuality !== next) notify();
      return next;
    },
    release(id) {
      const wasWaiting = waiting.delete(id);
      fullCostOf.delete(id);
      const hadQuality = qualityOf.delete(id);
      const current = granted.get(id);
      if (current === undefined) {
        if (wasWaiting || hadQuality) notify();
        return;
      }
      granted.delete(id);
      used = Math.max(0, used - current);
      for (const [waitingId, cost] of waiting) {
        if (used + cost <= limit) grant(waitingId, cost);
      }
      // Освободившееся место возвращает уменьшенным картинкам полную резкость.
      for (const [otherId, otherFull] of fullCostOf) {
        if (qualityOf.get(otherId) !== 'low' || otherFull <= 0) continue;
        const currentLow = granted.get(otherId) ?? 0;
        if (used - currentLow + otherFull > limit) continue;
        used = used - currentLow + otherFull;
        granted.set(otherId, otherFull);
        qualityOf.set(otherId, 'full');
      }
      notify();
    },
    status(id) {
      if (granted.has(id)) return 'granted';
      if (waiting.has(id)) return 'denied';
      return 'none';
    },
    quality(id) {
      return qualityOf.get(id) ?? 'low';
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const boardImageBudget: ImageBudget = createImageBudget(
  isMemoryConstrainedDevice() ? IMAGE_BUDGET_PIXELS_CONSTRAINED : Number.POSITIVE_INFINITY,
);

/**
 * Во сколько пикселей декодированной памяти обойдётся картинка на экране.
 * Если файл уменьшается под зум (пайплайн `resolveDisplayImageUrl`), считаем уменьшенный растр.
 * Огромные файлы, GIF и SVG показываются оригиналом, их считаем целиком.
 */
export function estimateImageDisplayPixels(input: {
  assetWidth: number;
  assetHeight: number;
  steppedScreenScale: number;
  dpr: number;
  /** `false` для GIF/SVG: их уменьшить нельзя. */
  resizable: boolean;
}): number {
  const original = Math.max(1, input.assetWidth) * Math.max(1, input.assetHeight);
  if (!input.resizable || original > maxDecodePixels()) return original;
  const target = displayPixelSize(
    input.assetWidth,
    input.assetHeight,
    input.steppedScreenScale,
    input.dpr,
  );
  return target ? target.width * target.height : original;
}
