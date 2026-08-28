import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Search } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { matchesSearchQuery } from 'common.utils';
import { useTranslation } from 'react-i18next';
import { MaterialsFilterOption } from '../MaterialsFilterOption';
import { FilesFilterChip } from './FilesFilterChip';
import { FilesFilterActions, filesFilterPopoverClass } from './FilesFilterActions';
import { getTagColor } from './tags/tagColors';
import { useLibraryTags } from './tags/useLibraryTags';
import type { FilesTagOptionT } from '../../types';

type FilesTagsFilterProps = {
  value: FilesTagOptionT[];
  onChange: (tags: FilesTagOptionT[]) => void;
};

export const FilesTagsFilter = ({ value, onChange }: FilesTagsFilterProps) => {
  const { t } = useTranslation('materials');
  const { tags } = useLibraryTags();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<FilesTagOptionT[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setSearch('');
    }
  }, [open, value]);

  const visibleTags = useMemo(() => {
    const query = search.trim();
    return query ? tags.filter((tag) => matchesSearchQuery(tag.name, query)) : tags;
  }, [search, tags]);

  const toggleTag = (tag: FilesTagOptionT) => {
    setDraft((current) =>
      current.some((item) => item.id === tag.id)
        ? current.filter((item) => item.id !== tag.id)
        : [...current, tag],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilesFilterChip
          open={open}
          selected={value.length > 0}
          umamiEvent="materials-files-tags-filter"
        >
          {value.length > 0
            ? t('files.tags.chipCount', { count: value.length })
            : t('files.tags.chip')}
        </FilesFilterChip>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className={filesFilterPopoverClass}>
        <div className="border-border-control flex h-9 w-full items-center gap-1 rounded-lg border px-2">
          <Search className="fill-icon-secondary size-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('files.tags.searchPlaceholder')}
            className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 outline-none"
          />
        </div>
        <div className="flex max-h-52 w-full min-w-0 flex-col items-stretch gap-2.5 overflow-y-auto bg-transparent">
          {tags.length === 0 ? (
            <p className="text-s-base text-text-secondary leading-5">{t('files.tags.none')}</p>
          ) : visibleTags.length === 0 ? (
            <p className="text-s-base text-text-secondary leading-5">{t('files.tags.empty')}</p>
          ) : (
            visibleTags.map((tag) => (
              <MaterialsFilterOption
                key={tag.id}
                variant="checkbox"
                selected={draft.some((item) => item.id === tag.id)}
                onSelect={() => toggleTag({ id: tag.id, name: tag.name })}
                umamiEvent="materials-files-tag-option"
                umamiScope={tag.id}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn('size-2.5 shrink-0 rounded-full', getTagColor(tag.color).dot)}
                  />
                  <span className="truncate">{tag.name}</span>
                </span>
              </MaterialsFilterOption>
            ))
          )}
        </div>
        <FilesFilterActions
          canReset={draft.length > 0}
          onReset={() => setDraft([])}
          onApply={() => {
            onChange(draft);
            setOpen(false);
          }}
          resetUmami="materials-files-tags-reset"
          applyUmami="materials-files-tags-apply"
        />
      </PopoverContent>
    </Popover>
  );
};
