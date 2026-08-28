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
import type { LibraryFile } from 'common.api';
import { FileActionsMenu } from '../FileActionsMenu';
import { AssignFileTagsPopover } from '../tags/AssignFileTagsPopover';
import type { FilePreviewKind } from './getFilePreviewKind';

const kindIcon: Record<FilePreviewKind, typeof File> = {
  image: Image,
  audio: Music,
  pdf: File,
  presentation: Presentation,
  unsupported: File,
};

type FilePreviewHeaderProps = {
  file: LibraryFile;
  title: string;
  subtitle: string;
  kind: FilePreviewKind;
  isFullscreen: boolean;
  showFullscreen: boolean;
  showMore: boolean;
  isDownloading?: boolean;
  tagsOpen: boolean;
  onTagsOpenChange: (open: boolean) => void;
  onDownload: () => void;
  onToggleFullscreen: () => void;
  onDelete: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onClose: () => void;
};

export const FilePreviewHeader = ({
  file,
  title,
  subtitle,
  kind,
  isFullscreen,
  showFullscreen,
  showMore,
  isDownloading,
  tagsOpen,
  onTagsOpenChange,
  onDownload,
  onToggleFullscreen,
  onDelete,
  onShare,
  onRename,
  onClose,
}: FilePreviewHeaderProps) => {
  const { t } = useTranslation('materials');
  const Icon = kindIcon[kind];

  const iconButtonClass = cn(
    'flex size-8 items-center justify-center rounded-full p-0 transition-colors',
    'hover:bg-background-subtle focus:bg-background-subtle active:bg-background-subtle',
    'focus-visible:ring-0 focus-visible:ring-offset-0',
  );
  const iconClass = 'fill-icon-secondary size-4';

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
          <ModalTitle className="text-text-primary m-0 truncate text-xl leading-7 font-medium">
            {title}
          </ModalTitle>
          <p className="text-text-secondary text-xs leading-4 font-normal">{subtitle}</p>
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
          <AssignFileTagsPopover file={file} open={tagsOpen} onOpenChange={onTagsOpenChange}>
            <FileActionsMenu
              modal
              onRename={onRename}
              renameUmami="materials-file-preview-rename"
              onEditTags={() => onTagsOpenChange(true)}
              editTagsUmami="materials-file-preview-edit-tags"
              onShare={onShare}
              shareUmami="materials-file-preview-share"
              onDelete={onDelete}
              deleteUmami="materials-file-preview-delete"
            >
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
          </AssignFileTagsPopover>
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
