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
import { formatFileSize, formatUploadedAt, getLibraryFileDisplayName } from '../../utils';
import { FileActionsMenu } from './FileActionsMenu';
import { RenameFileModal } from './RenameFileModal';
import { ShareFileModal } from './ShareFileModal';
import { AssignFileTagsPopover } from './tags/AssignFileTagsPopover';
import { getTagColor } from './tags/tagColors';
import { useLibraryTags } from './tags/useLibraryTags';

type FileCardProps = {
  file: LibraryFile;
  className?: string;
  onPreview?: (file: LibraryFile) => void;
  readOnly?: boolean;
};

const kindIcon: Record<FileKind, typeof File> = {
  image: Image,
  audio: Music,
  document: File,
  presentation: File,
  uncategorized: File,
};

export const FileCard = ({ file, className, onPreview, readOnly = false }: FileCardProps) => {
  const { t } = useTranslation('materials');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const deleteMutation = useDeleteLibraryFile();
  const { getTagsForFile } = useLibraryTags();
  const fileTags = getTagsForFile(file.id);

  const displayName = getLibraryFileDisplayName(file);
  const Icon = kindIcon[file.kind] ?? File;
  const uploadedAt = formatUploadedAt(file.created_at, t('files.today'));
  const size = formatFileSize(file.size_bytes, getAppLanguage());

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

        {readOnly ? null : (
          <div
            className={cardMenuPositionClass}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <AssignFileTagsPopover file={file} open={tagsOpen} onOpenChange={setTagsOpen}>
              <FileActionsMenu
                onPreview={openPreview}
                onRename={() => setRenameOpen(true)}
                onEditTags={() => setTagsOpen(true)}
                onShare={() => setShareOpen(true)}
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
            </AssignFileTagsPopover>
          </div>
        )}

        <p
          className={cn(
            'text-text-primary mt-4 w-full max-w-full min-w-0 overflow-hidden text-base leading-5 font-medium break-words',
            fileTags.length > 0 ? 'line-clamp-1' : 'line-clamp-2',
          )}
          title={displayName}
        >
          {displayName}
        </p>

        {fileTags.length > 0 ? (
          <div className="mt-1 flex w-full min-w-0 items-center gap-1 overflow-hidden">
            {fileTags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className={cn(
                  'max-w-[50%] truncate rounded-md px-2 py-0.5 text-xs leading-4 font-medium',
                  getTagColor(tag.color).chip,
                )}
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex w-full min-w-0 flex-col items-start gap-0.5 overflow-hidden pt-2">
          <p className="text-text-secondary w-full truncate text-xs leading-4 font-normal">
            {t('files.meta', { date: uploadedAt, size })}
          </p>
        </div>
      </div>
      <RenameFileModal file={file} open={renameOpen} onOpenChange={setRenameOpen} />
      <ShareFileModal file={file} open={shareOpen} onOpenChange={setShareOpen} />
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
