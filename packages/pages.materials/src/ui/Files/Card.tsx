import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { File, Image, MoreVert, Music } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  ConfirmDialog,
  cardMenuButtonClass,
  cardMenuIconClass,
  cardMenuPositionClass,
  getAppLanguage,
} from 'common.ui';
import { useDeleteLibraryFile, type LibraryFile } from 'common.services';
import type { FileKind } from 'common.api';
import {
  downloadLibraryFile,
  formatFileSize,
  formatUploadedAt,
  getLibraryFileDisplayName,
} from '../../utils';
import { FileActionsMenu } from './FileActionsMenu';

type FileCardProps = {
  file: LibraryFile;
  className?: string;
  onPreview?: (file: LibraryFile) => void;
};

const kindIcon: Record<FileKind, typeof File> = {
  image: Image,
  audio: Music,
  document: File,
  presentation: File,
  uncategorized: File,
};

export const FileCard = ({ file, className, onPreview }: FileCardProps) => {
  const { t } = useTranslation('materials');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const deleteMutation = useDeleteLibraryFile();

  const displayName = getLibraryFileDisplayName(file);
  const Icon = kindIcon[file.kind] ?? File;
  const uploadedAt = formatUploadedAt(file.created_at, t('files.today'));
  const size = formatFileSize(file.size_bytes, getAppLanguage());

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadLibraryFile(file.id, displayName);
    } finally {
      setIsDownloading(false);
    }
  };

  const openPreview = () => {
    onPreview?.(file);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'group bg-background-surface relative flex h-44 min-h-44 w-full min-w-0 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]',
          className,
        )}
        onClick={openPreview}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPreview();
          }
        }}
      >
        <div className="flex w-full shrink-0 items-center gap-2 pr-8">
          <div className="bg-status-info-background [&>svg]:fill-icon-brand flex size-10 shrink-0 items-center justify-center rounded-[10px]">
            <Icon className="fill-icon-primary size-6" />
          </div>
        </div>

        <div
          className={cardMenuPositionClass}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <FileActionsMenu
            showDownload
            isDownloading={isDownloading}
            onDownload={handleDownload}
            onDelete={() => setDeleteOpen(true)}
          >
            <Button
              className={cardMenuButtonClass}
              variant="none"
              size="icon"
              data-umami-event="materials-file-menu-open"
            >
              <MoreVert className={cardMenuIconClass} />
            </Button>
          </FileActionsMenu>
        </div>

        <p
          className="text-text-primary mt-4 line-clamp-2 w-full max-w-full min-w-0 overflow-hidden text-base leading-5 font-medium break-words"
          title={displayName}
        >
          {displayName}
        </p>

        <div className="mt-auto flex w-full min-w-0 flex-col items-start gap-0.5 overflow-hidden pt-2">
          <p className="text-text-secondary w-full truncate text-xs leading-4 font-normal">
            {t('files.meta', { date: uploadedAt, size })}
          </p>
        </div>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('files.deleteConfirm.title')}
        description={t('files.deleteConfirm.description', { name: displayName })}
        confirmLabel={
          deleteMutation.isPending
            ? t('files.deleteConfirm.deleting')
            : t('files.deleteConfirm.confirm')
        }
        cancelLabel={t('files.deleteConfirm.cancel')}
        onConfirm={() => deleteMutation.mutate(file.id)}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};
