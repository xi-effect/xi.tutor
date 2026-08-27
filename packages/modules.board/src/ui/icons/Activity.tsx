import type { SVGProps } from 'react';
import { cn } from '@xipkg/utils';

const outline = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Копия `@xipkg/icons` Activity, пока пакет не опубликован. */
export function Activity(props: SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" className={cn('shrink-0 fill-current', className)} {...rest}>
      <circle cx="7" cy="7" r="3" style={{ fill: 'none' }} {...outline} />
      <path d="M17 4 20 10H14Z" style={{ fill: 'none' }} {...outline} />
      <path d="M17 14 20 17 17 20 14 17Z" style={{ fill: 'none' }} {...outline} />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
