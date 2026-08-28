import {
  Close,
  Download,
  File,
  Image,
  Maximize,
  Minimize,
  MoreVert,
  Music,
  Presentation,
} from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { ModalTitle } from '@xipkg/modal';
import { useTranslation } from 'react-i18next';
import { FileActionsMenu } from '../FileActionsMenu';
import type { FilePreviewKind } from './getFilePreviewKind';

const kindIcon: Record<FilePreviewKind, typeof File> = {
  image: Image,
  audio: Music,
  pdf: File,
  presentation: Presentation,
  unsupported: File,
};

type FilePreviewHeaderProps = {
  title: string;
  subtitle: string;
  kind: FilePreviewKind;
  isFullscreen: boolean;
  showFullscreen: boolean;
  showMore: boolean;
  isDownloading?: boolean;
  onDownload: () => void;
  onToggleFullscreen: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export const FilePreviewHeader = ({
  title,
  subtitle,
  kind,
  isFullscreen,
  showFullscreen,
  showMore,
  isDownloading,
  onDownload,
  onToggleFullscreen,
  onDelete,
  onClose,
}: FilePreviewHeaderProps) => {
  const { t } = useTranslation('materials');
  const Icon = kindIcon[kind];

  const iconButtonClass = cn(
    'flex size-8 items-center justify-center rounded-full p-0 transition-colors',
    'focus-visible:ring-0 focus-visible:ring-offset-0',
    isFullscreen
      ? 'bg-white/10 hover:bg-white/15 focus:bg-white/15 active:bg-white/15'
      : 'hover:bg-background-subtle focus:bg-background-subtle active:bg-background-subtle',
  );
  const iconClass = cn('size-4', isFullscreen ? 'fill-white' : 'fill-icon-secondary');

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-6 transition-colors duration-300',
        isFullscreen ? 'bg-transparent' : 'border-border-default border-b',
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="bg-status-info-background flex size-10 shrink-0 items-center justify-center rounded-[10px]">
          <Icon className="fill-icon-brand size-6" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <ModalTitle
            className={cn(
              'm-0 truncate text-xl leading-7 font-medium transition-colors duration-300',
              isFullscreen ? 'text-white' : 'text-text-primary',
            )}
          >
            {title}
          </ModalTitle>
          <p
            className={cn(
              'text-xs leading-4 font-normal transition-colors duration-300',
              isFullscreen ? 'text-white/70' : 'text-text-secondary',
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="none"
          size="s"
          className={iconButtonClass}
          onClick={onDownload}
          onMouseDown={(event) => event.preventDefault()}
          disabled={isDownloading}
          aria-label={t('files.menu.download')}
        >
          <Download className={iconClass} />
        </Button>
        {showFullscreen ? (
          <Button
            type="button"
            variant="none"
            size="s"
            className={iconButtonClass}
            onClick={onToggleFullscreen}
            onMouseDown={(event) => event.preventDefault()}
            aria-label={
              isFullscreen ? t('files.preview.exitFullscreen') : t('files.preview.fullscreen')
            }
          >
            {isFullscreen ? <Minimize className={iconClass} /> : <Maximize className={iconClass} />}
          </Button>
        ) : null}
        {showMore ? (
          <FileActionsMenu modal onDelete={onDelete} deleteUmami="materials-file-preview-delete">
            <Button
              type="button"
              variant="none"
              size="s"
              className={iconButtonClass}
              aria-label={t('files.preview.more')}
              data-umami-event="materials-file-preview-menu-open"
            >
              <MoreVert className={iconClass} />
            </Button>
          </FileActionsMenu>
        ) : null}
        <Button
          type="button"
          variant="none"
          size="s"
          className={iconButtonClass}
          onClick={onClose}
          onMouseDown={(event) => event.preventDefault()}
          aria-label={t('files.preview.close')}
        >
          <Close className={iconClass} />
        </Button>
      </div>
    </div>
  );
};
