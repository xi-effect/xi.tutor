import { cn } from '@xipkg/utils';
import type { ReactNode } from 'react';
import type { ItemStatus } from '../model/types';
import { ACTIVITY_TOKEN_MIME, useTokenDnd } from './TokenDnd';
import { activityCardClass, activityFieldClass } from './activityUi';

const statusClass: Record<ItemStatus, string> = {
  idle: '',
  correct: 'ring-2 ring-green-600/70',
  wrong: 'ring-2 ring-red-600/70',
};

export function DraggableToken({
  id,
  label,
  disabled,
  status = 'idle',
}: {
  id: string;
  label: string;
  disabled?: boolean;
  status?: ItemStatus;
}) {
  const { pickedId, pick } = useTokenDnd();
  const picked = pickedId === id;

  return (
    <button
      type="button"
      data-board-control=""
      draggable={!disabled}
      disabled={disabled}
      onDragStart={(event) => {
        event.dataTransfer.setData(ACTIVITY_TOKEN_MIME, id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => {
        if (!disabled) pick(id);
      }}
      className={cn(
        activityCardClass,
        'cursor-grab px-2 py-1 active:cursor-grabbing',
        picked && 'ring-brand-80 ring-2',
        statusClass[status],
        disabled && 'cursor-default opacity-70',
      )}
    >
      {label}
    </button>
  );
}

export function DropZone({
  zoneId,
  label,
  child,
  status = 'idle',
  disabled,
  onDropToken,
}: {
  zoneId: string;
  label?: string;
  child?: ReactNode;
  status?: ItemStatus;
  disabled?: boolean;
  onDropToken: (zoneId: string, tokenId: string) => void;
}) {
  const { pickedId, pick } = useTokenDnd();

  const receive = (tokenId: string) => {
    if (disabled) return;
    onDropToken(zoneId, tokenId);
    pick(null);
  };

  return (
    <div
      data-board-control=""
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        event.preventDefault();
        const tokenId = event.dataTransfer.getData(ACTIVITY_TOKEN_MIME);
        if (tokenId) receive(tokenId);
      }}
      onClick={() => {
        if (pickedId) receive(pickedId);
      }}
      className={cn(
        'border-border-default bg-background-surface flex min-h-9 min-w-16 items-center justify-center rounded-lg border border-dashed px-2 py-1 text-sm',
        statusClass[status],
      )}
    >
      {child ?? <span className="text-text-secondary">{label ?? '—'}</span>}
    </div>
  );
}

export function Selectable({
  selected,
  status = 'idle',
  disabled,
  onToggle,
  children,
}: {
  selected: boolean;
  status?: ItemStatus;
  disabled?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-board-control=""
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        activityCardClass,
        'flex w-full items-center gap-2 text-left',
        selected && 'bg-status-info-background',
        statusClass[status],
      )}
    >
      {children}
    </button>
  );
}

export function ActivityInput({
  value,
  disabled,
  status = 'idle',
  placeholder,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  status?: ItemStatus;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      data-board-control=""
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn(activityFieldClass, 'max-w-40 min-w-20', statusClass[status])}
    />
  );
}

export function Choice({
  value,
  options,
  disabled,
  status = 'idle',
  onChange,
}: {
  value: string;
  options: string[];
  disabled?: boolean;
  status?: ItemStatus;
  onChange: (value: string) => void;
}) {
  return (
    <select
      data-board-control=""
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn(activityFieldClass, 'max-w-48 min-w-24', statusClass[status])}
    >
      <option value="">—</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function HiddenContent({
  revealed,
  disabled,
  onReveal,
  children,
}: {
  revealed: boolean;
  disabled?: boolean;
  onReveal: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-board-control=""
      disabled={disabled || revealed}
      onClick={onReveal}
      className={cn(
        'border-border-default flex min-h-20 items-center justify-center rounded-xl border p-2 text-sm',
        revealed ? 'bg-background-page' : 'bg-background-subtle text-text-secondary',
      )}
    >
      {revealed ? children : '● ● ●'}
    </button>
  );
}
