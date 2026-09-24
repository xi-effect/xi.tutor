import { cn } from '@xipkg/utils';
import type { SVGProps } from 'react';

type MathIconProps = SVGProps<SVGSVGElement>;

function MathSvg({ className, children, ...rest }: MathIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-6 w-6 shrink-0 fill-current', className)} {...rest}>
      {children}
    </svg>
  );
}

/** Копия `@xipkg/icons`, пока пакет не опубликован. */
export function Superscript(props: MathIconProps) {
  return (
    <MathSvg {...props}>
      <path d="M4.4 7.35h2.55L9.3 12.15 11.65 7.35h2.55L10.55 13.3 14.2 19.4h-2.6L9.3 14.55 6.95 19.4H4.35l3.7-6.1Z" />
      <path d="M15.35 4.35h4.35v1.5h-4.35zM18.2 4.35h1.5v3.35h-1.5zM15.35 7.1h4.35v1.5h-4.35zM15.35 7.1h1.5v3.35h-1.5zM15.35 9.85h4.35v1.5h-4.35z" />
    </MathSvg>
  );
}

/** Копия `@xipkg/icons`, пока пакет не опубликован. */
export function Subscript(props: MathIconProps) {
  return (
    <MathSvg {...props}>
      <path d="M4.4 4.6h2.55L9.3 9.4 11.65 4.6h2.55L10.55 10.55 14.2 16.65h-2.6L9.3 11.8 6.95 16.65H4.35l3.7-6.1Z" />
      <path d="M15.35 12.55h4.35v1.5h-4.35zM18.2 12.55h1.5v3.35h-1.5zM15.35 15.3h4.35v1.5h-4.35zM15.35 15.3h1.5v3.35h-1.5zM15.35 18.05h4.35v1.5h-4.35z" />
    </MathSvg>
  );
}

/** Копия `@xipkg/icons`, пока пакет не опубликован. */
export function Fraction(props: MathIconProps) {
  return (
    <MathSvg {...props}>
      <path d="M11.2 4.45h1.55v6.25H11.2z" />
      <path d="M5.5 11.2h13v1.55H5.5z" />
      <path d="M9.8 14.4h4.4v1.5H9.8zM12.7 14.4h1.5v3.25h-1.5zM9.8 17h4.4v1.5H9.8zM9.8 17h1.5v3.25h-1.5zM9.8 19.7h4.4v1.5H9.8z" />
    </MathSvg>
  );
}

/** Копия `@xipkg/icons`, пока пакет не опубликован. */
export function Formula(props: MathIconProps) {
  return (
    <MathSvg {...props}>
      <path d="M5.8 5.25h12.4v2.1H10.7l3.65 3.8-3.95 7.15H18.2v2.1H5.8v-1.95l5.2-7.2-5.2-4.8V5.25Z" />
    </MathSvg>
  );
}

/** Копия `@xipkg/icons`, пока пакет не опубликован. */
export function Latex(props: MathIconProps) {
  return (
    <MathSvg {...props}>
      <path d="M4.2 4.9h2.2v14.2H4.2zM4.2 4.9h4.35v2.2H4.2zM4.2 16.9h4.35v2.2H4.2z" />
      <g transform="translate(12 12) scale(0.72) translate(-9.28 -13.38)">
        <path d="M4.4 7.35h2.55L9.3 12.15 11.65 7.35h2.55L10.55 13.3 14.2 19.4h-2.6L9.3 14.55 6.95 19.4H4.35l3.7-6.1Z" />
      </g>
      <path d="M17.6 4.9h2.2v14.2h-2.2zM15.45 4.9h4.35v2.2h-4.35zM15.45 16.9h4.35v2.2h-4.35z" />
    </MathSvg>
  );
}
