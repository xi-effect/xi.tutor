import { cn } from '@xipkg/utils';
import { TagChip } from './TagChip';

type TagChipsProps = {
  tags: Array<{ id: string | number; name: string; color?: string | null }>;
  className?: string;
};

export const TagChips = ({ tags, className }: TagChipsProps) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-1 flex w-full min-w-0 flex-wrap content-start items-center gap-1',
        className,
      )}
    >
      {tags.map((tag) => (
        <TagChip key={tag.id} name={tag.name} color={tag.color} />
      ))}
    </div>
  );
};
