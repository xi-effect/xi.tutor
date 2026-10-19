import { type KeyboardEvent, type ReactNode } from 'react';
import { Check } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

type ClassroomsFilterOptionProps = {
  selected: boolean;
  onSelect: () => void;
  umamiEvent: string;
  umamiScope: string;
  children: ReactNode;
};

export const ClassroomsFilterOption = ({
  selected,
  onSelect,
  umamiEvent,
  umamiScope,
  children,
}: ClassroomsFilterOptionProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={selected}
      tabIndex={0}
      className="text-s-base text-text-primary flex w-full min-w-0 cursor-pointer items-center gap-3 bg-transparent text-left font-medium outline-none"
      onClick={onSelect}
      onPointerDown={(event) => {
        event.preventDefault();
      }}
      onKeyDown={handleKeyDown}
      data-umami-event={umamiEvent}
      data-umami-event-scope={umamiScope}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md border bg-transparent',
          selected
            ? 'border-border-focus bg-action-primary-background-default'
            : 'border-border-control',
        )}
      >
        {selected ? <Check className="fill-background-surface size-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </div>
  );
};
