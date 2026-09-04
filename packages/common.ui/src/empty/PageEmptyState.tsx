import { FC, ReactNode } from 'react';
import { cn } from '@xipkg/utils';

/**
 * Иллюстрация заполняет фиксированный слот 340×220 (object-contain),
 * чтобы сетка empty совпадала на всех страницах.
 */
export const pageEmptyIllustrationClass = 'h-full w-full object-contain';

/** Подложка для help/CTA-кнопок в empty states */
export const pageEmptyActionButtonClass =
  'bg-background-page hover:bg-background-subtle text-xs-base-size flex h-8 items-center rounded-lg px-4 font-medium text-text-primary';

type PageEmptyStateProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  illustration: ReactNode;
  className?: string;
  /** Узкая колонка (мобильный день расписания): без min-h 560px и с меньшей иллюстрацией. */
  compact?: boolean;
};

/**
 * Полноэкранное пустое состояние: одна сетка для кабинетов / материалов / оплат / расписания.
 * Текст → actions → иллюстрация в фиксированном слоте; блок центрируется в родителе.
 */
export const PageEmptyState: FC<PageEmptyStateProps> = ({
  title,
  description,
  actions,
  illustration,
  className,
  compact = false,
}) => (
  <div
    className={cn(
      'box-border flex h-full w-full flex-col items-center justify-center overflow-hidden px-6',
      compact ? 'min-h-0 py-4' : 'min-h-[min(560px,calc(100dvh-200px))] py-10',
      className,
    )}
  >
    <div
      className={cn(
        'flex w-full max-w-md flex-col items-center',
        compact ? 'gap-4' : 'gap-8 sm:gap-10',
      )}
    >
      <div className="flex w-full flex-col items-center gap-2 text-center">
        <p className="text-l-base text-text-primary font-semibold">{title}</p>
        {description ? (
          <p className="text-s-base text-text-secondary dark:text-text-muted">{description}</p>
        ) : null}
        {actions ? <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div> : null}
      </div>
      <div
        className={cn(
          'flex w-full shrink-0 items-center justify-center',
          compact ? 'h-[140px] max-w-[220px]' : 'h-[220px] max-w-[340px]',
        )}
        aria-hidden
      >
        {illustration}
      </div>
    </div>
  </div>
);
