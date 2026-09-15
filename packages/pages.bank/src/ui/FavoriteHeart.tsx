import { cn } from '@xipkg/utils';

type FavoriteHeartProps = {
  active: boolean;
  className?: string;
};

export const FavoriteHeart = ({ active, className }: FavoriteHeartProps) => (
  <svg
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('shrink-0', active ? 'text-icon-brand' : 'text-icon-secondary', className)}
    aria-hidden
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
