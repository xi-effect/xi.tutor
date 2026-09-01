import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, Settings } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import {
  TAG_KIND,
  type TagSchema,
  useAutocompleteTags,
  useGenericTagsCatalog,
  useLibraryTagsManage,
} from 'common.services';
import { TagDot } from 'common.ui';

export type AssignGenericTagsPopoverLabels = {
  title: string;
  searchPlaceholder: string;
  loading: string;
  none: string;
  empty: string;
  manage: string;
};

export type AssignGenericTagsPopoverProps = {
  tagIds: number[];
  tags: TagSchema[];
  maxCount: number;
  isPending?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (tagIds: number[]) => void;
  labels: AssignGenericTagsPopoverLabels;
  children: ReactNode;
};

const SAVE_IDLE_MS = 30_000;

const sameTagIds = (left: number[], right: number[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort((a, b) => a - b);
  const sortedRight = [...right].sort((a, b) => a - b);
  return sortedLeft.every((id, index) => id === sortedRight[index]);
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

export const AssignGenericTagsPopover = ({
  tagIds,
  tags,
  maxCount,
  open,
  onOpenChange,
  onChange,
  labels,
  children,
}: AssignGenericTagsPopoverProps) => {
  const [search, setSearch] = useState('');
  const [draftIds, setDraftIds] = useState(tagIds);
  const { openManage } = useLibraryTagsManage();
  const { tags: catalog } = useGenericTagsCatalog();
  const query = search.trim();
  const { data, isLoading: isSearchLoading } = useAutocompleteTags(
    TAG_KIND.Generic,
    query,
    20,
    !open || query.length < 1,
  );

  const wasOpenRef = useRef(open);
  const draftIdsRef = useRef(draftIds);
  const savedIdsRef = useRef(tagIds);
  const pendingIdsRef = useRef<number[] | null>(null);
  const onChangeRef = useRef(onChange);
  draftIdsRef.current = draftIds;
  savedIdsRef.current = tagIds;
  onChangeRef.current = onChange;

  const flushSave = useCallback(() => {
    const nextIds = draftIdsRef.current;
    if (sameTagIds(nextIds, savedIdsRef.current)) {
      return;
    }
    if (pendingIdsRef.current && sameTagIds(nextIds, pendingIdsRef.current)) {
      return;
    }

    pendingIdsRef.current = nextIds;
    onChangeRef.current(nextIds);
  }, []);

  useEffect(() => {
    if (pendingIdsRef.current && sameTagIds(tagIds, pendingIdsRef.current)) {
      pendingIdsRef.current = null;
    }
  }, [tagIds]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraftIds(tagIds);
      pendingIdsRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open, tagIds]);

  useEffect(() => {
    if (!open || sameTagIds(draftIds, tagIds)) {
      return;
    }

    const timer = window.setTimeout(flushSave, SAVE_IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [draftIds, flushSave, open, tagIds]);

  useEffect(() => () => flushSave(), [flushSave]);

  const closePopover = () => {
    setSearch('');
    flushSave();
    onOpenChange(false);
  };

  const assignedIds = draftIds;
  const suggestions = useMemo((): TagSchema[] => (Array.isArray(data) ? data : []), [data]);
  const allTags = useMemo(
    () => mergeTags(catalog, tags, suggestions),
    [catalog, suggestions, tags],
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
    setDraftIds((current) =>
      current.includes(tag.id)
        ? current.filter((id) => id !== tag.id)
        : current.length >= maxCount
          ? current
          : [...current, tag.id],
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        closePopover();
      }}
    >
      <div className="relative flex size-9 items-center justify-center">
        {children}
        {/* Якорь без клика: иначе PopoverTrigger перехватывает троеточие и открывает теги вместо меню. */}
        <PopoverTrigger asChild>
          <span aria-hidden className="pointer-events-none absolute inset-0" />
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="border-border-default bg-background-surface z-100 flex w-80 flex-col overflow-visible rounded-3xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-1 pb-3">
          <p className="text-text-primary text-lg leading-7 font-semibold">{labels.title}</p>
        </div>

        <div className="border-border-control mb-3 flex h-9 w-full items-center gap-1 rounded-xl border px-2">
          <Search className="fill-icon-secondary size-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 outline-none"
          />
        </div>

        <div className="flex max-h-52 min-h-0 w-full shrink flex-col gap-1 overflow-y-auto">
          {allTags.length === 0 && !query ? (
            <p className="text-s-base text-text-secondary py-4 text-center">
              {isSearchLoading ? labels.loading : labels.none}
            </p>
          ) : visibleTags.length === 0 ? (
            <p className="text-s-base text-text-secondary py-4 text-center">
              {isSearchLoading ? labels.loading : labels.empty}
            </p>
          ) : (
            visibleTags.map((tag) => {
              const selected = assignedIds.includes(tag.id);
              const disabled = !selected && assignedIds.length >= maxCount;

              return (
                <button
                  key={tag.id}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={selected}
                  disabled={disabled}
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

        <div className="border-border-default mt-3 shrink-0 border-t pt-3">
          <button
            type="button"
            className={cn(
              'text-text-link flex h-10 w-full cursor-pointer appearance-none items-center gap-2 rounded-lg border-0 bg-transparent px-1 text-sm font-medium shadow-none outline-none',
              'hover:bg-status-info-background focus-visible:bg-status-info-background',
              '[&_svg]:fill-icon-brand',
            )}
            onClick={() => {
              closePopover();
              openManage();
            }}
          >
            <Settings className="fill-icon-brand size-4" />
            {labels.manage}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
