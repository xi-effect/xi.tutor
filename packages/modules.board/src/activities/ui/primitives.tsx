import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { useEditor } from '@ibodr/draw';
import { motion } from 'motion/react';
import { useEffect, type ReactNode, type SyntheticEvent } from 'react';
import type { ItemStatus } from '../model/types';
import { useTokenDnd } from './TokenDnd';
import { activityCardClass, activitySelectedClass, activityStatusBorderClass } from './activityUi';
import { ActivityInputField, ActivitySelectField } from './activityFields';
import { ActivityImage } from './ActivityImage';
import { activityHover, activityItemTransition, activityItemVariants } from './activityUiMotion';

const statusClass = activityStatusBorderClass;

function useStopBoardGesture() {
  const editor = useEditor();
  return (event: SyntheticEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };
}

export function DraggableToken({
  id,
  label,
  imageSrc,
  disabled,
  status = 'idle',
}: {
  id: string;
  label: string;
  imageSrc?: string;
  disabled?: boolean;
  status?: ItemStatus;
}) {
  const stopBoardGesture = useStopBoardGesture();
  const { pickedId, draggedId, beginDrag } = useTokenDnd();
  const picked = pickedId === id;
  const dragging = draggedId === id;

  return (
    <motion.div
      layout={!dragging}
      variants={activityItemVariants}
      initial="hidden"
      animate="show"
      transition={activityItemTransition}
      whileHover={disabled || dragging ? undefined : activityHover}
      className="inline-flex"
    >
      <Button
        type="button"
        variant="none"
        size="s"
        data-board-control=""
        data-activity-token={id}
        disabled={disabled}
        onPointerDown={(event) => {
          stopBoardGesture(event);
          if (disabled || event.button !== 0) return;
          beginDrag(id, event.clientX, event.clientY);
        }}
        className={cn(
          activityCardClass,
          'flex h-auto cursor-grab items-center gap-2 px-2 py-1 active:cursor-grabbing',
          picked && activitySelectedClass,
          dragging && 'opacity-50',
          statusClass[status],
          disabled && 'cursor-default opacity-70',
        )}
      >
        <ActivityImage src={imageSrc} className="size-8 shrink-0 rounded object-cover" />
        {label}
      </Button>
    </motion.div>
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
  const stopBoardGesture = useStopBoardGesture();
  const { pickedId, pick, registerDrop } = useTokenDnd();

  useEffect(() => {
    return registerDrop(zoneId, (tokenId) => {
      if (disabled) return;
      onDropToken(zoneId, tokenId);
      pick(null);
    });
  }, [disabled, onDropToken, pick, registerDrop, zoneId]);

  return (
    <motion.div
      data-board-control=""
      data-activity-drop-zone={zoneId}
      onPointerDown={stopBoardGesture}
      onClick={() => {
        if (disabled || !pickedId) return;
        onDropToken(zoneId, pickedId);
        pick(null);
      }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={activityItemTransition}
      className={cn(
        'border-border-default bg-background-surface flex min-h-9 min-w-16 items-center justify-center rounded-lg border border-dashed px-2 py-1 text-sm',
        statusClass[status],
      )}
    >
      {child ?? <span className="text-text-secondary">{label ?? '—'}</span>}
    </motion.div>
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
  const stopBoardGesture = useStopBoardGesture();
  return (
    <motion.div
      variants={activityItemVariants}
      transition={activityItemTransition}
      whileHover={disabled ? undefined : activityHover}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      <Button
        type="button"
        variant="none"
        size="s"
        data-board-control=""
        disabled={disabled}
        onPointerDown={stopBoardGesture}
        onClick={onToggle}
        className={cn(
          activityCardClass,
          'flex h-auto w-full items-center justify-start gap-2 text-left',
          selected && 'bg-status-info-background',
          statusClass[status],
        )}
      >
        {children}
      </Button>
    </motion.div>
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
    <ActivityInputField
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn('inline-flex max-w-40 min-w-20', statusClass[status])}
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
    <ActivitySelectField
      value={value}
      disabled={disabled}
      onValueChange={onChange}
      className={cn('inline-flex max-w-48 min-w-24', statusClass[status])}
      options={options.map((option) => ({ value: option, label: option }))}
    />
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
  const stopBoardGesture = useStopBoardGesture();
  const faceStyle = {
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  };

  return (
    <div className="w-full" style={{ perspective: 900 }}>
      <motion.div
        className="grid min-h-20 w-full"
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Button
          type="button"
          variant="none"
          size="s"
          data-board-control=""
          disabled={disabled || revealed}
          onPointerDown={stopBoardGesture}
          onClick={onReveal}
          className={cn(
            'border-border-default col-start-1 row-start-1 flex h-auto min-h-20 items-center justify-center rounded-xl border p-2 text-sm',
            'bg-background-subtle text-text-secondary',
          )}
          style={faceStyle}
        >
          ● ● ●
        </Button>
        <div
          className={cn(
            'border-border-default bg-background-page col-start-1 row-start-1 flex min-h-20 items-center justify-center rounded-xl border p-2 text-sm',
          )}
          style={{ ...faceStyle, transform: 'rotateY(180deg)' }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
