import { DICE_ROLL_MS, type DiceSides } from './diceRoll';

export const DICE_SPIN_STEPS = 8;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

export function easeOutCubic(progress: number): number {
  const t = clamp01(progress);
  return 1 - (1 - t) ** 3;
}

export function easeOutBack(progress: number): number {
  const t = clamp01(progress);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

export function rollSeed(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Общие часы броска. Если чужое время сильно впереди, крутим от локального момента,
 * чтобы кубик не замер в стартовой позе.
 */
export function animationAnchor(rolledAt: number, seenAt: number): number {
  if (!Number.isFinite(rolledAt) || !Number.isFinite(seenAt)) return seenAt;
  if (seenAt - rolledAt < -250) return seenAt;
  return rolledAt;
}

export function rollProgress(anchor: number, now: number, duration = DICE_ROLL_MS): number {
  if (!Number.isFinite(anchor) || !Number.isFinite(now) || duration <= 0) return 1;
  return clamp01((now - anchor) / duration);
}

export function mod360(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  return ((degrees % 360) + 360) % 360;
}

/** Покой кубика d6: какая грань смотрит на зрителя. Противоположные грани в сумме дают 7. */
export function cubeRestRotation(value: number): { x: number; y: number } {
  switch (value) {
    case 2:
      return { x: -90, y: 0 };
    case 3:
      return { x: 0, y: -90 };
    case 4:
      return { x: 0, y: 90 };
    case 5:
      return { x: 90, y: 0 };
    case 6:
      return { x: 0, y: 180 };
    default:
      return { x: 0, y: 0 };
  }
}

export function cubePose(
  progress: number,
  value: number,
  seed: number,
): { rotateX: number; rotateY: number } {
  const rest = cubeRestRotation(value);
  const spinsX = 2 + (seed % 2);
  const spinsY = 2 + ((seed >>> 3) % 2);
  const dirX = (seed & 2) === 0 ? 1 : -1;
  const dirY = (seed & 4) === 0 ? 1 : -1;
  const endX = rest.x + dirX * spinsX * 360;
  const endY = rest.y + dirY * spinsY * 360;
  const startX = dirX * 26;
  const startY = dirY * -22;
  const eased = easeOutCubic(progress);

  return {
    rotateX: startX + (endX - startX) * eased,
    rotateY: startY + (endY - startY) * eased,
  };
}

/** Промежуточные грани не равны итогу: число открывается только в конце. */
export function faceSequence(
  sides: DiceSides,
  value: number,
  seed: number,
  steps = DICE_SPIN_STEPS,
): number[] {
  const sequence: number[] = [];

  if (sides === 2) {
    const other = value === 1 ? 2 : 1;
    for (let index = 0; index < steps; index += 1) sequence.push(other);
    sequence.push(value);
    return sequence;
  }

  let state = seed >>> 0 || 1;
  let previous: number | null = null;

  for (let index = 0; index < steps; index += 1) {
    let face = 1;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      face = (state % sides) + 1;
      if (face !== value && face !== previous) break;
    }
    if (face === value) face = value === sides ? 1 : value + 1;
    sequence.push(face);
    previous = face;
  }

  sequence.push(value);
  return sequence;
}

export function spinAngle(progress: number, steps = DICE_SPIN_STEPS): number {
  return steps * 180 * easeOutCubic(progress);
}

export function spinWobble(progress: number, seed: number): number {
  const t = clamp01(progress);
  const amplitude = 8 + (seed % 6);
  return Math.sin(t * Math.PI * 4) * amplitude * (1 - t);
}

export function spinAxis(sides: number): 'x' | 'y' {
  return sides === 2 ? 'x' : 'y';
}

export type SpinFaces = { front: number; back: number };

/** Какое число нарисовано на ближней и дальней стороне в этот угол поворота. */
export function spinFaces(sequence: number[], angleDeg: number): SpinFaces {
  const faces = sequence.length > 0 ? sequence : [1];
  const angle = Number.isFinite(angleDeg) ? angleDeg : 0;
  const index = Math.max(0, Math.min(faces.length - 1, Math.floor((angle + 90) / 180)));
  const norm = mod360(angle);
  const showingBack = norm > 90 && norm < 270;
  const at = (offset: number) => faces[Math.max(0, Math.min(faces.length - 1, offset))] ?? faces[0];

  if (showingBack) return { front: at(index - 1), back: at(index) };
  return { front: at(index), back: at(index + 1) };
}

export function diceFloat(progress: number): {
  y: number;
  scale: number;
  shadow: number;
  squash: number;
} {
  const t = clamp01(progress);
  const appear = easeOutBack(Math.min(1, t / 0.14));
  const hop = Math.sin(t * Math.PI) ** 0.85 * 36;
  let squash = 1;

  if (t > 0.86) {
    const landing = (t - 0.86) / 0.14;
    squash = 1 - Math.sin(landing * Math.PI) * 0.07 * (1 - landing * 0.3);
  }

  return {
    y: -hop,
    scale: Math.min(1.08, Math.max(0.2, 0.2 + 0.8 * appear)),
    shadow: 0.16 + (1 - Math.min(1, hop / 36)) * 0.28,
    squash,
  };
}
