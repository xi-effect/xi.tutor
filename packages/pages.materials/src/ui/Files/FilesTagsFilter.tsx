import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Search } from '@xipkg/icons';
import { TAG_KIND, useAutocompleteTags } from 'common.services';
import type { TagSchema } from 'common.api';
import { useTranslation } from 'react-i18next';
import { MaterialsFilterOption } from '../MaterialsFilterOption';
import { FilesFilterChip } from './FilesFilterChip';
import { FilesFilterActions, filesFilterPopoverClass } from './FilesFilterActions';
import type { FilesTagOptionT } from '../../types';

type FilesTagsFilterProps = {
  value: FilesTagOptionT[];
  onChange: (tags: FilesTagOptionT[]) => void;
};

const toTagOption = (tag: TagSchema | FilesTagOptionT): FilesTagOptionT => ({
  id: tag.id,
  name: tag.name,
});

export const FilesTagsFilter = ({ value, onChange }: FilesTagsFilterProps) => {
  const { t } = useTranslation('materials');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<FilesTagOptionT[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setSearch('');
    }
  }, [open, value]);

  const { data, isLoading } = useAutocompleteTags(
    TAG_KIND.Generic,
    search,
    10,
    !open || search.trim().length < 1,
  );

  const suggestions = useMemo(() => {
    const list = Array.isArray(data) ? data.map(toTagOption) : [];
    const byId = new Map(list.map((tag) => [tag.id, tag]));
    draft.forEach((tag) => {
      if (!byId.has(tag.id)) {
        byId.set(tag.id, tag);
      }
    });
    return [...byId.values()];
  }, [data, draft]);

  const visibleTags = search.trim().length < 1 ? draft : suggestions;
  const showHint = search.trim().length < 1 && draft.length === 0;
  const showEmpty = search.trim().length >= 1 && !isLoading && suggestions.length === 0;

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
          {showHint ? (
            <p className="text-s-base text-text-secondary leading-5 whitespace-nowrap">
              {t('files.tags.hint')}
            </p>
          ) : showEmpty ? (
            <p className="text-s-base text-text-secondary leading-5">{t('files.tags.empty')}</p>
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
                {tag.name}
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
