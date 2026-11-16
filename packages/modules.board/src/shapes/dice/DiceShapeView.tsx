import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { animationAnchor, diceFloat, rollProgress, rollSeed } from '../../dice/diceMotion';
import { DICE_ROLL_MS, normalizeDiceFace } from '../../dice/diceRoll';
import type { DiceShape } from './diceShape';
import { DiceSolid } from './DiceSolid';

export function DiceShapeView({ shape }: { shape: DiceShape }) {
  const { t } = useTranslation('board');
  const face = normalizeDiceFace(shape.props.sides, shape.props.value);
  const size = Math.min(shape.props.w, shape.props.h);
  const progress = useThrowProgress(shape.props.rolledAt);
  const seed = useMemo(() => rollSeed(shape.id), [shape.id]);
  const motion = progress >= 1 ? { y: 0, scale: 1, squash: 1 } : diceFloat(progress);

  return (
    <div
      className="text-text-primary relative flex h-full w-full items-center justify-center"
      data-board-dice-value={face.value}
      data-board-dice-sides={face.sides}
      aria-label={t('dice.result', { value: face.value })}
    >
      <div
        style={{
          transform: `translateY(${motion.y * (size / 180)}px) scale(${motion.scale}) scaleY(${motion.squash})`,
        }}
      >
        <DiceSolid
          sides={face.sides}
          value={face.value}
          seed={seed}
          progress={progress}
          size={size}
        />
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  return reduced;
}

function useThrowProgress(rolledAt: number) {
  const reduced = usePrefersReducedMotion();
  const anchorRef = useRef<number | null>(null);
  if (anchorRef.current === null) {
    anchorRef.current = animationAnchor(rolledAt, Date.now());
  }
  const anchor = anchorRef.current;
  const settled = useRef(reduced || Date.now() - anchor >= DICE_ROLL_MS);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (settled.current) return;

    let frame = 0;
    const tick = () => {
      const next = Date.now();
      setNow(next);
      if (next - anchor < DICE_ROLL_MS) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [anchor]);

  if (settled.current) return 1;
  return rollProgress(anchor, now);
}
