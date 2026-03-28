import { FC, ReactNode } from 'react';
import { cn } from '@xipkg/utils';

type SectionEmptyStateProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  /** Высота области с пунктиром (по умолчанию под карточки главной) */
  minHeightClass?: string;
};

export const SectionEmptyState: FC<SectionEmptyStateProps> = ({
  title,
  description,
  actions,
  className,
  minHeightClass = 'min-h-[200px]',
}) => (
  <div
    className={cn(
      'border-gray-10 bg-gray-0 dark:border-gray-70 mb-3 flex w-full flex-col items-center justify-center gap-5 rounded-xl border border-dashed',
      minHeightClass,
      className,
    )}
  >
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-m-base font-semibold text-gray-100">{title}</p>
      {description ? (
        <p className="text-s-base text-gray-60 dark:text-gray-50">{description}</p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex flex-row flex-wrap items-center justify-center gap-2">{actions}</div>
    ) : null}
  </div>
);
