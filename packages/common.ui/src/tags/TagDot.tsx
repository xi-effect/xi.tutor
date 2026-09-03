import { cn } from '@xipkg/utils';
import { getTagColor } from './tagColors';

type TagDotProps = {
  color?: string | null;
  className?: string;
};

export const TagDot = ({ color, className }: TagDotProps) => (
  <span className={cn('size-2.5 shrink-0 rounded-full', getTagColor(color).dot, className)} />
);
