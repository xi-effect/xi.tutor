import { FC, ReactNode } from 'react';
import { cn } from '@xipkg/utils';

type SectionEmptyStateProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Иллюстрация справа (например из common.ui); включаёт горизонтальную вёрстку с текстом слева */
  illustration?: ReactNode;
  className?: string;
  /** Высота области с пунктиром (по умолчанию под карточки главной) */
  minHeightClass?: string;
};

/** Макс. высота 150px — чтобы блок не раздувался; якорь — низ справа в `SectionEmptyState` */
const illustrationSvgClass =
  'block min-h-0 min-w-0 h-auto w-auto max-h-[150px] max-w-full shrink object-contain object-bottom object-right sm:max-w-[min(100%,280px)]';

export const sectionEmptyStateIllustrationClass = illustrationSvgClass;

export const SectionEmptyState: FC<SectionEmptyStateProps> = ({
  title,
  description,
  actions,
  illustration,
  className,
  minHeightClass = 'min-h-[200px]',
}) => (
  <div
    className={cn(
      'border-gray-10 bg-gray-0 dark:border-gray-70 mb-3 flex w-full rounded-xl border border-dashed',
      minHeightClass,
      illustration ? 'flex-col overflow-hidden' : 'flex-col items-center justify-center gap-5',
      className,
    )}
  >
    {illustration ? (
      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-6 lg:gap-8">
        {/* flex-1: забирает всё свободное место; колонка картинки — узкая по факту макс. ширины иллюстрации, а не ~40% строки */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex min-w-0 flex-col gap-2 text-left">
            <p className="text-m-base font-semibold text-gray-100">{title}</p>
            {description ? (
              <p className="text-s-base text-gray-60 min-w-0 dark:text-gray-50">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex min-w-0 flex-row flex-wrap items-center gap-2 sm:flex-nowrap">
              {actions}
            </div>
          ) : null}
        </div>
        <div
          className="relative h-full min-h-[100px] w-full overflow-hidden sm:h-full sm:min-h-0 sm:w-[min(200px,36%)] sm:max-w-[200px] sm:flex-none sm:shrink-0 sm:self-stretch"
          aria-hidden
        >
          <div className="absolute right-0 bottom-0 max-h-[150px] max-w-full [&>svg]:block [&>svg]:h-auto [&>svg]:max-h-[150px] [&>svg]:w-auto [&>svg]:max-w-full">
            {illustration}
          </div>
        </div>
      </div>
    ) : (
      <>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-m-base font-semibold text-gray-100">{title}</p>
          {description ? (
            <p className="text-s-base text-gray-60 dark:text-gray-50">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-row flex-wrap items-center justify-center gap-2">{actions}</div>
        ) : null}
      </>
    )}
  </div>
);
