import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { File, Image, MoreVert, Music } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  ConfirmDialog,
  cardMenuButtonClass,
  cardMenuIconClass,
  cardMenuPositionClass,
  getAppLanguage,
} from 'common.ui';
import {
  getLibraryFileRequest,
  handleError,
  useDeleteLibraryFile,
  type LibraryFile,
} from 'common.services';
import type { FileKind } from 'common.api';
import { formatFileSize, formatUploadedAt, getLibraryFileDisplayName } from '../../utils';

type FileCardProps = {
  file: LibraryFile;
  className?: string;
};

const kindIcon: Record<FileKind, typeof File> = {
  image: Image,
  audio: Music,
  document: File,
  presentation: File,
  uncategorized: File,
};

const menuSurfaceClass = 'border-border-default bg-background-surface border';
const menuItemClass =
  'text-text-primary hover:bg-status-info-background hover:text-text-primary focus:text-text-primary h-8 items-center whitespace-nowrap rounded-lg px-2 py-0 text-sm leading-none';

export const FileCard = ({ file, className }: FileCardProps) => {
  const { t } = useTranslation('materials');
  const [menuOpen, setMenuOpen] = useState(false);
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
      const result = await getLibraryFileRequest(file.id);
      if (result.status !== 200 || !result.data) return;

      const url = window.URL.createObjectURL(result.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = displayName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error, 'files');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'group bg-background-surface relative flex h-44 min-h-44 w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]',
          className,
        )}
      >
        <div className="flex w-full shrink-0 items-center gap-2 pr-8">
          <div className="bg-status-info-background [&>svg]:fill-icon-brand flex size-10 shrink-0 items-center justify-center rounded-[10px]">
            <Icon className="fill-icon-primary size-6" />
          </div>
        </div>

        <div className={cardMenuPositionClass}>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                className={cardMenuButtonClass}
                variant="none"
                size="icon"
                data-umami-event="materials-file-menu-open"
              >
                <MoreVert className={cardMenuIconClass} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className={cn(
                menuSurfaceClass,
                'text-text-primary w-56 space-y-1 rounded-lg p-2 font-normal',
              )}
            >
              <DropdownMenuItem
                className={menuItemClass}
                disabled={isDownloading}
                onClick={handleDownload}
                data-umami-event="materials-file-download"
              >
                {t('files.menu.download')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(menuItemClass, 'w-full')}
                onClick={() => setDeleteOpen(true)}
                data-umami-event="materials-file-delete"
              >
                {t('files.menu.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p
          className="text-text-primary mt-4 line-clamp-2 w-full min-w-0 max-w-full overflow-hidden text-base leading-5 font-medium break-all"
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
