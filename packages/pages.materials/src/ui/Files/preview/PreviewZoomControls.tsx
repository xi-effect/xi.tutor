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
    'flex size-8 items-center justify-center rounded-full p-0 text-white hover:bg-white/15 focus:bg-white/15 active:bg-white/15 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-40';

  return (
    <div
      className="pointer-events-auto absolute right-4 bottom-4 z-30"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-1 rounded-full bg-neutral-900/85 p-1 shadow-[0px_8px_24px_rgba(16,16,16,0.4)] ring-1 ring-white/20 backdrop-blur-md">
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
          <Minus className="size-4 fill-white" />
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
          <Plus className="size-4 fill-white" />
        </Button>
      </div>
    </div>
  );
};
