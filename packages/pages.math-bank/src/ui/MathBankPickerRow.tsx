import { Task } from '@xipkg/icons';
import { cardTypeIconBoxClass } from 'common.ui';
import type { MathTaskSearchDocument } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import { MathBankLatex } from './MathBankLatex';

type MathBankPickerRowProps = {
  task: MathTaskSearchDocument;
  addLabel: string;
  disabled?: boolean;
  umamiPrefix?: string;
  onAdd: (task: MathTaskSearchDocument) => void;
};

export const MathBankPickerRow = ({
  task,
  addLabel,
  disabled,
  umamiPrefix = 'math-bank',
  onAdd,
}: MathBankPickerRowProps) => {
  const { t } = useTranslation('mathBank');

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      aria-label={addLabel}
      onClick={() => {
        if (!disabled) onAdd(task);
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onAdd(task);
        }
      }}
      data-umami-event={`${umamiPrefix}-math-bank-task-add`}
      data-umami-event-task={task.id}
      className={cn(
        'hover:bg-status-info-background grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-3 px-3 py-2.5 transition-colors',
        'focus-visible:bg-status-info-background focus-visible:outline-none',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <div className={cardTypeIconBoxClass}>
        <Task className="fill-icon-primary size-4" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-s-base text-text-primary truncate leading-5 font-medium">
          {task.topic}
        </span>
        <p className="text-xs-base text-text-secondary truncate">
          {t('card.grade', { grade: task.grade })}
        </p>
        <p className="text-s-base text-text-primary line-clamp-2 leading-5">
          <MathBankLatex text={task.statement} />
        </p>
      </div>
    </div>
  );
};
