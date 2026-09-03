import { Button } from '@xipkg/button';
import { ChevronLeft, ChevronRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

type FilePreviewNavProps = {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

const navButtonClass = cn(
  'bg-background-surface/90 text-icon-primary hover:bg-background-surface',
  'pointer-events-auto absolute top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center',
  'rounded-full p-0 shadow-[0px_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors',
  'focus-visible:ring-border-focus focus-visible:ring-2 focus-visible:outline-none',
  'disabled:pointer-events-none disabled:opacity-40',
);

export const FilePreviewNav = ({ hasPrev, hasNext, onPrev, onNext }: FilePreviewNavProps) => {
  const { t } = useTranslation('materials');

  return (
    <>
      <Button
        type="button"
        variant="none"
        size="s"
        className={cn(navButtonClass, 'left-4')}
        disabled={!hasPrev}
        onClick={onPrev}
        onMouseDown={(event) => event.preventDefault()}
        aria-label={t('files.preview.prevFile')}
        data-umami-event="materials-file-preview-prev"
      >
        <ChevronLeft className="fill-icon-primary size-5" />
      </Button>
      <Button
        type="button"
        variant="none"
        size="s"
        className={cn(navButtonClass, 'right-4')}
        disabled={!hasNext}
        onClick={onNext}
        onMouseDown={(event) => event.preventDefault()}
        aria-label={t('files.preview.nextFile')}
        data-umami-event="materials-file-preview-next"
      >
        <ChevronRight className="fill-icon-primary size-5" />
      </Button>
    </>
  );
};
