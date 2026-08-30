import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import {
  EmptySchedule,
  PageEmptyState,
  pageEmptyActionButtonClass,
  pageEmptyIllustrationClass,
} from 'common.ui';

type ScheduleEmptyStateProps = {
  /** Дни, к которым относится пустое состояние (один или несколько подряд выбранных дней) */
  days: Date[];
  /** Если не передано — только текст без кнопки (например, у ученика) */
  onScheduleClick?: () => void;
  className?: string;
  /**
   * Канбан: высота блока по viewport, не на всю высоту скролла.
   * Мобильный список: компактный блок по содержимому.
   */
  fillColumn?: boolean;
  /**
   * Полноэкранный empty с иллюстрацией — когда пусты все видимые дни
   * (та же сетка PageEmptyState, что у кабинетов / материалов / оплат).
   */
  withIllustration?: boolean;
};

export const ScheduleEmptyState: FC<ScheduleEmptyStateProps> = ({
  days,
  onScheduleClick,
  className,
  fillColumn = false,
  withIllustration = false,
}) => {
  const { t } = useTranslation('calendar');
  const isSingleDay = days.length <= 1;
  const isTutor = onScheduleClick != null;

  if (withIllustration) {
    const title = isSingleDay
      ? isTutor
        ? t('no_lessons_on_date')
        : t('no_lessons_on_date_student')
      : t('schedule_empty_selected_days');
    const description = isSingleDay
      ? isTutor
        ? t('empty_day_tutor_hint')
        : t('empty_day_student_hint')
      : isTutor
        ? t('empty_days_tutor_hint')
        : t('empty_days_student_hint');

    return (
      <PageEmptyState
        className={className}
        title={title}
        description={description}
        actions={
          onScheduleClick ? (
            <Button
              type="button"
              variant="none"
              className={pageEmptyActionButtonClass}
              onClick={onScheduleClick}
              data-umami-event="schedule-empty-add-lesson-kanban"
            >
              {t('add_lesson')}
              <Plus className="fill-icon-primary ml-1 size-4 shrink-0" />
            </Button>
          ) : undefined
        }
        illustration={<EmptySchedule className={pageEmptyIllustrationClass} />}
      />
    );
  }

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
            variant="none"
            className={pageEmptyActionButtonClass}
            onClick={onScheduleClick}
            data-umami-event="schedule-empty-add-lesson-kanban"
          >
            {t('add_lesson')}
            <Plus className="fill-icon-primary ml-1 size-4 shrink-0" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
