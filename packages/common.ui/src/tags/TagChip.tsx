import { cn } from '@xipkg/utils';
import { getTagColor } from './tagColors';

type TagChipProps = {
  name: string;
  color?: string | null;
  className?: string;
};

export const TagChip = ({ name, color, className }: TagChipProps) => (
  <span
    className={cn(
      'max-w-full shrink-0 truncate rounded-md px-2 py-0.5 text-xs leading-4 font-medium',
      getTagColor(color).chip,
      className,
    )}
    title={name}
  >
    {name}
  </span>
);
