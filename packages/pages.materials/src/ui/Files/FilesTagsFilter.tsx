import { useEffect, useMemo, useState } from 'react';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Search } from '@xipkg/icons';
import { TAG_KIND, useAutocompleteTags } from 'common.services';
import type { TagSchema } from 'common.api';
import { useTranslation } from 'react-i18next';
import { MaterialsFilterOption } from '../MaterialsFilterOption';
import { FilesFilterChip } from './FilesFilterChip';
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
        <FilesFilterChip open={open} umamiEvent="materials-files-tags-filter">
          {value.length > 0
            ? t('files.tags.chipCount', { count: value.length })
            : t('files.tags.chip')}
        </FilesFilterChip>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="border-border-default bg-background-surface w-60 rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('files.tags.searchPlaceholder')}
          before={<Search className="fill-icon-secondary size-4" />}
        />
        <div className="mt-4 flex max-h-52 w-full flex-col items-stretch gap-2.5 overflow-y-auto bg-transparent">
          {showHint ? (
            <p className="text-s-base text-text-secondary py-1">{t('files.tags.hint')}</p>
          ) : showEmpty ? (
            <p className="text-s-base text-text-secondary py-1">{t('files.tags.empty')}</p>
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
        <div className="border-border-default mt-4 flex items-center justify-between border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            className="text-s-base text-text-secondary h-auto px-3 py-2 font-medium"
            onClick={() => setDraft([])}
            data-umami-event="materials-files-tags-reset"
          >
            {t('files.reset')}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="text-s-base h-auto rounded-lg px-4 py-2 font-medium"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
            data-umami-event="materials-files-tags-apply"
          >
            {t('files.apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
