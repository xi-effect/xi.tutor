import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
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
      <div className="w-full sm:w-64">
        <Input
          variant="m"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder={t('files.searchPlaceholder')}
          before={<Search className="fill-icon-secondary" />}
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
            className="text-s-base text-text-secondary h-auto px-2 py-1 font-medium"
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
