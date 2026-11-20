export const DICE_REROLL_HINT_STORAGE_KEY = 'sovlium.board.diceRerollHintDismissed';

export type HintRect = { x: number; y: number; w: number; h: number };

export type DiceHintSide = 'right' | 'left' | 'bottom' | 'top';

export type DiceHintInsets = { top: number; right: number; bottom: number; left: number };

const EMPTY_INSETS: DiceHintInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export function isDiceRerollHintDismissed(): boolean {
  try {
    return globalThis.localStorage?.getItem(DICE_REROLL_HINT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissDiceRerollHint(): void {
  try {
    globalThis.localStorage?.setItem(DICE_REROLL_HINT_STORAGE_KEY, '1');
  } catch {
    // приватный режим или переполненное хранилище
  }
}

export function boxesOverlap(a: HintRect, b: HintRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Один попап на видимый кубик. Пока выбранный кубик в кадре, подсказка не прыгает на другой. */
export function pickVisibleDiceId<Id extends string>(
  dice: Array<{ id: Id; bounds: HintRect | null }>,
  viewport: HintRect,
  preferredId: Id | null,
): Id | null {
  const visible = dice.filter((shape) => shape.bounds && boxesOverlap(shape.bounds, viewport));
  if (visible.length === 0) return null;
  if (preferredId && visible.some((shape) => shape.id === preferredId)) return preferredId;

  const centerX = viewport.x + viewport.w / 2;
  const centerY = viewport.y + viewport.h / 2;
  let bestId = visible[0].id;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const shape of visible) {
    const bounds = shape.bounds;
    if (!bounds) continue;
    const dx = bounds.x + bounds.w / 2 - centerX;
    const dy = bounds.y + bounds.h / 2 - centerY;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestId = shape.id;
      bestDistance = distance;
    }
  }

  return bestId;
}

/**
 * Ставит подсказку рядом с кубиком, в свободной части экрана.
 * Сначала справа, затем слева, снизу и сверху.
 */
export function placeDiceHint(
  shape: HintRect,
  viewport: { w: number; h: number },
  popup: { w: number; h: number },
  gap = 12,
  insets: DiceHintInsets = EMPTY_INSETS,
): { left: number; top: number; side: DiceHintSide } {
  const area = {
    x: insets.left,
    y: insets.top,
    w: Math.max(0, viewport.w - insets.left - insets.right),
    h: Math.max(0, viewport.h - insets.top - insets.bottom),
  };

  const candidates: Array<{ side: DiceHintSide; left: number; top: number }> = [
    {
      side: 'right',
      left: shape.x + shape.w + gap,
      top: shape.y + shape.h / 2 - popup.h / 2,
    },
    {
      side: 'left',
      left: shape.x - gap - popup.w,
      top: shape.y + shape.h / 2 - popup.h / 2,
    },
    {
      side: 'bottom',
      left: shape.x + shape.w / 2 - popup.w / 2,
      top: shape.y + shape.h + gap,
    },
    {
      side: 'top',
      left: shape.x + shape.w / 2 - popup.w / 2,
      top: shape.y - gap - popup.h,
    },
  ];

  const fits = (left: number, top: number) =>
    left >= area.x &&
    top >= area.y &&
    left + popup.w <= area.x + area.w &&
    top + popup.h <= area.y + area.h;

  const chosen =
    candidates.find((candidate) => fits(candidate.left, candidate.top)) ?? candidates[0];
  const maxLeft = area.x + Math.max(0, area.w - popup.w);
  const maxTop = area.y + Math.max(0, area.h - popup.h);

  return {
    side: chosen.side,
    left: clamp(chosen.left, area.x, maxLeft),
    top: clamp(chosen.top, area.y, maxTop),
  };
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}
