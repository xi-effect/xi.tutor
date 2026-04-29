import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';

type ScheduleEmptyStateProps = {
  /** Дни, к которым относится пустое состояние (один или несколько подряд выбранных дней) */
  days: Date[];
  onScheduleClick: () => void;
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
        'border-gray-10 bg-gray-0 dark:border-gray-70 dark:bg-gray-5 flex min-w-0 flex-col rounded-xl border border-dashed',
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
        <p className="text-s-base text-gray-60 text-center dark:text-gray-50">{t(messageKey)}</p>
        <Button
          type="button"
          variant="ghost"
          size="s"
          className="text-brand-80 h-9 shrink-0 font-medium"
          onClick={onScheduleClick}
        >
          {t('add_lesson')}
          <Plus className="fill-brand-80 ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
