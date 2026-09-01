import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Search } from '@xipkg/icons';
import { TAG_FILTER_MAX_COUNT, type TagSchema } from 'common.api';
import { useGenericTagsCatalog } from 'common.services';
import { useTranslation } from 'react-i18next';
import { MaterialsFilterOption } from '../MaterialsFilterOption';
import { FilesFilterChip } from './FilesFilterChip';
import { FilesFilterActions, filesFilterPopoverClass } from './FilesFilterActions';
import { TagDot } from 'common.ui';
import { useGenericTagSuggestions } from './tags/useGenericTagSuggestions';
import type { FilesTagOptionT } from '../../types';

type FilesTagsFilterProps = {
  value: FilesTagOptionT[];
  onChange: (tags: FilesTagOptionT[]) => void;
  maxCount?: number;
};

const mergeTags = (...lists: TagSchema[][]): TagSchema[] => {
  const byId = new Map<number, TagSchema>();
  for (const list of lists) {
    for (const tag of list) {
      byId.set(tag.id, tag);
    }
  }
  return [...byId.values()];
};

export const FilesTagsFilter = ({
  value,
  onChange,
  maxCount = TAG_FILTER_MAX_COUNT,
}: FilesTagsFilterProps) => {
  const { t } = useTranslation('materials');
  const { tags: catalog } = useGenericTagsCatalog();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<FilesTagOptionT[]>(value);
  const query = search.trim();
  const { suggestions, isLoading: isSearchLoading } = useGenericTagSuggestions(search, open);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setSearch('');
    }
  }, [open, value]);

  const selectedTags = useMemo(
    () =>
      value.flatMap((tag): TagSchema[] =>
        Number.isInteger(tag.id)
          ? [
              {
                id: tag.id,
                name: tag.name,
                color: (tag.color as TagSchema['color']) ?? 'blue',
              },
            ]
          : [],
      ),
    [value],
  );

  const allTags = useMemo(
    () => mergeTags(catalog, suggestions, selectedTags),
    [catalog, selectedTags, suggestions],
  );

  const visibleTags = useMemo(() => {
    if (!query) {
      return allTags;
    }
    const needle = query.toLowerCase();
    const fromCatalog = allTags.filter((tag) => tag.name.toLowerCase().includes(needle));
    return mergeTags(fromCatalog, suggestions);
  }, [allTags, query, suggestions]);

  const toggleTag = (tag: TagSchema) => {
    setDraft((current) => {
      if (current.some((item) => item.id === tag.id)) {
        return current.filter((item) => item.id !== tag.id);
      }
      if (current.length >= maxCount) {
        return current;
      }
      return [...current, { id: tag.id, name: tag.name, color: tag.color }];
    });
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
          {allTags.length === 0 && !query ? (
            <p className="text-s-base text-text-secondary leading-5">
              {isSearchLoading ? t('files.tags.loading') : t('files.tags.none')}
            </p>
          ) : visibleTags.length === 0 ? (
            <p className="text-s-base text-text-secondary leading-5">
              {isSearchLoading ? t('files.tags.loading') : t('files.tags.empty')}
            </p>
          ) : (
            visibleTags.map((tag) => (
              <MaterialsFilterOption
                key={tag.id}
                variant="checkbox"
                selected={draft.some((item) => item.id === tag.id)}
                onSelect={() => toggleTag(tag)}
                umamiEvent="materials-files-tag-option"
                umamiScope={String(tag.id)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <TagDot color={tag.color} />
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
