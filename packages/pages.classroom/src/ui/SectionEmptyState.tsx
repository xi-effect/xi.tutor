import { FC, ReactNode } from 'react';
import { cn } from '@xipkg/utils';

type SectionEmptyStateProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Иллюстрация справа (например из common.ui); включает горизонтальную вёрстку с текстом слева */
  illustration?: ReactNode;
  className?: string;
  minHeightClass?: string;
};

export const SectionEmptyState: FC<SectionEmptyStateProps> = ({
  title,
  description,
  actions,
  illustration,
  className,
  minHeightClass = 'min-h-[200px]',
}) => (
  <div className="px-2 pb-4">
    <div
      className={cn(
        'bg-background-surface flex w-full rounded-2xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]',
        minHeightClass,
        illustration ? 'flex-col' : 'flex-col items-center justify-center gap-5',
        className,
      )}
    >
      {illustration ? (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl sm:flex-row sm:items-stretch sm:gap-6 lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex min-w-0 flex-col gap-2 text-left">
              <p className="text-m-base text-text-primary font-semibold">{title}</p>
              {description ? (
                <p className="text-s-base text-text-secondary dark:text-text-muted min-w-0">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex min-w-0 flex-row flex-wrap items-center gap-2 sm:flex-nowrap">
                {actions}
              </div>
            ) : null}
          </div>
          <div
            className="relative flex min-h-[100px] w-full items-end justify-end overflow-hidden sm:h-auto sm:min-h-0 sm:w-[min(200px,36%)] sm:max-w-[200px] sm:flex-none sm:self-stretch"
            aria-hidden
          >
            <div className="max-h-[150px] max-w-full [&>svg]:block [&>svg]:h-auto [&>svg]:max-h-[150px] [&>svg]:w-auto [&>svg]:max-w-full">
              {illustration}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-m-base text-text-primary font-semibold">{title}</p>
            {description ? (
              <p className="text-s-base text-text-secondary dark:text-text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-row flex-wrap items-center justify-center gap-2">
              {actions}
            </div>
          ) : null}
        </>
      )}
    </div>
  </div>
);
