import { useCallback } from 'react';
import { Button } from '@xipkg/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@xipkg/select';
import { ArrowLeft, ArrowRight, Image } from '@xipkg/icons';
import { PDF_PAGES_VISIBLE_MAX } from './PdfShape';

type PdfPageControlsProps = {
  fileName: string;
  currentPage: number;
  totalPages: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
  onExtractPage?: () => void;
  pagesVisible?: number;
  onPagesVisibleChange?: (n: number) => void;
};

export const PdfPageControls = ({
  fileName,
  currentPage,
  totalPages,
  disabled,
  onPageChange,
  onExtractPage,
  pagesVisible = 1,
  onPagesVisibleChange,
}: PdfPageControlsProps) => {
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
      className="bg-gray-0 border-gray-10 pointer-events-auto flex shrink-0 items-center gap-2 rounded-b-xl border-t px-3 py-1.5 select-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {fileName && (
        <span className="text-gray-60 min-w-0 flex-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap">
          {fileName}
        </span>
      )}
      {!fileName && <span className="flex-1" />}
      {totalPages > 1 && (
        <>
          <Button
            variant="none"
            size="s"
            className="hover:bg-brand-0 h-6 w-6 shrink-0 rounded-lg p-0 disabled:opacity-30 disabled:hover:bg-transparent"
            disabled={disabled || currentPage <= 1}
            onPointerDown={goPrev}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-gray-80 shrink-0 text-center text-xs tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="none"
            size="s"
            className="hover:bg-brand-0 h-6 w-6 shrink-0 rounded-lg p-0 disabled:opacity-30 disabled:hover:bg-transparent"
            disabled={disabled || currentPage >= totalPages}
            onPointerDown={goNext}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
      {onPagesVisibleChange && (
        <Select
          value={String(pagesVisible)}
          onValueChange={(v) => {
            const n = Number(v);
            if (Number.isFinite(n) && n >= 1 && n <= PDF_PAGES_VISIBLE_MAX) {
              onPagesVisibleChange(n);
            }
          }}
        >
          <SelectTrigger
            className="text-gray-80 border-gray-10 h-6 w-20 shrink-0 text-xs"
            size="s"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {pagesVisible} стр.
          </SelectTrigger>
          <SelectContent className="w-[120px]">
            <span className="text-gray-80 px-2 text-xs"> Показывать </span>
            {Array.from({ length: PDF_PAGES_VISIBLE_MAX }, (_, i) => {
              const n = i + 1;
              return (
                <SelectItem key={n} value={String(n)}>
                  {n} стр.
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
      {onExtractPage && (
        <Button
          variant="none"
          size="s"
          className="hover:bg-brand-0 h-6 w-6 shrink-0 rounded-lg p-0"
          onPointerDown={(e) => {
            e.stopPropagation();
            onExtractPage();
          }}
          title="Извлечь страницу как изображение"
        >
          <Image className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
