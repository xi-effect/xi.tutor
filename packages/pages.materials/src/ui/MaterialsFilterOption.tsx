import { type KeyboardEvent, type ReactNode } from 'react';
import { Check } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

type MaterialsFilterOptionProps = {
  selected: boolean;
  onSelect: () => void;
  umamiEvent: string;
  umamiScope: string;
  variant?: 'radio' | 'checkbox';
  children: ReactNode;
};

export const MaterialsFilterOption = ({
  selected,
  onSelect,
  umamiEvent,
  umamiScope,
  variant = 'radio',
  children,
}: MaterialsFilterOptionProps) => {
  const isCheckbox = variant === 'checkbox';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role={isCheckbox ? 'menuitemcheckbox' : 'menuitemradio'}
      aria-checked={selected}
      tabIndex={0}
      className="text-s-base text-text-primary flex w-full cursor-pointer items-center gap-3 bg-transparent text-left font-medium outline-none"
      onClick={onSelect}
      onPointerDown={(event) => {
        if (isCheckbox) {
          event.preventDefault();
        }
      }}
      onKeyDown={handleKeyDown}
      data-umami-event={umamiEvent}
      data-umami-event-scope={umamiScope}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center border bg-transparent',
          isCheckbox ? 'size-6 rounded-md' : 'size-5 rounded-full',
          selected
            ? 'border-border-focus bg-action-primary-background-default'
            : 'border-border-control',
        )}
      >
        {selected ? (
          isCheckbox ? (
            <Check className="fill-background-surface size-3.5" />
          ) : (
            <span className="bg-background-surface size-2 rounded-full" />
          )
        ) : null}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
};
