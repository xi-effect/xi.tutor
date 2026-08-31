import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { Check, Search, Settings } from '@xipkg/icons';
import { Popover, PopoverContent } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import type { LibraryFile } from 'common.api';
import { matchesSearchQuery } from 'common.utils';
import { getLibraryFileDisplayName } from '../../../utils';
import { TagDot } from 'common.ui';
import { useLibraryTagsManage } from './libraryTagsUiStore';
import { useGenericTagSuggestions } from './useGenericTagSuggestions';
import { useLibraryTags } from './useLibraryTags';

type AssignFileTagsPopoverProps = {
  file: LibraryFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export const AssignFileTagsPopover = ({
  file,
  open,
  onOpenChange,
  children,
}: AssignFileTagsPopoverProps) => {
  const { t } = useTranslation('materials');
  const { tags, fileTagIds, toggleFileTag } = useLibraryTags();
  const { openManage } = useLibraryTagsManage();
  const [search, setSearch] = useState('');
  const { isLoading: isSearchLoading } = useGenericTagSuggestions(search, open);
  const displayName = getLibraryFileDisplayName(file);
  const assignedIds = fileTagIds[file.id] ?? [];

  const visibleTags = useMemo(() => {
    const query = search.trim();
    if (!query) {
      return tags;
    }

    return tags.filter((tag) => matchesSearchQuery(tag.name, query));
  }, [search, tags]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSearch('');
        }

        onOpenChange(next);
      }}
    >
      <PopoverAnchor asChild>
        <div className="flex size-8 items-center justify-center">{children}</div>
      </PopoverAnchor>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="border-border-default bg-background-surface z-100 flex w-80 flex-col rounded-3xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-1 pb-3">
          <p className="text-text-primary text-lg leading-7 font-semibold">
            {t('files.assignTags.title')}
          </p>
          <p className="text-text-secondary truncate text-sm leading-5" title={displayName}>
            {displayName}
          </p>
        </div>

        <div className="border-border-control mb-3 flex h-9 w-full items-center gap-1 rounded-xl border px-2">
          <Search className="fill-icon-secondary size-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('files.tags.searchPlaceholder')}
            className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 outline-none"
          />
        </div>

        <div className="flex max-h-52 w-full flex-col gap-1 overflow-y-auto">
          {tags.length === 0 && !search.trim() ? (
            <p className="text-s-base text-text-secondary py-4 text-center">
              {isSearchLoading ? t('files.tags.loading') : t('files.assignTags.none')}
            </p>
          ) : visibleTags.length === 0 ? (
            <p className="text-s-base text-text-secondary py-4 text-center">
              {isSearchLoading ? t('files.tags.loading') : t('files.tags.empty')}
            </p>
          ) : (
            visibleTags.map((tag) => {
              const selected = assignedIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={selected}
                  className="hover:bg-background-subtle flex h-10 w-full cursor-pointer appearance-none items-center gap-3 rounded-lg border-0 bg-transparent px-1 text-left shadow-none"
                  onClick={() => toggleFileTag(file.id, tag.id)}
                  data-umami-event="materials-file-toggle-tag"
                  data-umami-event-tag={tag.id}
                >
                  <TagDot color={tag.color} />
                  <span className="text-text-primary min-w-0 flex-1 truncate text-sm leading-5">
                    {tag.name}
                  </span>
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-md border bg-transparent',
                      selected
                        ? 'border-border-focus bg-action-primary-background-default'
                        : 'border-border-control',
                    )}
                  >
                    {selected ? <Check className="fill-background-surface size-3.5" /> : null}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-border-default mt-3 border-t pt-3">
          <button
            type="button"
            className={cn(
              'text-text-link flex h-10 w-full cursor-pointer appearance-none items-center gap-2 rounded-lg border-0 bg-transparent px-1 text-sm font-medium shadow-none outline-none',
              'hover:bg-status-info-background focus-visible:bg-status-info-background',
              '[&_svg]:fill-icon-brand',
            )}
            onClick={() => {
              onOpenChange(false);
              setSearch('');
              openManage();
            }}
            data-umami-event="materials-tags-manage-open"
          >
            <Settings className="fill-icon-brand size-4" />
            {t('files.assignTags.manage')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
