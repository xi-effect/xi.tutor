import { type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@xipkg/utils';

type MaterialsFilterOptionProps = {
  selected: boolean;
  onSelect: () => void;
  umamiEvent: string;
  umamiScope: string;
  children: ReactNode;
};

export const MaterialsFilterOption = ({
  selected,
  onSelect,
  umamiEvent,
  umamiScope,
  children,
}: MaterialsFilterOptionProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="menuitemradio"
      aria-checked={selected}
      tabIndex={0}
      className="text-s-base text-text-primary flex w-full cursor-pointer items-center gap-3 bg-transparent text-left font-medium outline-none"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      data-umami-event={umamiEvent}
      data-umami-event-scope={umamiScope}
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border bg-transparent',
          selected
            ? 'border-border-focus bg-action-primary-background-default'
            : 'border-border-control',
        )}
      >
        {selected ? <span className="bg-background-surface size-2 rounded-full" /> : null}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
};
