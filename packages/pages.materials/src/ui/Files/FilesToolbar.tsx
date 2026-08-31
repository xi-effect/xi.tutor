import { Button } from '@xipkg/button';
import { Search } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { FilesTypeFilter } from './FilesTypeFilter';
import { FilesTagsFilter } from './FilesTagsFilter';
import { FilesUploaderFilter } from './FilesUploaderFilter';
import { hasActiveFilesFilters } from '../../utils';
import type { FilesFiltersT } from '../../types';

type FilesToolbarProps = {
  filters: FilesFiltersT;
  onChange: (filters: FilesFiltersT) => void;
  onReset: () => void;
};

export const FilesToolbar = ({ filters, onChange, onReset }: FilesToolbarProps) => {
  const { t } = useTranslation('materials');
  const showReset = hasActiveFilesFilters(filters);

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <div className="border-border-control bg-background-surface focus-within:border-border-focus flex h-[33px] w-full items-center gap-2 rounded-full border px-3 sm:w-64">
        <Search className="fill-icon-secondary size-4 shrink-0" />
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder={t('files.searchPlaceholder')}
          className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 font-medium outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <FilesUploaderFilter
          value={filters.uploader}
          onChange={(uploader) => onChange({ ...filters, uploader })}
        />
        <FilesTypeFilter
          value={filters.kinds}
          onChange={(kinds) => onChange({ ...filters, kinds })}
        />
        <FilesTagsFilter value={filters.tags} onChange={(tags) => onChange({ ...filters, tags })} />
        {showReset ? (
          <Button
            type="button"
            variant="ghost"
            className="text-s-base text-text-link hover:text-text-link h-auto px-2 py-1 font-medium"
            onClick={onReset}
            data-umami-event="materials-files-reset-all"
          >
            {t('files.resetAll')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
