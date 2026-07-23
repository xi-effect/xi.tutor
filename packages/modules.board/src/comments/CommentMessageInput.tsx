import { useState, type KeyboardEvent } from 'react';
import { Button } from '@xipkg/button';
import { Textarea } from '@xipkg/textarea';
import { Send } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { stopEvent } from '../shapes/audio/constants';

type CommentMessageInputProps = {
  placeholder: string;
  submitLabel: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
};

export const CommentMessageInput = ({
  placeholder,
  submitLabel,
  autoFocus,
  onSubmit,
  onCancel,
}: CommentMessageInputProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  return (
    <div
      className="flex flex-col gap-2"
      onPointerDown={stopEvent}
      onClick={(e) => e.stopPropagation()}
    >
      <Textarea
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-16 resize-none text-sm"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="s" onClick={onCancel} type="button">
            Отмена
          </Button>
        )}
        <Button
          variant="primary"
          size="s"
          onClick={handleSubmit}
          type="button"
          disabled={!value.trim()}
        >
          <Send
            className={cn(
              'mr-1 size-4',
              value.trim() ? 'text-text-on-accent' : 'text-text-disabled',
            )}
          />
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};
