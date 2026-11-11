import { displayPixelSize } from './rasterBudget';
import { isMemoryConstrainedDevice, maxDecodePixels } from './deviceBudget';

/**
 * Сколько пикселей картинок одновременно держим на экране на iPhone/iPad.
 * 40 Мп ≈ 160 МБ RGBA: вместе с остальной доской это ниже порога, за которым iOS
 * убивает вкладку. Доска, открытая с зумом «вписать всё», иначе декодирует
 * все картинки сразу, хотя каждая занимает на экране несколько десятков пикселей.
 */
export const IMAGE_BUDGET_PIXELS_CONSTRAINED = 40_000_000;

export type ImageBudgetStatus = 'none' | 'granted' | 'denied';

export type ImageBudget = {
  /** `false` — бюджет не ограничивает (десктоп), всё показываем сразу. */
  readonly enabled: boolean;
  request(id: string, cost: number, forced?: boolean): ImageBudgetStatus;
  release(id: string): void;
  status(id: string): ImageBudgetStatus;
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
    release(id) {
      const wasWaiting = waiting.delete(id);
      const current = granted.get(id);
      if (current === undefined) {
        if (wasWaiting) notify();
        return;
      }
      granted.delete(id);
      used = Math.max(0, used - current);
      for (const [waitingId, cost] of waiting) {
        if (used + cost <= limit) grant(waitingId, cost);
      }
      notify();
    },
    status(id) {
      if (granted.has(id)) return 'granted';
      if (waiting.has(id)) return 'denied';
      return 'none';
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
 * Файл настолько велик, что на слабом устройстве его оригинал нельзя декодировать
 * ни целиком, ни ради уменьшенной копии: показываем только по явному выбору пользователя.
 */
export function isOversizedForDevice(width: number, height: number): boolean {
  return isMemoryConstrainedDevice() && width * height > maxDecodePixels();
}

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
