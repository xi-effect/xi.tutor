import { Button } from '@xipkg/button';
import { ChevronLeft, ChevronRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

type PagePagerProps = {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
};

export const PagePager = ({
  currentPage,
  totalPages,
  disabled,
  onPageChange,
  className,
}: PagePagerProps) => {
  const { t } = useTranslation('materials');

  if (totalPages < 1) return null;

  return (
    <div
      className={cn(
        'bg-background-subtle text-text-primary flex items-center gap-2 rounded-full px-2 py-1',
        className,
      )}
    >
      <Button
        type="button"
        variant="none"
        size="s"
        className="hover:bg-background-page flex size-8 items-center justify-center rounded-full p-0 disabled:opacity-40"
        disabled={disabled || currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={t('files.preview.prevPage')}
      >
        <ChevronLeft className="fill-icon-primary size-4" />
      </Button>
      <span className="text-s-base min-w-28 text-center font-medium tabular-nums">
        {t('files.preview.page', { current: currentPage, total: totalPages })}
      </span>
      <Button
        type="button"
        variant="none"
        size="s"
        className="hover:bg-background-page flex size-8 items-center justify-center rounded-full p-0 disabled:opacity-40"
        disabled={disabled || currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label={t('files.preview.nextPage')}
      >
        <ChevronRight className="fill-icon-primary size-4" />
      </Button>
    </div>
  );
};
