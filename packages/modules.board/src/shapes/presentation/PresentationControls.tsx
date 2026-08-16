import { useCallback } from 'react';
import { Button } from '@xipkg/button';
import { ArrowLeft, ArrowRight, Image } from '@xipkg/icons';
import { CONTROLS_HEIGHT } from './consts';
import { useTranslation } from 'react-i18next';

type PdfPageControlsProps = {
  fileName: string;
  currentPage: number;
  totalPages: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
  pagesVisible?: number;
  onPagesVisibleChange?: (n: number) => void;
  onExtractPage?: () => void;
};

export const PresentationControls = ({
  fileName,
  currentPage,
  totalPages,
  disabled,
  onPageChange,
  onExtractPage,
}: PdfPageControlsProps) => {
  const { t } = useTranslation('board');

  const goPrev = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      if (currentPage > 1) onPageChange(currentPage - 1);
    },
    [currentPage, onPageChange],
  );

  const goNext = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      if (currentPage < totalPages) onPageChange(currentPage + 1);
    },
    [currentPage, totalPages, onPageChange],
  );

  return (
    <div
      className="bg-background-surface border-border-default pointer-events-auto flex shrink-0 items-center gap-2 rounded-b-xl border-t px-3 py-1.5 select-none"
      data-board-control=""
      style={{ height: CONTROLS_HEIGHT }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {fileName && (
        <span className="text-text-secondary min-w-0 flex-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap">
          {fileName}
        </span>
      )}
      {!fileName && <span className="flex-1" />}
      {totalPages > 1 && (
        <>
          <Button
            variant="none"
            size="s"
            className="hover:bg-status-info-background h-6 w-6 shrink-0 rounded-lg p-0 disabled:opacity-30 disabled:hover:bg-transparent"
            disabled={disabled || currentPage <= 1}
            onPointerDown={goPrev}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-text-primary shrink-0 text-center text-xs tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="none"
            size="s"
            className="hover:bg-status-info-background h-6 w-6 shrink-0 rounded-lg p-0 disabled:opacity-30 disabled:hover:bg-transparent"
            disabled={disabled || currentPage >= totalPages}
            onPointerDown={goNext}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
      {onExtractPage && (
        <Button
          variant="none"
          size="s"
          className="hover:bg-status-info-background h-6 w-6 shrink-0 rounded-lg p-0"
          onPointerDown={(e) => {
            e.stopPropagation();
            onExtractPage();
          }}
          title={t('pdf.extractPage')}
        >
          <Image className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
