import { useEffect, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Eyeon, File, Image, Music, Plus } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import type { FileKind } from 'common.api';
import { getFileTagIds, type LibraryFile, useTagsByIds } from 'common.services';
import { TagChip, getAppLanguage } from 'common.ui';
import { formatFileSize, formatUploadedAt, getLibraryFileDisplayName } from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { boardMenuItemClass, boardMenuSurfaceClass } from '../../boardTheme';

const kindIcon: Record<FileKind, typeof File> = {
  image: Image,
  audio: Music,
  document: File,
  presentation: File,
  uncategorized: File,
};

const MAX_VISIBLE_TAGS = 3;

type CloudFileRowProps = {
  file: LibraryFile;
  disabled?: boolean;
  previewOpen?: boolean;
  onPreview: (file: LibraryFile) => void;
  onAdd: (file: LibraryFile) => void;
};

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

export const CloudFileRow = ({
  file,
  disabled,
  previewOpen,
  onPreview,
  onAdd,
}: CloudFileRowProps) => {
  const { t } = useTranslation('materials');
  const { t: tBoard } = useTranslation('board');
  const { tags: fileTags } = useTagsByIds(getFileTagIds(file));
  const visibleTags = fileTags.slice(0, MAX_VISIBLE_TAGS);
  const [hovered, setHovered] = useState(false);
  const displayName = getLibraryFileDisplayName(file);
  const Icon = kindIcon[file.kind] ?? File;
  const uploadedAt = formatUploadedAt(file.created_at, t('files.today'));
  const size = formatFileSize(file.size_bytes, getAppLanguage());

  useEffect(() => {
    if (!hovered || disabled || previewOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.code !== 'Space') return;
      if (event.defaultPrevented || event.repeat) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      onPreview(file);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, file, hovered, onPreview, previewOpen]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild disabled={disabled}>
        <div
          role="button"
          tabIndex={0}
          aria-disabled={disabled}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => {
            if (!disabled) onAdd(file);
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === 'Enter') {
              event.preventDefault();
              onAdd(file);
              return;
            }
            if (event.key === ' ' || event.code === 'Space') {
              event.preventDefault();
              onPreview(file);
            }
          }}
          data-umami-event="board-cloud-file-add"
          className={cn(
            'hover:bg-status-info-background grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 px-3 py-2.5 transition-colors',
            'focus-visible:bg-status-info-background focus-visible:outline-none',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <div className="bg-status-info-background [&>svg]:fill-icon-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Icon className="fill-icon-primary size-4" />
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <span
              className="text-s-base text-text-primary truncate leading-5 font-medium"
              title={displayName}
            >
              {displayName}
            </span>
            {visibleTags.length > 0 ? (
              <div className="flex min-w-0 flex-wrap items-center gap-1">
                {visibleTags.map((tag) => (
                  <TagChip key={tag.id} name={tag.name} color={tag.color} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5 pt-0.5">
            <span className="text-text-secondary text-xs leading-4 whitespace-nowrap">{size}</span>
            <span className="text-text-secondary text-xs leading-4 whitespace-nowrap">
              {uploadedAt}
            </span>
          </div>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className={cn(boardMenuSurfaceClass, 'z-48 min-w-48 rounded-2xl p-2 outline-none')}
        >
          <ContextMenu.Item
            className={cn(
              boardMenuItemClass,
              'data-highlighted:bg-status-info-background flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none select-none',
            )}
            onSelect={() => onPreview(file)}
            data-umami-event="board-cloud-file-preview-menu"
          >
            <Eyeon className="fill-icon-secondary size-4 shrink-0" />
            {tBoard('navbar.cloudPreview')}
          </ContextMenu.Item>
          <ContextMenu.Item
            className={cn(
              boardMenuItemClass,
              'data-highlighted:bg-status-info-background flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none select-none',
            )}
            onSelect={() => onAdd(file)}
            data-umami-event="board-cloud-file-add-menu"
          >
            <Plus className="fill-icon-brand size-4 shrink-0" />
            {tBoard('navbar.cloudAddToBoard')}
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
