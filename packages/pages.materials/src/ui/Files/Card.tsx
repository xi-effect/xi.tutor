import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { File, Image, MoreVert, Music } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  ConfirmDialog,
  TagChips,
  cardMaterialMenuButtonClass,
  cardMenuIconClass,
  cardTypeIconBoxClass,
  getAppLanguage,
} from 'common.ui';
import {
  useDeleteLibraryFile,
  getFileTagIds,
  useTagsByIds,
  type LibraryFile,
} from 'common.services';
import type { FileKind } from 'common.api';
import { formatFileSize, formatUploadedAt, getLibraryFileDisplayName } from '../../utils';
import { FileActionsMenu } from './FileActionsMenu';
import { RenameFileModal } from './RenameFileModal';
import { ShareFileModal } from './ShareFileModal';
import { AssignFileTagsPopover } from './tags/AssignFileTagsPopover';

type FileCardProps = {
  file: LibraryFile;
  className?: string;
  onPreview?: (file: LibraryFile) => void;
  readOnly?: boolean;
  onRemoveFromClassroom?: (file: LibraryFile) => void;
};

const kindIcon: Record<FileKind, typeof File> = {
  image: Image,
  audio: Music,
  document: File,
  presentation: File,
  uncategorized: File,
};

export const FileCard = ({
  file,
  className,
  onPreview,
  readOnly = false,
  onRemoveFromClassroom,
}: FileCardProps) => {
  const { t } = useTranslation('materials');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const deleteMutation = useDeleteLibraryFile();
  const isClassroomFile = Boolean(onRemoveFromClassroom);
  const { tags: fileTags } = useTagsByIds(getFileTagIds(file));

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
        <div className="flex w-full min-w-0 shrink-0 items-center gap-2">
          <div className={cardTypeIconBoxClass}>
            <Icon className="fill-icon-primary size-5" />
          </div>

          {readOnly ? null : (
            <div
              className="ml-auto flex size-9 shrink-0 items-center justify-center"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <AssignFileTagsPopover file={file} open={tagsOpen} onOpenChange={setTagsOpen}>
                <FileActionsMenu
                  onPreview={openPreview}
                  onRename={() => setRenameOpen(true)}
                  onEditTags={() => setTagsOpen(true)}
                  onShare={isClassroomFile ? undefined : () => setShareOpen(true)}
                  onDelete={() => setDeleteOpen(true)}
                  deleteLabel={isClassroomFile ? t('files.menu.removeFromClassroom') : undefined}
                >
                  <Button
                    className={cardMaterialMenuButtonClass}
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
        </div>

        <p
          className={cn(
            'text-text-primary mt-4 w-full max-w-full min-w-0 overflow-hidden text-base leading-5 font-medium break-words',
            fileTags.length > 0 ? 'line-clamp-1' : 'line-clamp-2',
          )}
          title={displayName}
        >
          {displayName}
        </p>

        <TagChips tags={fileTags} />

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
        title={
          isClassroomFile ? t('files.removeFromClassroom.title') : t('files.deleteConfirm.title')
        }
        description={
          isClassroomFile
            ? t('files.removeFromClassroom.description', { name: displayName })
            : t('files.deleteConfirm.description', { name: displayName })
        }
        confirmLabel={
          isClassroomFile
            ? t('files.removeFromClassroom.confirm')
            : deleteMutation.isPending
              ? t('files.deleteConfirm.deleting')
              : t('files.deleteConfirm.confirm')
        }
        cancelLabel={t('files.deleteConfirm.cancel')}
        onConfirm={() => {
          if (onRemoveFromClassroom) {
            onRemoveFromClassroom(file);
            setDeleteOpen(false);
            return;
          }
          deleteMutation.mutate(file.id);
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};
