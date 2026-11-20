import type { SVGProps } from 'react';
import { cn } from '@xipkg/utils';

/** Точки не path: тулбар принудительно красит path в currentColor. */
const PIP_POSITIONS = [
  [8.2, 8.2],
  [15.8, 8.2],
  [12, 12],
  [8.2, 15.8],
  [15.8, 15.8],
] as const;

export function DiceIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={cn('shrink-0', className)} {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#fff" stroke="#111" strokeWidth="1.5" />
      {PIP_POSITIONS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.35" fill="#111" />
      ))}
    </svg>
  );
}
