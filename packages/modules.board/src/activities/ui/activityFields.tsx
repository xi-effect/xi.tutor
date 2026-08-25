import { Input, type InputProps } from '@xipkg/input';
import { Textarea, type TextareaProps } from '@xipkg/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { boardMenuSurfaceClass } from '../../ui/boardTheme';

function useStopBoardKeys() {
  const editor = useEditor();

  const onPointerDown = (event: PointerEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  const onKey = (event: KeyboardEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  return { onPointerDown, onKey };
}

export function ActivityInputField({
  onPointerDown,
  onKeyDown,
  className,
  variant = 's',
  ...props
}: InputProps) {
  const stop = useStopBoardKeys();

  return (
    <div className={cn('relative w-full min-w-0', className)} data-board-control="">
      <Input
        variant={variant}
        className="!w-full min-w-0"
        {...props}
        onPointerDown={(event) => {
          stop.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onKeyDown={(event) => {
          stop.onKey(event);
          onKeyDown?.(event);
        }}
      />
    </div>
  );
}

export function ActivityTextareaField({
  onPointerDown,
  onKeyDown,
  className,
  variant = 's',
  ref,
  ...props
}: TextareaProps) {
  const stop = useStopBoardKeys();

  return (
    <Textarea
      ref={ref}
      variant={variant}
      hideCounter
      data-board-control=""
      className={cn('min-h-16 w-full min-w-0 resize-y', className)}
      {...props}
      onPointerDown={(event) => {
        stop.onPointerDown(event);
        onPointerDown?.(event);
      }}
      onKeyDown={(event) => {
        stop.onKey(event);
        onKeyDown?.(event);
      }}
    />
  );
}

export function ActivityDraftInputField({
  value,
  onCommit,
  ...props
}: Omit<InputProps, 'value' | 'onChange' | 'onBlur'> & {
  value: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setDraft(value);
  }, [value]);

  return (
    <ActivityInputField
      {...props}
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        onCommit(next);
      }}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;
        onCommit(draft);
      }}
    />
  );
}

export function ActivitySelectField({
  value,
  options,
  disabled,
  placeholder = '—',
  className,
  onValueChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onValueChange: (value: string) => void;
}) {
  const stop = useStopBoardKeys();

  return (
    <div
      className={cn('min-w-28', className)}
      data-board-control=""
      onPointerDown={stop.onPointerDown}
    >
      <Select value={value || undefined} disabled={disabled} onValueChange={onValueChange}>
        <SelectTrigger
          size="s"
          data-board-control=""
          className="h-6 min-h-6 w-full px-2 text-xs"
          onPointerDown={stop.onPointerDown}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(boardMenuSurfaceClass, 'z-80 min-w-(--radix-select-trigger-width)')}
          onPointerDown={stop.onPointerDown}
        >
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
