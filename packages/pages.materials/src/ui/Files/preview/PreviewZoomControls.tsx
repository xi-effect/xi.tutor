import { Button } from '@xipkg/button';
import { Minus, Plus } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { PREVIEW_ZOOM_MAX, PREVIEW_ZOOM_MIN } from './previewZoom';

type PreviewZoomControlsProps = {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export const PreviewZoomControls = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: PreviewZoomControlsProps) => {
  const { t } = useTranslation('materials');
  const percent = Math.round(scale * 100);

  const buttonClass =
    'hover:bg-background-page focus:bg-background-page active:bg-background-page flex size-8 items-center justify-center rounded-full p-0 text-text-primary focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-40';

  return (
    <div
      className="pointer-events-auto absolute right-4 bottom-4 z-30"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="border-border-default bg-background-elevated flex items-center gap-1 rounded-full border p-1 shadow-md">
        <Button
          type="button"
          variant="none"
          size="s"
          className={buttonClass}
          onClick={onZoomOut}
          onMouseDown={(event) => event.preventDefault()}
          disabled={scale <= PREVIEW_ZOOM_MIN}
          aria-label={t('files.preview.zoomOut')}
        >
          <Minus className="fill-icon-primary size-4" />
        </Button>
        <Button
          type="button"
          variant="none"
          size="s"
          className={cn(buttonClass, 'text-s-base min-w-14 px-2 font-medium tabular-nums')}
          onClick={onReset}
          onMouseDown={(event) => event.preventDefault()}
          aria-label={t('files.preview.zoomReset')}
        >
          {t('files.preview.zoomLevel', { value: percent })}
        </Button>
        <Button
          type="button"
          variant="none"
          size="s"
          className={buttonClass}
          onClick={onZoomIn}
          onMouseDown={(event) => event.preventDefault()}
          disabled={scale >= PREVIEW_ZOOM_MAX}
          aria-label={t('files.preview.zoomIn')}
        >
          <Plus className="fill-icon-primary size-4" />
        </Button>
      </div>
    </div>
  );
};
