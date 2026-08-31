import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Search } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import {
  TAG_ASSIGN_MAX_COUNT,
  TAG_KIND,
  type TagSchema,
  useAutocompleteTags,
  useSetMaterialTags,
} from 'common.services';
import { TagDot } from 'common.ui';

type AssignMaterialTagsPopoverProps = {
  materialId: string;
  tags: TagSchema[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export const AssignMaterialTagsPopover = ({
  materialId,
  tags,
  open,
  onOpenChange,
  children,
}: AssignMaterialTagsPopoverProps) => {
  const { t } = useTranslation('materialsCard');
  const [search, setSearch] = useState('');
  const setTags = useSetMaterialTags();
  const query = search.trim();
  const { data, isLoading: isSearchLoading } = useAutocompleteTags(
    TAG_KIND.Generic,
    query,
    20,
    !open || query.length < 1,
  );

  const assignedIds = useMemo(() => tags.map((tag) => tag.id), [tags]);
  const suggestions = useMemo((): TagSchema[] => (Array.isArray(data) ? data : []), [data]);

  const visibleTags = useMemo(() => {
    if (!query) {
      return tags;
    }
    return suggestions;
  }, [query, suggestions, tags]);

  const toggleTag = (tag: TagSchema) => {
    const nextIds = assignedIds.includes(tag.id)
      ? assignedIds.filter((id) => id !== tag.id)
      : assignedIds.length >= TAG_ASSIGN_MAX_COUNT
        ? assignedIds
        : [...assignedIds, tag.id];

    setTags.mutate({ materialId, tagIds: nextIds });
  };

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
      <PopoverTrigger asChild>
        <div className="flex size-8 items-center justify-center">{children}</div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="border-border-default bg-background-surface z-100 flex w-80 flex-col rounded-3xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-1 pb-3">
          <p className="text-text-primary text-lg leading-7 font-semibold">{t('tags.title')}</p>
        </div>

        <div className="border-border-control mb-3 flex h-9 w-full items-center gap-1 rounded-xl border px-2">
          <Search className="fill-icon-secondary size-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('tags.searchPlaceholder')}
            className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 outline-none"
          />
        </div>

        <div className="flex max-h-52 w-full flex-col gap-1 overflow-y-auto">
          {visibleTags.length === 0 ? (
            <p className="text-s-base text-text-secondary py-4 text-center">
              {isSearchLoading ? t('tags.loading') : t('tags.empty')}
            </p>
          ) : (
            visibleTags.map((tag) => {
              const selected = assignedIds.includes(tag.id);
              const disabled = !selected && assignedIds.length >= TAG_ASSIGN_MAX_COUNT;

              return (
                <button
                  key={tag.id}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={selected}
                  disabled={disabled || setTags.isPending}
                  className="hover:bg-background-subtle flex h-10 w-full cursor-pointer appearance-none items-center gap-3 rounded-lg border-0 bg-transparent px-1 text-left shadow-none disabled:cursor-default disabled:opacity-50"
                  onClick={() => toggleTag(tag)}
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
      </PopoverContent>
    </Popover>
  );
};
