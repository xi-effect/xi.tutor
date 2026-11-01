import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@xipkg/button';
import { Check, ChevronSmallBottom, ChevronSmallTop, Move, Trash } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { optionDragId } from '../dragIds';
import type { HomeworkOption } from '../types';

type OptionListProps = {
  questionId: string;
  options: HomeworkOption[];
  onChange: (optionId: string, text: string) => void;
  onToggleCorrect: (optionId: string) => void;
  onRemove: (optionId: string) => void;
  onMove: (optionId: string, direction: -1 | 1) => void;
  onAdd: () => void;
};

const OptionRow = ({
  questionId,
  option,
  index,
  total,
  onChange,
  onToggleCorrect,
  onRemove,
  onMove,
}: {
  questionId: string;
  option: HomeworkOption;
  index: number;
  total: number;
  onChange: (text: string) => void;
  onToggleCorrect: () => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) => {
  const { t } = useTranslation('homeworkEditor');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: optionDragId(questionId, option.id),
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-1.5', isDragging && 'z-10 opacity-80')}
    >
      <button
        type="button"
        className="text-icon-secondary flex size-8 shrink-0 cursor-grab touch-none items-center justify-center bg-transparent"
        aria-label={t('drag')}
        {...attributes}
        {...listeners}
      >
        <Move className="size-4" />
      </button>
      <Input
        value={option.text}
        variant="s"
        placeholder={`${t('optionPlaceholder')} ${index + 1}`}
        aria-label={`${t('optionPlaceholder')} ${index + 1}`}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="button"
        variant="none"
        size="icon"
        aria-label={t('markCorrect')}
        aria-pressed={option.isCorrect}
        title={t('markCorrect')}
        className={cn('size-8 shrink-0', option.isCorrect && 'text-status-success-text')}
        onClick={onToggleCorrect}
      >
        <Check className="size-4" />
      </Button>
      <Button
        type="button"
        variant="none"
        size="icon"
        aria-label={t('moveUp')}
        className="size-8 shrink-0"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <ChevronSmallTop className="size-4" />
      </Button>
      <Button
        type="button"
        variant="none"
        size="icon"
        aria-label={t('moveDown')}
        className="size-8 shrink-0"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
      >
        <ChevronSmallBottom className="size-4" />
      </Button>
      <Button
        type="button"
        variant="none"
        size="icon"
        aria-label={t('delete')}
        className="size-8 shrink-0"
        disabled={total <= 1}
        onClick={onRemove}
      >
        <Trash className="size-4" />
      </Button>
    </div>
  );
};

export const OptionList = ({
  questionId,
  options,
  onChange,
  onToggleCorrect,
  onRemove,
  onMove,
  onAdd,
}: OptionListProps) => {
  const { t } = useTranslation('homeworkEditor');

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-secondary text-xs">{t('options')}</p>
      {options.map((option, index) => (
        <OptionRow
          key={option.id}
          questionId={questionId}
          option={option}
          index={index}
          total={options.length}
          onChange={(text) => onChange(option.id, text)}
          onToggleCorrect={() => onToggleCorrect(option.id)}
          onRemove={() => onRemove(option.id)}
          onMove={(direction) => onMove(option.id, direction)}
        />
      ))}
      <Button
        type="button"
        variant="none"
        className="text-text-link h-9 w-fit px-2 text-sm"
        onClick={onAdd}
      >
        {t('addOption')}
      </Button>
    </div>
  );
};
