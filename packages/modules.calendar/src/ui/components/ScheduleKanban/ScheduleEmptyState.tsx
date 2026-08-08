import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';

type ScheduleEmptyStateProps = {
  /** Дни, к которым относится пустое состояние (один или несколько подряд выбранных дней) */
  days: Date[];
  /** Если не передано — только текст без кнопки (например, у ученика) */
  onScheduleClick?: () => void;
  className?: string;
  /**
   * Канбан: высота блока по viewport (calc(100dvh − шапки − отступы)), не на всю высоту скролла.
   * Мобильный список: компактный блок по содержимому.
   */
  fillColumn?: boolean;
};

export const ScheduleEmptyState: FC<ScheduleEmptyStateProps> = ({
  days,
  onScheduleClick,
  className,
  fillColumn = false,
}) => {
  const { t } = useTranslation('calendar');
  const isSingleDay = days.length <= 1;
  const messageKey = isSingleDay ? 'schedule_empty_day' : 'schedule_empty_selected_days';

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface dark:border-border-strong dark:bg-background-page flex min-w-0 flex-col rounded-xl border border-dashed',
        fillColumn ? 'h-full min-h-[120px] w-full' : 'min-h-[120px]',
        className,
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 p-4',
          fillColumn && 'min-h-0 flex-1',
        )}
      >
        <p className="text-s-base text-text-secondary dark:text-text-muted text-center">
          {t(messageKey)}
        </p>
        {onScheduleClick ? (
          <Button
            type="button"
            variant="ghost"
            size="s"
            className="text-text-link h-9 shrink-0 font-medium"
            onClick={onScheduleClick}
            data-umami-event="schedule-empty-add-lesson-kanban"
          >
            {t('add_lesson')}
            <Plus className="fill-icon-brand ml-2 h-5 w-5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
