import { useLayoutEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { TagChip } from './TagChip';

const GAP_PX = 4;

type TagChipsItem = { id: string | number; name: string; color?: string | null };

type TagChipsProps = {
  tags: TagChipsItem[];
  className?: string;
};

const overflowChipClass =
  'bg-background-theme text-text-secondary inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs leading-4 font-medium';

const OverflowChip = ({ count }: { count: number }) => (
  <span className={overflowChipClass}>+{count}</span>
);

const OverflowChipTooltip = ({ tags }: { tags: TagChipsItem[] }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(overflowChipClass, 'cursor-default')}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label={tags.map((tag) => tag.name).join(', ')}
        >
          +{tags.length}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={6}
        className="z-100 max-w-64 p-2 font-normal"
      >
        <div className="flex flex-wrap content-start items-center gap-1">
          {tags.map((tag) => (
            <TagChip key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const countVisibleTags = (available: number, chipWidths: number[], overflowWidths: number[]) => {
  const total = chipWidths.length;
  if (total === 0 || available <= 0) {
    return 0;
  }

  for (let visible = total; visible >= 1; visible -= 1) {
    const hidden = total - visible;
    let width = 0;
    for (let index = 0; index < visible; index += 1) {
      if (index > 0) width += GAP_PX;
      width += chipWidths[index] ?? 0;
    }
    if (hidden > 0) {
      width += GAP_PX + (overflowWidths[hidden - 1] ?? 0);
    }
    if (width <= available || visible === 1) {
      return visible;
    }
  }

  return 1;
};

export const TagChips = ({ tags, className }: TagChipsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) {
      return;
    }

    const update = () => {
      const chips = [...measure.querySelectorAll<HTMLElement>('[data-tag-measure]')];
      const overflowBadges = [
        ...measure.querySelectorAll<HTMLElement>('[data-tag-overflow-measure]'),
      ];
      const next = countVisibleTags(
        container.clientWidth,
        chips.map((chip) => chip.offsetWidth),
        overflowBadges.map((badge) => badge.offsetWidth),
      );
      setVisibleCount((current) => (current === next ? current : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tags]);

  if (tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, Math.max(visibleCount, 1));
  const hiddenTags = tags.slice(visibleTags.length);
  const truncateFirst = visibleTags.length === 1 && hiddenTags.length > 0;

  return (
    <div ref={containerRef} className={cn('relative mt-1 w-full min-w-0', className)}>
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute flex h-0 items-center gap-1 overflow-hidden whitespace-nowrap"
      >
        {tags.map((tag) => (
          <span key={tag.id} data-tag-measure="">
            <TagChip name={tag.name} color={tag.color} />
          </span>
        ))}
        {tags.map((_, index) =>
          index === 0 ? null : (
            <span key={`overflow-${index}`} data-tag-overflow-measure="">
              <OverflowChip count={index} />
            </span>
          ),
        )}
      </div>

      <div className="flex w-full min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
        {visibleTags.map((tag) => (
          <TagChip
            key={tag.id}
            name={tag.name}
            color={tag.color}
            className={truncateFirst ? 'min-w-0 shrink' : undefined}
          />
        ))}
        {hiddenTags.length > 0 ? <OverflowChipTooltip tags={hiddenTags} /> : null}
      </div>
    </div>
  );
};
