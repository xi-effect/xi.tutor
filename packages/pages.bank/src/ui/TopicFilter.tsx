import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverTrigger } from '@xipkg/popover';
import { Search } from '@xipkg/icons';
import type { MathBankCatalogItem } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { FilterChip } from './FilterChip';
import { FilterOption } from './FilterOption';
import { FilterActions, FilterPopoverContent, filterScrollAreaClass } from './FilterActions';

type TopicFilterProps = {
  value: string[];
  grades: number[];
  catalog: MathBankCatalogItem[];
  isLoading?: boolean;
  onChange: (topics: string[]) => void;
};

export const TopicFilter = ({
  value,
  grades,
  catalog,
  isLoading = false,
  onChange,
}: TopicFilterProps) => {
  const { t } = useTranslation('mathBank');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<string[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setSearch('');
    }
  }, [open, value]);

  const topics = useMemo(() => {
    const names = new Set<string>();
    for (const item of catalog) {
      if (grades.length > 0 && !grades.includes(item.grade)) {
        continue;
      }
      names.add(item.topic);
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [catalog, grades]);

  const query = search.trim().toLocaleLowerCase('ru-RU');
  const visible = query
    ? topics.filter((topic) => topic.toLocaleLowerCase('ru-RU').includes(query))
    : topics;

  const toggleTopic = (topic: string) => {
    setDraft((current) =>
      current.includes(topic) ? current.filter((name) => name !== topic) : [...current, topic],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterChip open={open} selected={value.length > 0} umamiEvent="math-bank-topic-filter">
          {value.length > 0
            ? t('filters.topic.chipCount', { count: value.length })
            : t('filters.topic.chip')}
        </FilterChip>
      </PopoverTrigger>
      <FilterPopoverContent>
        <div className="border-border-control flex h-9 w-full shrink-0 items-center gap-1 rounded-lg border px-2">
          <Search className="fill-icon-secondary size-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('filters.topic.searchPlaceholder')}
            className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 outline-none"
          />
        </div>
        <div className={filterScrollAreaClass}>
          {topics.length === 0 ? (
            <p className="text-s-base text-text-secondary leading-5">
              {isLoading ? t('filters.topic.loading') : t('filters.topic.none')}
            </p>
          ) : visible.length === 0 ? (
            <p className="text-s-base text-text-secondary leading-5">{t('filters.topic.empty')}</p>
          ) : (
            visible.map((topic) => (
              <FilterOption
                key={topic}
                variant="checkbox"
                selected={draft.includes(topic)}
                onSelect={() => toggleTopic(topic)}
                umamiEvent="math-bank-topic-option"
                umamiScope={topic}
              >
                {topic}
              </FilterOption>
            ))
          )}
        </div>
        <FilterActions
          canReset={draft.length > 0}
          onReset={() => setDraft([])}
          onApply={() => {
            onChange(draft);
            setOpen(false);
          }}
          resetUmami="math-bank-topic-reset"
          applyUmami="math-bank-topic-apply"
        />
      </FilterPopoverContent>
    </Popover>
  );
};
